import { useState, useEffect, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { supabaseClient } from "../../lib/supabaseClient";

const IMG_BASE =
  "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos";

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ProductoFlyer {
  id: number;
  codigo: number;
  descripcion: string;
  precio: string;
}

interface ResultadoBusqueda {
  codigo: number;
  descripcion: string;
  precio: number;
}

let nextId = 1;

const SIZES = [
  { img: 320, desc: 22, cod: 14, price: 38 }, // 1 producto
  { img: 240, desc: 18, cod: 13, price: 32 }, // 2 productos
  { img: 180, desc: 15, cod: 11, price: 26 }, // 3 productos
  { img: 150, desc: 13, cod: 10, price: 22 }, // 4 productos
  { img: 120, desc: 12, cod: 10, price: 19 }, // 5 productos
];

function FlyerRow({ producto, count }: { producto: ProductoFlyer; count: number }) {
  const [imgError, setImgError] = useState(false);
  const src = `${IMG_BASE}/${producto.codigo}.png`;
  const s = SIZES[Math.min(count - 1, 4)];

  return (
    <div className="may-flyer-row" style={{ flex: 1 }}>
      <div className="may-flyer-row__img-wrap" style={{ height: s.img, flexShrink: 0 }}>
        {imgError ? (
          <div className="may-flyer-row__img-placeholder" style={{ height: s.img }} />
        ) : (
          <img
            src={src}
            alt={producto.descripcion}
            className="may-flyer-row__img"
            style={{ height: s.img }}
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="may-flyer-row__bottom">
        <span className="may-flyer-row__desc" style={{ fontSize: s.desc }}>{producto.descripcion.toUpperCase()}</span>
        <span className="may-flyer-row__precio" style={{ fontSize: s.price }}>${producto.precio || "—"}</span>
      </div>
    </div>
  );
}


export default function GeneradorFlyer() {
  const [productos, setProductos] = useState<ProductoFlyer[]>([]);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [descargando, setDescargando] = useState(false);

  const flyerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscar = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResultados([]);
      setDropdownOpen(false);
      return;
    }
    setBuscando(true);
    const { data } = await supabaseClient
      .from("articulos_mayorista")
      .select('"Cod. Art", "Descripcion", "Precio Vta Final"')
      .ilike("Descripcion", `%${q.trim()}%`)
      .limit(20);
    setBuscando(false);
    if (data) {
      const mapped: ResultadoBusqueda[] = data.map((r: Record<string, unknown>) => ({
        codigo: r["Cod. Art"] as number,
        descripcion: r["Descripcion"] as string,
        precio: r["Precio Vta Final"] as number,
      }));
      setResultados(mapped);
      setDropdownOpen(true);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(query), 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, buscar]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function seleccionar(r: ResultadoBusqueda) {
    if (productos.length >= 5) return;
    const nuevo: ProductoFlyer = {
      id: nextId++,
      codigo: r.codigo,
      descripcion: r.descripcion,
      precio: fmt(r.precio),
    };
    setProductos(prev => [...prev, nuevo]);
    setQuery("");
    setResultados([]);
    setDropdownOpen(false);
  }

  function remover(id: number) {
    setProductos(prev => prev.filter(p => p.id !== id));
  }

  function actualizarPrecio(id: number, valor: string) {
    setProductos(prev =>
      prev.map(p => (p.id === id ? { ...p, precio: valor } : p))
    );
  }

  async function descargar() {
    if (!flyerRef.current || productos.length === 0) return;
    setDescargando(true);
    try {
      const dataUrl = await toPng(flyerRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "flyer_alzo.png";
      link.href = dataUrl;
      link.click();
    } finally {
      setDescargando(false);
    }
  }

  const maxAlcanzado = productos.length >= 5;

  return (
    <div className="may-page">
      <div className="may-card">
        <p className="may-card__title">Generador de Flyers</p>

        {productos.length > 0 && (
          <div className="may-flyer-chips">
            {productos.map(p => (
              <div key={p.id} className="may-flyer-chip">
                <span className="may-flyer-chip__desc">{p.descripcion}</span>
                <input
                  className="may-flyer-chip__precio"
                  value={p.precio}
                  onChange={e => actualizarPrecio(p.id, e.target.value)}
                  placeholder="Precio"
                />
                <button
                  className="may-flyer-chip__remove"
                  onClick={() => remover(p.id)}
                  aria-label="Quitar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {!maxAlcanzado && (
          <div className="may-buscador-wrap" ref={wrapperRef}>
            <div className="may-buscador-input-wrap">
              <span className="may-buscador-icon">🔍</span>
              <input
                className="may-buscador-input"
                placeholder="Buscar producto para agregar al flyer…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => { if (resultados.length > 0) setDropdownOpen(true); }}
              />
              {buscando && <span className="rep-spinner" style={{ marginRight: 4 }} />}
              {query && (
                <button
                  className="may-buscador-clear"
                  onClick={() => { setQuery(""); setResultados([]); setDropdownOpen(false); }}
                >
                  ✕
                </button>
              )}
            </div>
            {dropdownOpen && (
              <div className="may-buscador-dropdown">
                {resultados.length === 0 ? (
                  <div className="may-buscador-empty">Sin resultados</div>
                ) : (
                  resultados.map(r => (
                    <button
                      key={r.codigo}
                      className="may-buscador-item"
                      onMouseDown={() => seleccionar(r)}
                    >
                      <span className="may-buscador-item__name">{r.descripcion}</span>
                      <span className="may-buscador-item__meta">
                        <span className="may-buscador-item__cod">COD. {r.codigo}</span>
                        <span className="may-buscador-item__price">${fmt(r.precio)}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {maxAlcanzado && (
          <p className="may-flyer-max-hint">Máximo de 5 productos alcanzado.</p>
        )}
      </div>

      <div className="may-flyer-canvas-wrap">
        <div
          ref={flyerRef}
          className="may-flyer-canvas"
          style={{ width: 540, height: 960 }}
        >
          <img
            src="/img/247/baseFlyer.png"
            alt=""
            className="may-flyer-base"
            crossOrigin="anonymous"
          />

          <div className="may-flyer-products">
            {productos.length === 0 ? (
              <div className="may-flyer-empty-hint">
                Agregá productos para previsualizar el flyer
              </div>
            ) : (
              productos.map(p => <FlyerRow key={p.id} producto={p} count={productos.length} />)
            )}
          </div>
        </div>
      </div>

      <div className="may-flyer-actions">
        <button
          className={`may-btn-cargar${productos.length === 0 || descargando ? " may-btn-cargar--disabled" : ""}`}
          onClick={descargar}
          disabled={productos.length === 0 || descargando}
        >
          {descargando ? (
            <>
              <span className="rep-spinner" style={{ width: 14, height: 14, marginRight: 8, verticalAlign: "middle" }} />
              Generando…
            </>
          ) : (
            "Descargar Flyer"
          )}
        </button>
      </div>
    </div>
  );
}
