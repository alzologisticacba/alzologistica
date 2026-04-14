// src/components/mayorista/MapaVentas.tsx
import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

// ─── Paleta Power BI ────────────────────────────────────────
const COLORES_PBI = [
  "#118DFF", "#E66C37", "#6B007B", "#E044A7",
  "#744EC2", "#D9B300", "#D64550", "#00B7C3",
  "#10B46D", "#F4511E",
];

function emailToColor(email: string): string {
  let hash = 0;
  for (const c of email) hash = (Math.imul(31, hash) + c.charCodeAt(0)) | 0;
  return COLORES_PBI[Math.abs(hash) % COLORES_PBI.length];
}

// ─── Tipos ──────────────────────────────────────────────────
interface Visita {
  id: string;
  usuario: string;
  lat: number;
  lng: number;
  etiqueta: string | null;
  created_at: string;
}

interface Props {
  usuario: string;
}

// ─── Íconos SVG inline ──────────────────────────────────────
function IconGPS() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <circle cx="12" cy="12" r="8" strokeOpacity="0.4" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

// ─── Componente ─────────────────────────────────────────────
export default function MapaVentas({ usuario }: Props) {
  const mapRef        = useRef<HTMLDivElement>(null);
  const mapInstance   = useRef<any>(null);
  const markersMap    = useRef<Map<string, any>>(new Map());
  const LRef          = useRef<any>(null);
  const visitasRef    = useRef<Visita[]>([]);

  const [visitas,      setVisitas]      = useState<Visita[]>([]);
  const [pendingPos,   setPendingPos]   = useState<{ lat: number; lng: number } | null>(null);
  const pendingMarkerRef = useRef<any>(null);

  const [etiqueta,    setEtiqueta]    = useState("");
  const [guardando,   setGuardando]   = useState(false);
  const [ubicandoGPS, setUbicandoGPS] = useState(false);
  const [errorMsg,    setErrorMsg]    = useState("");

  // ─── Init Leaflet ──────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then((mod) => {
      const Lf = mod.default ?? mod;
      LRef.current = Lf;

      const map = Lf.map(mapRef.current!, {
        center: [-31.4135, -64.1811], // Córdoba, Argentina
        zoom: 13,
        zoomControl: true,
      });

      Lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (e: any) => {
        // Quitar marcador provisional anterior
        if (pendingMarkerRef.current) {
          map.removeLayer(pendingMarkerRef.current);
          pendingMarkerRef.current = null;
        }
        const pos = { lat: e.latlng.lat, lng: e.latlng.lng };

        // Marcador provisional (pulsante, color del usuario)
        const miColor = emailToColor(usuario);
        const m = Lf.circleMarker([pos.lat, pos.lng], {
          radius: 11,
          fillColor: miColor,
          color: "#fff",
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.55,
          className: "may-mapa-pending-marker",
        }).addTo(map);
        pendingMarkerRef.current = m;

        setPendingPos(pos);
        setEtiqueta("");
        setErrorMsg("");
      });

      mapInstance.current = map;

      // Renderizar visitas que ya cargaron antes que el mapa estuviera listo
      addMarkersToMap(Lf, map, visitasRef.current);
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Carga inicial + realtime ──────────────────────────────
  useEffect(() => {
    supabaseClient
      .from("visitas_mapa")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        const rows: Visita[] = data ?? [];
        visitasRef.current = rows;
        setVisitas(rows);
      });

    const ch = supabaseClient
      .channel("visitas_mapa_rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visitas_mapa" },
        (p) => {
          const v = p.new as Visita;
          visitasRef.current = [...visitasRef.current, v];
          setVisitas((prev) => [...prev, v]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "visitas_mapa" },
        (p) => {
          const id = (p.old as any).id;
          visitasRef.current = visitasRef.current.filter((x) => x.id !== id);
          setVisitas((prev) => prev.filter((x) => x.id !== id));
        }
      )
      .subscribe();

    return () => { supabaseClient.removeChannel(ch); };
  }, []);

  // ─── Sync markers ──────────────────────────────────────────
  useEffect(() => {
    const map = mapInstance.current;
    const Lf  = LRef.current;
    if (!map || !Lf) return;
    addMarkersToMap(Lf, map, visitas);
    // Eliminar markers de visitas borradas
    markersMap.current.forEach((m, id) => {
      if (!visitas.find((v) => v.id === id)) {
        map.removeLayer(m);
        markersMap.current.delete(id);
      }
    });
  }, [visitas]);

  function addMarkersToMap(Lf: any, map: any, list: Visita[]) {
    list.forEach((v) => {
      if (markersMap.current.has(v.id)) return;
      const color = emailToColor(v.usuario);
      const esMio = v.usuario === usuario;
      const fecha = new Date(v.created_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
      const mapsUrl = `https://www.google.com/maps?q=${v.lat},${v.lng}`;

      const popupHtml = `
        <div class="may-mapa-popup">
          <span class="may-mapa-popup__user" style="color:${color}">${v.usuario.split("@")[0]}</span>
          ${v.etiqueta ? `<span class="may-mapa-popup__label">${v.etiqueta}</span>` : ""}
          <span class="may-mapa-popup__date">${fecha}</span>
          <div class="may-mapa-popup__actions">
            <button id="share-${v.id}" class="may-mapa-popup__share">&#x1F4E4; Compartir</button>
            ${esMio ? `<button id="del-${v.id}" class="may-mapa-popup__del">Eliminar</button>` : ""}
          </div>
        </div>`;

      const m = Lf.circleMarker([v.lat, v.lng], {
        radius: 10,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).bindPopup(popupHtml);

      m.on("popupopen", () => {
        setTimeout(() => {
          // Compartir
          document.getElementById(`share-${v.id}`)?.addEventListener("click", () => {
            const texto = v.etiqueta
              ? `${v.etiqueta} — ${mapsUrl}`
              : `Visita de ${v.usuario.split("@")[0]} — ${mapsUrl}`;
            if (navigator.share) {
              navigator.share({ title: v.etiqueta ?? "Visita", text: texto, url: mapsUrl });
            } else {
              navigator.clipboard.writeText(mapsUrl).then(() => {
                const btn = document.getElementById(`share-${v.id}`);
                if (btn) { btn.textContent = "✓ Copiado!"; setTimeout(() => { btn.textContent = "📤 Compartir"; }, 1800); }
              });
            }
          });
          // Borrar (solo propio)
          if (esMio) {
            document.getElementById(`del-${v.id}`)?.addEventListener("click", () => borrarVisita(v.id));
          }
        }, 50);
      });

      m.addTo(map);
      markersMap.current.set(v.id, m);
    });
  }

  // ─── GPS ───────────────────────────────────────────────────
  function usarGPS() {
    if (!navigator.geolocation) {
      setErrorMsg("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setUbicandoGPS(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        // Quitar marcador provisional anterior
        if (pendingMarkerRef.current && mapInstance.current) {
          mapInstance.current.removeLayer(pendingMarkerRef.current);
          pendingMarkerRef.current = null;
        }
        if (LRef.current && mapInstance.current) {
          const miColor = emailToColor(usuario);
          const m = LRef.current.circleMarker([pos.lat, pos.lng], {
            radius: 11,
            fillColor: miColor,
            color: "#fff",
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.55,
          }).addTo(mapInstance.current);
          pendingMarkerRef.current = m;
        }
        setPendingPos(pos);
        setEtiqueta("");
        setErrorMsg("");
        setUbicandoGPS(false);
        mapInstance.current?.setView([pos.lat, pos.lng], 16);
      },
      () => {
        setErrorMsg("No se pudo obtener tu ubicación. Revisá los permisos.");
        setUbicandoGPS(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  // ─── Guardar visita ────────────────────────────────────────
  async function guardarVisita() {
    if (!pendingPos) return;
    setGuardando(true);
    setErrorMsg("");

    const { error } = await supabaseClient.from("visitas_mapa").insert({
      usuario,
      lat: pendingPos.lat,
      lng: pendingPos.lng,
      etiqueta: etiqueta.trim() || null,
    });

    setGuardando(false);
    if (error) {
      setErrorMsg("No se pudo guardar. Intentá de nuevo.");
      return;
    }
    // Quitar marcador provisional
    if (pendingMarkerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(pendingMarkerRef.current);
      pendingMarkerRef.current = null;
    }
    setPendingPos(null);
    setEtiqueta("");
  }

  function cancelarPending() {
    if (pendingMarkerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(pendingMarkerRef.current);
      pendingMarkerRef.current = null;
    }
    setPendingPos(null);
    setEtiqueta("");
    setErrorMsg("");
  }

  // ─── Borrar visita ─────────────────────────────────────────
  async function borrarVisita(id: string) {
    await supabaseClient.from("visitas_mapa").delete().eq("id", id);
    // El realtime se encarga de actualizar el estado
  }

  // ─── Leyenda ───────────────────────────────────────────────
  const usuariosUnicos = [...new Map(visitas.map((v) => [v.usuario, emailToColor(v.usuario)])).entries()];
  const miColor = emailToColor(usuario);

  return (
    <div className="may-mapa-wrap">

      {/* Toolbar */}
      <div className="may-mapa-toolbar">
        <button
          className="may-mapa-btn-gps"
          onClick={usarGPS}
          disabled={ubicandoGPS}
        >
          {ubicandoGPS
            ? <><span className="may-mapa-spinner" /> Ubicando…</>
            : <><IconGPS /> Usar mi ubicación</>
          }
        </button>
        <span className="may-mapa-hint">
          {pendingPos ? "Confirmá el punto abajo" : "o tocá el mapa para marcar una visita"}
        </span>
      </div>

      {/* Mapa */}
      <div ref={mapRef} className="may-mapa-container" />

      {/* Leyenda */}
      {usuariosUnicos.length > 0 && (
        <div className="may-mapa-leyenda">
          {usuariosUnicos.map(([email, color]) => (
            <div key={email} className="may-mapa-leyenda__item">
              <span className="may-mapa-leyenda__dot" style={{ background: color }} />
              <span className="may-mapa-leyenda__label">{email.split("@")[0]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Panel confirmar punto */}
      {pendingPos && (
        <div className="may-mapa-confirm">
          <div className="may-mapa-confirm__header">
            <span className="may-mapa-confirm__dot" style={{ background: miColor }} />
            <span className="may-mapa-confirm__title">Nueva visita</span>
            <span className="may-mapa-confirm__coords">
              {pendingPos.lat.toFixed(5)}, {pendingPos.lng.toFixed(5)}
            </span>
          </div>

          <input
            className="may-mapa-confirm__input"
            type="text"
            placeholder="Etiqueta (opcional) — ej: Cliente García"
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !guardando && guardarVisita()}
            maxLength={80}
            autoFocus
          />

          {errorMsg && <p className="may-mapa-confirm__error">{errorMsg}</p>}

          <div className="may-mapa-confirm__btns">
            <button
              className="may-mapa-btn-cancel"
              onClick={cancelarPending}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              className="may-mapa-btn-save"
              onClick={guardarVisita}
              disabled={guardando}
              style={{ background: miColor }}
            >
              {guardando
                ? <><span className="may-mapa-spinner" /> Guardando…</>
                : "Guardar visita"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
