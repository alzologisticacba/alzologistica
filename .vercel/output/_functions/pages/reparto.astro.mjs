import { f as createComponent, l as renderHead, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_DeMhYegR.mjs';
import 'piccolore';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useRef, useCallback } from 'react';
import QrScanner from 'qr-scanner';
import { s as supabaseClient } from '../chunks/supabaseClient_Ou7rw0NR.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const BASE = "/api/reparto/digip";
async function get(endpoint, token) {
  const qs = new URLSearchParams({ endpoint });
  const res = await fetch(`${BASE}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Error ${res.status}`);
  }
  return res.json();
}
function getPedidosPorContenedor(numeroContenedor, token) {
  return get(
    `/Pedidos/PorContenedor/${encodeURIComponent(numeroContenedor)}`,
    token
  );
}
function getContenedoresDePedido(codigo, token) {
  return get(
    `/Pedidos/${encodeURIComponent(codigo)}/Contenedores`,
    token
  );
}
function getCliente(codigo, token) {
  return get(`/Clientes/${encodeURIComponent(codigo)}`, token);
}

function getDateRange(periodo) {
  const hoy = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires"
  });
  const [year, month] = hoy.split("-").map(Number);
  if (periodo === "dia") return { start: hoy, end: hoy };
  if (periodo === "mes") {
    const lastDay = new Date(year, month, 0).getDate();
    return {
      start: `${year}-${String(month).padStart(2, "0")}-01`,
      end: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
    };
  }
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}
function AdminDashboard({
  authSession,
  onBack,
  onGoogleLogout
}) {
  const [periodo, setPeriodo] = useState("dia");
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadData();
  }, [periodo]);
  async function loadData() {
    setLoading(true);
    const { start, end } = getDateRange(periodo);
    const { data } = await supabaseClient.from("sesiones_reparto").select(`
        id, fecha, repartidor, patente,
        items_reparto (id, estado, cant_bultos, hora_carga, hora_egreso, cliente_nombre)
      `).gte("fecha", start).lte("fecha", end).order("fecha", { ascending: false });
    setSesiones(data ?? []);
    setLoading(false);
  }
  const allItems = sesiones.flatMap((s) => s.items_reparto);
  const totalPedidos = allItems.length;
  const totalEntregados = allItems.filter((i) => i.estado === "entregado").length;
  const totalPendientes = allItems.filter((i) => i.estado === "pendiente").length;
  const totalBultos = allItems.reduce((sum, i) => sum + i.cant_bultos, 0);
  const bultosEntregados = allItems.filter((i) => i.estado === "entregado").reduce((sum, i) => sum + i.cant_bultos, 0);
  const pctEntregados = totalPedidos > 0 ? Math.round(totalEntregados / totalPedidos * 100) : 0;
  const totalRutas = sesiones.length;
  const byRepartidor = Object.values(
    sesiones.reduce(
      (acc, s) => {
        const key = s.repartidor;
        if (!acc[key]) {
          acc[key] = {
            repartidor: s.repartidor,
            sesiones: 0,
            pedidos: 0,
            entregados: 0,
            pendientes: 0,
            bultos: 0,
            bultosEntregados: 0
          };
        }
        acc[key].sesiones++;
        s.items_reparto.forEach((i) => {
          acc[key].pedidos++;
          acc[key].bultos += i.cant_bultos;
          if (i.estado === "entregado") {
            acc[key].entregados++;
            acc[key].bultosEntregados += i.cant_bultos;
          } else {
            acc[key].pendientes++;
          }
        });
        return acc;
      },
      {}
    )
  ).sort((a, b) => b.pedidos - a.pedidos);
  const periodoLabel = {
    dia: "Hoy",
    mes: "Este mes",
    anio: "Este año"
  };
  return /* @__PURE__ */ jsxs("div", { className: "rep-page", children: [
    /* @__PURE__ */ jsxs("header", { className: "rep-header", children: [
      /* @__PURE__ */ jsxs("div", { className: "rep-header__logo", children: [
        /* @__PURE__ */ jsx("img", { src: "/img/alzo_logo.png", alt: "Alzo" }),
        /* @__PURE__ */ jsx("span", { children: "Administrador" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rep-header__right", children: [
        /* @__PURE__ */ jsx("button", { className: "rep-header__logout", onClick: onBack, children: "Cambiar vista" }),
        /* @__PURE__ */ jsx("button", { className: "rep-header__logout", onClick: onGoogleLogout, children: "Salir" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "rep-main", children: [
      /* @__PURE__ */ jsx("div", { className: "rep-periodo-tabs", children: ["dia", "mes", "anio"].map((p) => /* @__PURE__ */ jsx(
        "button",
        {
          className: `rep-periodo-tab${periodo === p ? " rep-periodo-tab--active" : ""}`,
          onClick: () => setPeriodo(p),
          children: periodoLabel[p]
        },
        p
      )) }),
      loading ? /* @__PURE__ */ jsxs("div", { className: "rep-ocr-processing", style: { paddingTop: 60 }, children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "rep-spinner",
            style: { borderColor: "#dbeafe", borderTopColor: "#2556ff", width: 32, height: 32, borderWidth: 3 }
          }
        ),
        /* @__PURE__ */ jsx("p", { children: "Cargando estadísticas..." })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "rep-admin-summary", children: [
          /* @__PURE__ */ jsxs("div", { className: "rep-admin-card", children: [
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__num", children: totalRutas }),
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__label", children: "Rutas" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rep-admin-card", children: [
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__num", children: totalPedidos }),
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__label", children: "Pedidos" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rep-admin-card rep-admin-card--done", children: [
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__num", children: totalEntregados }),
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__label", children: "Entregados" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rep-admin-card rep-admin-card--pending", children: [
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__num", children: totalPendientes }),
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__label", children: "Pendientes" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rep-admin-card rep-admin-card--highlight", children: [
            /* @__PURE__ */ jsxs("span", { className: "rep-admin-card__num", children: [
              pctEntregados,
              "%"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__label", children: "Completado" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rep-admin-card", children: [
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__num", children: totalBultos }),
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__label", children: "Bultos totales" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rep-admin-card rep-admin-card--done", children: [
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__num", children: bultosEntregados }),
            /* @__PURE__ */ jsx("span", { className: "rep-admin-card__label", children: "Bultos entregados" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "rep-section", children: [
          /* @__PURE__ */ jsxs("h2", { className: "rep-section__title", children: [
            "Por repartidor",
            byRepartidor.length > 0 && /* @__PURE__ */ jsx("span", { className: "rep-section__count", children: byRepartidor.length })
          ] }),
          byRepartidor.length === 0 ? /* @__PURE__ */ jsx("p", { className: "rep-empty", children: "Sin actividad en este período." }) : /* @__PURE__ */ jsx("div", { className: "rep-admin-table-wrap", children: /* @__PURE__ */ jsxs("table", { className: "rep-admin-table", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { children: "Repartidor" }),
              /* @__PURE__ */ jsx("th", { children: "Pedidos" }),
              /* @__PURE__ */ jsx("th", { children: "Entregados" }),
              /* @__PURE__ */ jsx("th", { children: "Pendientes" }),
              /* @__PURE__ */ jsx("th", { children: "Bultos" }),
              /* @__PURE__ */ jsx("th", { children: "Progreso" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: byRepartidor.map((r) => {
              const pct = r.pedidos > 0 ? Math.round(r.entregados / r.pedidos * 100) : 0;
              return /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("td", { className: "rep-admin-table__name", children: r.repartidor }),
                /* @__PURE__ */ jsx("td", { children: r.pedidos }),
                /* @__PURE__ */ jsx("td", { className: "rep-admin-table__done", children: r.entregados }),
                /* @__PURE__ */ jsx("td", { className: r.pendientes > 0 ? "rep-admin-table__pending" : "", children: r.pendientes }),
                /* @__PURE__ */ jsx("td", { children: r.bultos }),
                /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { className: "rep-admin-pct", children: [
                  /* @__PURE__ */ jsx("div", { className: "rep-admin-pct__track", children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "rep-admin-pct__bar",
                      style: { width: `${pct}%` }
                    }
                  ) }),
                  /* @__PURE__ */ jsxs("span", { className: "rep-admin-pct__label", children: [
                    pct,
                    "%"
                  ] })
                ] }) })
              ] }, r.repartidor);
            }) })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}

function detectTipo(p) {
  if (p.length < 2) return null;
  if (/^[A-Z]{2}\d/.test(p)) return "mercosur";
  if (/^[A-Z]{3}/.test(p)) return "vieja";
  return null;
}
function fechaArgentina() {
  return (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires"
  });
}
function horaCorta(iso) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires"
  });
}
function PlateInput({
  value,
  hasError,
  onChange
}) {
  const clean = value.replace(/\s/g, "").toUpperCase();
  const tipo = detectTipo(clean);
  const errorClass = hasError ? " rep-plate--error" : "";
  return /* @__PURE__ */ jsxs("div", { className: `rep-plate rep-plate--${tipo ?? "neutral"}${errorClass}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "rep-plate__header", children: [
      tipo === "mercosur" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "rep-plate__stars", children: "★ ★ ★ ★" }),
        /* @__PURE__ */ jsx("span", { className: "rep-plate__pais", children: "REPÚBLICA ARGENTINA" }),
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/img/arg_flag.png",
            alt: "",
            className: "rep-plate__flag",
            onError: (e) => e.currentTarget.style.display = "none"
          }
        )
      ] }),
      tipo === "vieja" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/img/arg_escudo.png",
            alt: "",
            className: "rep-plate__escudo",
            onError: (e) => e.currentTarget.style.display = "none"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "rep-plate__pais", children: "ARGENTINA" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        id: "patente",
        type: "text",
        className: "rep-plate__input",
        placeholder: "AA111AA",
        value,
        maxLength: 10,
        autoComplete: "off",
        autoCapitalize: "characters",
        spellCheck: false,
        onChange: (e) => onChange(e.target.value.toUpperCase())
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "rep-plate__footer", children: tipo === "mercosur" && "MERCOSUR" })
  ] });
}
const SESSION_KEY = "reparto_session";
function RepartoApp() {
  const [authSession, setAuthSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [role, setRole] = useState(null);
  const [opSession, setOpSession] = useState(null);
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setAuthSession(data.session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_e, s) => {
      setAuthSession(s);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!authSession) return;
    setCheckingAdmin(true);
    supabaseClient.from("admins").select("email").eq("email", authSession.user.email ?? "").maybeSingle().then(({ data }) => {
      setIsAdmin(!!data);
      setCheckingAdmin(false);
    });
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.sesionId) {
          sessionStorage.removeItem(SESSION_KEY);
          return;
        }
        setOpSession(parsed);
      } catch {
      }
    }
  }, [authSession]);
  async function handleGoogleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setOpSession(null);
    setRole(null);
    await supabaseClient.auth.signOut();
  }
  function handleOpLogin(s) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setOpSession(s);
  }
  function handleOpLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setOpSession(null);
  }
  if (authLoading || checkingAdmin) return /* @__PURE__ */ jsx(LoadingScreen, {});
  if (!authSession) return /* @__PURE__ */ jsx(GoogleLoginScreen, {});
  if (isAdmin && !role) return /* @__PURE__ */ jsx(RoleSelector, { onSelect: setRole, onGoogleLogout: handleGoogleLogout });
  if (role === "admin") return /* @__PURE__ */ jsx(AdminDashboard, { authSession, onBack: () => setRole(null), onGoogleLogout: handleGoogleLogout });
  if (!opSession) return /* @__PURE__ */ jsx(LoginScreen, { onLogin: handleOpLogin, onGoogleLogout: handleGoogleLogout });
  return /* @__PURE__ */ jsx(Dashboard, { session: opSession, authToken: authSession.access_token, onLogout: handleOpLogout, onGoogleLogout: handleGoogleLogout });
}
function RoleSelector({ onSelect, onGoogleLogout }) {
  return /* @__PURE__ */ jsx("div", { className: "rep-login-wrap", children: /* @__PURE__ */ jsxs("div", { className: "rep-login-card", children: [
    /* @__PURE__ */ jsx("img", { src: "/img/alzo_logo.png", alt: "Alzo Logística", className: "rep-login-card__logo" }),
    /* @__PURE__ */ jsx("p", { className: "rep-login-card__title", children: "¿Cómo querés ingresar?" }),
    /* @__PURE__ */ jsxs("div", { className: "rep-role-btns", children: [
      /* @__PURE__ */ jsxs("button", { className: "rep-role-btn", onClick: () => onSelect("admin"), children: [
        /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", children: [
          /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }),
          /* @__PURE__ */ jsx("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }),
          /* @__PURE__ */ jsx("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }),
          /* @__PURE__ */ jsx("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "rep-role-btn__title", children: "Administrador" }),
        /* @__PURE__ */ jsx("span", { className: "rep-role-btn__sub", children: "Estadísticas y control" })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "rep-role-btn", onClick: () => onSelect("repartidor"), children: [
        /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", children: [
          /* @__PURE__ */ jsx("path", { d: "M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" }),
          /* @__PURE__ */ jsx("circle", { cx: "5.5", cy: "18.5", r: "2.5" }),
          /* @__PURE__ */ jsx("circle", { cx: "18.5", cy: "18.5", r: "2.5" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "rep-role-btn__title", children: "Repartidor" }),
        /* @__PURE__ */ jsx("span", { className: "rep-role-btn__sub", children: "Control de ruta" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("button", { type: "button", className: "rep-btn-salir-google", onClick: onGoogleLogout, children: "Cerrar sesión de Google" })
  ] }) });
}
function LoadingScreen() {
  return /* @__PURE__ */ jsx("div", { className: "rep-login-wrap", children: /* @__PURE__ */ jsx("span", { className: "rep-spinner", style: { width: 36, height: 36, borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#fff" } }) });
}
function GoogleLoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleGoogle() {
    setLoading(true);
    setError("");
    const { error: error2 } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/reparto` }
    });
    if (error2) {
      setError("No se pudo iniciar sesión. Intentá de nuevo.");
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "rep-login-wrap", children: /* @__PURE__ */ jsxs("div", { className: "rep-login-card", children: [
    /* @__PURE__ */ jsx("img", { src: "/img/alzo_logo.png", alt: "Alzo Logística", className: "rep-login-card__logo" }),
    /* @__PURE__ */ jsx("p", { className: "rep-login-card__title", children: "Herramienta para reparto" }),
    error && /* @__PURE__ */ jsx("p", { style: { color: "#fca5a5", fontSize: 13, fontWeight: 600, marginBottom: 12 }, children: error }),
    /* @__PURE__ */ jsx("button", { className: "rep-btn-google", onClick: handleGoogle, disabled: loading, children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("span", { className: "rep-spinner" }),
      "Redirigiendo..."
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("svg", { width: "20", height: "20", viewBox: "0 0 48 48", fill: "none", children: [
        /* @__PURE__ */ jsx("path", { fill: "#4285F4", d: "M44.5 20H24v8.5h11.8C34.7 33.9 30 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" }),
        /* @__PURE__ */ jsx("path", { fill: "#34A853", d: "M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" }),
        /* @__PURE__ */ jsx("path", { fill: "#FBBC05", d: "M24 46c5.8 0 10.8-1.9 14.8-5.2l-6.8-5.6C29.9 36.8 27.1 38 24 38c-5.9 0-10.9-3.8-12.7-9.1l-7 5.4C7.9 41.5 15.4 46 24 46z" }),
        /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M44.5 20H24v8.5h11.8c-.9 2.8-2.7 5.1-5.1 6.7l6.8 5.6c4-3.7 6.5-9.2 6.5-16.8 0-1.3-.2-2.7-.5-4z" })
      ] }),
      "Iniciar sesión con Google"
    ] }) })
  ] }) });
}
function LoginScreen({ onLogin, onGoogleLogout }) {
  const [patente, setPatente] = useState("");
  const [repartidor, setRepartidor] = useState("");
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");
  const [patenteError, setPatenteError] = useState(false);
  const [selectError, setSelectError] = useState(false);
  useEffect(() => {
    supabaseClient.from("repartidores").select("repartidor").order("repartidor", { ascending: true }).then(({ data }) => {
      setRepartidores(data?.map((r) => r.repartidor) ?? []);
      setLoadingOptions(false);
    });
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPatenteError(false);
    setSelectError(false);
    const patenteClean = patente.trim().replace(/\s+/g, "").toUpperCase();
    if (!patenteClean) {
      setPatenteError(true);
      setError("Ingresá el número de patente.");
      return;
    }
    if (!repartidor) {
      setSelectError(true);
      setError("Seleccioná tu perfil.");
      return;
    }
    setLoading(true);
    const { data: patenteData } = await supabaseClient.from("patentes").select("nroPatente").eq("nroPatente", patenteClean).maybeSingle();
    if (!patenteData) {
      setPatenteError(true);
      setError("Patente no encontrada. Verificá el número ingresado.");
      setLoading(false);
      return;
    }
    const hoy = fechaArgentina();
    const { data: sesionExistente } = await supabaseClient.from("sesiones_reparto").select("id, patente").eq("repartidor", repartidor).eq("fecha", hoy).maybeSingle();
    let sesionId;
    if (sesionExistente) {
      if (sesionExistente.patente !== patenteClean) {
        setError(`${repartidor} ya tiene una sesión activa hoy con la patente ${sesionExistente.patente}.`);
        setLoading(false);
        return;
      }
      sesionId = sesionExistente.id;
    } else {
      const { data: nueva, error: insertError } = await supabaseClient.from("sesiones_reparto").insert({ fecha: hoy, repartidor, patente: patenteClean }).select("id").single();
      if (insertError || !nueva) {
        setError("Error al crear la sesión. Intentá de nuevo.");
        setLoading(false);
        return;
      }
      sesionId = nueva.id;
    }
    setLoading(false);
    onLogin({ repartidor, patente: patenteClean, sesionId });
  }
  return /* @__PURE__ */ jsx("div", { className: "rep-login-wrap", children: /* @__PURE__ */ jsxs("div", { className: "rep-login-card", children: [
    /* @__PURE__ */ jsx("img", { src: "/img/alzo_logo.png", alt: "Alzo Logística", className: "rep-login-card__logo" }),
    /* @__PURE__ */ jsx("p", { className: "rep-login-card__title", children: "Herramienta para reparto" }),
    /* @__PURE__ */ jsxs("form", { className: "rep-form", onSubmit: handleSubmit, noValidate: true, children: [
      /* @__PURE__ */ jsxs("div", { className: "rep-field", children: [
        /* @__PURE__ */ jsx("label", { className: "rep-label", htmlFor: "patente", children: "Número de patente" }),
        /* @__PURE__ */ jsx(
          PlateInput,
          {
            value: patente,
            hasError: patenteError,
            onChange: (v) => {
              setPatenteError(false);
              setError("");
              setPatente(v);
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rep-field", children: [
        /* @__PURE__ */ jsx("label", { className: "rep-label", htmlFor: "repartidor", children: "Seleccioná tu perfil" }),
        /* @__PURE__ */ jsxs("div", { className: "rep-select-wrap", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "repartidor",
              className: `rep-select${selectError ? " rep-select--error" : ""}`,
              value: repartidor,
              disabled: loadingOptions,
              onChange: (e) => {
                setSelectError(false);
                setError("");
                setRepartidor(e.target.value);
              },
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: loadingOptions ? "Cargando..." : "Seleccioná tu perfil" }),
                repartidores.map((r) => /* @__PURE__ */ jsx("option", { value: r, children: r }, r))
              ]
            }
          ),
          /* @__PURE__ */ jsx("svg", { className: "rep-select-icon", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z", clipRule: "evenodd" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "rep-error-msg", children: error }),
      /* @__PURE__ */ jsxs("button", { type: "submit", className: "rep-btn-ingresar", disabled: loading, children: [
        loading && /* @__PURE__ */ jsx("span", { className: "rep-spinner" }),
        loading ? "Verificando..." : "Ingresar"
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "rep-btn-salir-google", onClick: onGoogleLogout, children: "Cerrar sesión de Google" })
    ] })
  ] }) });
}
function QrReader({ onResult, autoOpen = false }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const handledRef = useRef(false);
  const [active, setActive] = useState(autoOpen);
  const [error, setError] = useState("");
  const stop = useCallback(() => {
    scannerRef.current?.stop();
    scannerRef.current?.destroy();
    scannerRef.current = null;
    setActive(false);
  }, []);
  useEffect(() => () => {
    stop();
  }, [stop]);
  useEffect(() => {
    if (!active) {
      handledRef.current = false;
      return;
    }
    if (!videoRef.current) return;
    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        if (handledRef.current) return;
        handledRef.current = true;
        onResult(result.data);
        stop();
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true
      }
    );
    scannerRef.current = scanner;
    scanner.start().catch(() => {
      setError("No se pudo acceder a la cámara. Verificá los permisos.");
      setActive(false);
    });
    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [active, onResult, stop]);
  return /* @__PURE__ */ jsxs("div", { className: "rep-qr-wrap", children: [
    !active ? /* @__PURE__ */ jsxs("button", { className: "rep-qr-btn", onClick: () => {
      setError("");
      setActive(true);
    }, children: [
      /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
        /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }),
        /* @__PURE__ */ jsx("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }),
        /* @__PURE__ */ jsx("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }),
        /* @__PURE__ */ jsx("path", { d: "M14 14h2v2h-2zM14 18h2v2h-2zM18 14h2v2h-2zM18 18h2v2h-2z" })
      ] }),
      "Escanear contenedor"
    ] }) : /* @__PURE__ */ jsxs("div", { className: "rep-qr-scanner", children: [
      /* @__PURE__ */ jsxs("div", { className: "rep-qr-viewfinder", children: [
        /* @__PURE__ */ jsx("video", { ref: videoRef, className: "rep-qr-video", autoPlay: true, playsInline: true, muted: true }),
        /* @__PURE__ */ jsxs("div", { className: "rep-scan-zone rep-scan-zone--square", children: [
          /* @__PURE__ */ jsx("div", { className: "rep-scan-zone__corner rep-scan-zone__corner--tl" }),
          /* @__PURE__ */ jsx("div", { className: "rep-scan-zone__corner rep-scan-zone__corner--tr" }),
          /* @__PURE__ */ jsx("div", { className: "rep-scan-zone__corner rep-scan-zone__corner--bl" }),
          /* @__PURE__ */ jsx("div", { className: "rep-scan-zone__corner rep-scan-zone__corner--br" }),
          /* @__PURE__ */ jsx("div", { className: "rep-scan-zone__line" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "rep-qr-hint", children: "Apuntá al código QR del contenedor" }),
      /* @__PURE__ */ jsx("button", { className: "rep-qr-cancel", onClick: stop, children: "Cancelar" })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "rep-error-msg", style: { marginTop: 8 }, children: error })
  ] });
}
function FinalizarScreen({
  session,
  items,
  onCancel,
  onConfirm
}) {
  const entregados = items.filter((i) => i.estado === "entregado");
  const pendientes = items.filter((i) => i.estado === "pendiente");
  const bultosEntregados = entregados.reduce((sum, i) => sum + i.cant_bultos, 0);
  const totalBultos = items.reduce((sum, i) => sum + i.cant_bultos, 0);
  return /* @__PURE__ */ jsx("div", { className: "rep-finalizar-overlay", children: /* @__PURE__ */ jsxs("div", { className: "rep-finalizar-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "rep-finalizar-header", children: [
      /* @__PURE__ */ jsx("p", { className: "rep-finalizar-fecha", children: (/* @__PURE__ */ new Date()).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Argentina/Buenos_Aires" }) }),
      /* @__PURE__ */ jsx("h2", { className: "rep-finalizar-title", children: "Resumen del día" }),
      /* @__PURE__ */ jsxs("p", { className: "rep-finalizar-sub", children: [
        session.repartidor,
        " · Patente ",
        session.patente
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rep-finalizar-stats", children: [
      /* @__PURE__ */ jsxs("div", { className: "rep-finalizar-stat", children: [
        /* @__PURE__ */ jsx("span", { className: "rep-finalizar-stat__num rep-finalizar-stat__num--done", children: entregados.length }),
        /* @__PURE__ */ jsx("span", { className: "rep-finalizar-stat__label", children: "Entregados" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rep-finalizar-stat", children: [
        /* @__PURE__ */ jsx("span", { className: `rep-finalizar-stat__num${pendientes.length > 0 ? " rep-finalizar-stat__num--pending" : ""}`, children: pendientes.length }),
        /* @__PURE__ */ jsx("span", { className: "rep-finalizar-stat__label", children: "Pendientes" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rep-finalizar-stat", children: [
        /* @__PURE__ */ jsx("span", { className: "rep-finalizar-stat__num", children: totalBultos }),
        /* @__PURE__ */ jsx("span", { className: "rep-finalizar-stat__label", children: "Bultos totales" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rep-finalizar-stat", children: [
        /* @__PURE__ */ jsx("span", { className: "rep-finalizar-stat__num rep-finalizar-stat__num--done", children: bultosEntregados }),
        /* @__PURE__ */ jsx("span", { className: "rep-finalizar-stat__label", children: "Bultos entregados" })
      ] })
    ] }),
    pendientes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rep-finalizar-warning", children: [
      "⚠️ Quedan ",
      pendientes.length,
      " pedido",
      pendientes.length !== 1 ? "s" : "",
      " sin entregar"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rep-finalizar-actions", children: [
      /* @__PURE__ */ jsx("button", { className: "rep-btn-confirmar-finalizar", onClick: onConfirm, children: "Confirmar y finalizar día" }),
      /* @__PURE__ */ jsx("button", { className: "rep-btn-volver", onClick: onCancel, children: "Volver" })
    ] })
  ] }) });
}
function ItemCard({
  item,
  onEntregar,
  isDeliveryTarget,
  onCancelDelivery,
  onCancelEntrega
}) {
  const entregado = item.estado === "entregado";
  return /* @__PURE__ */ jsxs("div", { className: `rep-item-card${entregado ? " rep-item-card--entregado" : ""}${isDeliveryTarget ? " rep-item-card--scanning" : ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "rep-item-card__header", children: [
      /* @__PURE__ */ jsx("span", { className: "rep-item-card__cliente", children: item.cliente_nombre }),
      /* @__PURE__ */ jsx("span", { className: `rep-badge rep-badge--${item.estado}`, children: entregado ? "Entregado" : isDeliveryTarget ? "Escaneando..." : "Pendiente" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rep-item-card__body", children: [
      /* @__PURE__ */ jsxs("span", { className: "rep-item-card__detail", children: [
        /* @__PURE__ */ jsx("span", { className: "rep-item-card__detail-label", children: "Pedido" }),
        item.codigo_pedido
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "rep-item-card__detail", children: [
        /* @__PURE__ */ jsx("span", { className: "rep-item-card__detail-label", children: "Bultos" }),
        item.cant_bultos
      ] })
    ] }),
    entregado ? /* @__PURE__ */ jsxs("div", { className: "rep-item-card__footer rep-item-card__footer--entregado", children: [
      item.hora_egreso && /* @__PURE__ */ jsxs("span", { className: "rep-item-card__hora", children: [
        "✓ Entregado a las ",
        horaCorta(item.hora_egreso)
      ] }),
      /* @__PURE__ */ jsx("button", { className: "rep-btn-cancelar-entrega-sm", onClick: onCancelEntrega, children: "Cancelar entrega" })
    ] }) : isDeliveryTarget ? /* @__PURE__ */ jsx("button", { className: "rep-btn-cancelar-entrega", onClick: onCancelDelivery, children: "Cancelar entrega" }) : /* @__PURE__ */ jsx("button", { className: "rep-btn-entregar-full", onClick: onEntregar, children: "Entregar" })
  ] });
}
function Dashboard({
  session,
  authToken,
  onLogout,
  onGoogleLogout
}) {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingApi, setLoadingApi] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [deliveryTarget, setDeliveryTarget] = useState(null);
  const [bultoMode, setBultoMode] = useState(null);
  const [scannerKey, setScannerKey] = useState(0);
  const [showFinalizar, setShowFinalizar] = useState(false);
  const feedbackTimer = useRef(null);
  const scannerSectionRef = useRef(null);
  useEffect(() => {
    supabaseClient.from("items_reparto").select("*").eq("sesion_id", session.sesionId).order("hora_carga", { ascending: true }).then(({ data }) => {
      setItems(data ?? []);
      setLoadingItems(false);
    });
  }, [session.sesionId]);
  function showFeedback(msg, tipo) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback({ msg, tipo });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3500);
  }
  async function cancelarEntrega(item) {
    const { error } = await supabaseClient.from("items_reparto").update({ estado: "pendiente", hora_egreso: null }).eq("id", item.id);
    if (!error) {
      setItems(
        (prev) => prev.map((i) => i.id === item.id ? { ...i, estado: "pendiente", hora_egreso: null } : i)
      );
      showFeedback(`Entrega cancelada: ${item.cliente_nombre}`, "warn");
    }
  }
  async function marcarEntregado(item) {
    const horaEgreso = (/* @__PURE__ */ new Date()).toISOString();
    const { error } = await supabaseClient.from("items_reparto").update({ estado: "entregado", hora_egreso: horaEgreso }).eq("id", item.id);
    if (!error) {
      setItems(
        (prev) => prev.map((i) => i.id === item.id ? { ...i, estado: "entregado", hora_egreso: horaEgreso } : i)
      );
      showFeedback(`Entregado: ${item.cliente_nombre}`, "ok");
    }
  }
  function scrollToScanner() {
    setTimeout(() => {
      scannerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
  function handleEntregarClick(item) {
    setDeliveryTarget(item);
    setBultoMode(null);
    setScannerKey((k) => k + 1);
    scrollToScanner();
  }
  async function handleScan(contenedor) {
    if (bultoMode) {
      if (contenedor !== bultoMode.contenedor) {
        showFeedback(`Bulto incorrecto. Escaneá uno de ${bultoMode.clienteNombre}.`, "error");
        setScannerKey((k) => k + 1);
        return;
      }
      const siguiente = bultoMode.escaneados + 1;
      if (siguiente < bultoMode.totalBultos) {
        setBultoMode((prev) => prev ? { ...prev, escaneados: siguiente } : null);
        setTimeout(() => setScannerKey((k) => k + 1), 1500);
        return;
      }
      const modoFinal = bultoMode;
      setBultoMode(null);
      setLoadingApi(true);
      try {
        if (modoFinal.tipo === "carga") {
          const { data: nuevo, error: insertError } = await supabaseClient.from("items_reparto").insert({
            sesion_id: session.sesionId,
            contenedor: modoFinal.contenedor,
            codigo_pedido: modoFinal.codigoPedido,
            codigo_cliente: modoFinal.codigoCliente,
            cliente_nombre: modoFinal.clienteNombre,
            cant_bultos: modoFinal.totalBultos,
            estado: "pendiente"
          }).select().single();
          if (!insertError && nuevo) {
            setItems((prev) => [...prev, nuevo]);
            showFeedback(`✓ ${modoFinal.clienteNombre} — ${modoFinal.totalBultos} bultos cargados`, "ok");
          }
        } else if (modoFinal.item) {
          await marcarEntregado(modoFinal.item);
        }
      } catch {
        showFeedback("Error al guardar. Intentá de nuevo.", "error");
      }
      setLoadingApi(false);
      return;
    }
    if (deliveryTarget) {
      if (contenedor !== deliveryTarget.contenedor) {
        showFeedback(`Contenedor incorrecto para ${deliveryTarget.cliente_nombre}.`, "error");
        setDeliveryTarget(null);
        return;
      }
      setDeliveryTarget(null);
      if (deliveryTarget.cant_bultos <= 1) {
        await marcarEntregado(deliveryTarget);
      } else {
        setBultoMode({
          contenedor,
          clienteNombre: deliveryTarget.cliente_nombre,
          totalBultos: deliveryTarget.cant_bultos,
          escaneados: 1,
          tipo: "entrega",
          item: deliveryTarget
        });
        setScannerKey((k) => k + 1);
      }
      return;
    }
    const existing = items.find((i) => i.contenedor === contenedor);
    if (existing) {
      if (existing.estado === "entregado") {
        showFeedback(`Ya estaba entregado: ${existing.cliente_nombre}`, "warn");
        return;
      }
      if (existing.cant_bultos <= 1) {
        await marcarEntregado(existing);
      } else {
        setBultoMode({
          contenedor,
          clienteNombre: existing.cliente_nombre,
          totalBultos: existing.cant_bultos,
          escaneados: 1,
          tipo: "entrega",
          item: existing
        });
        setScannerKey((k) => k + 1);
      }
      return;
    }
    setLoadingApi(true);
    try {
      const pedidos = await getPedidosPorContenedor(contenedor, authToken);
      const lista = Array.isArray(pedidos) ? pedidos : [pedidos];
      const pedido = lista[0];
      if (!pedido?.Codigo) throw new Error("No se encontró un pedido para este contenedor.");
      const [contenedoresResult, clienteResult] = await Promise.allSettled([
        getContenedoresDePedido(pedido.Codigo, authToken),
        getCliente(pedido.CodigoClienteUbicacion, authToken)
      ]);
      const contenedoresList = contenedoresResult.status === "fulfilled" ? contenedoresResult.value : [];
      const clienteNombre = clienteResult.status === "fulfilled" ? clienteResult.value.Descripcion : pedido.CodigoClienteUbicacion;
      const totalBultos2 = Array.isArray(contenedoresList) ? contenedoresList.reduce((sum, c) => sum + (c.CantidadBulto ?? 0), 0) : 0;
      setLoadingApi(false);
      if (totalBultos2 <= 1) {
        const { data: nuevo, error: insertError } = await supabaseClient.from("items_reparto").insert({
          sesion_id: session.sesionId,
          contenedor,
          codigo_pedido: pedido.Codigo,
          codigo_cliente: pedido.CodigoClienteUbicacion,
          cliente_nombre: clienteNombre,
          cant_bultos: totalBultos2,
          estado: "pendiente"
        }).select().single();
        if (!insertError && nuevo) {
          setItems((prev) => [...prev, nuevo]);
          showFeedback(`Cargado: ${clienteNombre} — 1 bulto`, "ok");
        }
      } else {
        setBultoMode({
          contenedor,
          clienteNombre,
          totalBultos: totalBultos2,
          escaneados: 1,
          tipo: "carga",
          codigoPedido: pedido.Codigo,
          codigoCliente: pedido.CodigoClienteUbicacion
        });
        setScannerKey((k) => k + 1);
      }
    } catch (e) {
      setLoadingApi(false);
      showFeedback(e instanceof Error ? e.message : "Error al consultar el WMS", "error");
    }
  }
  const pendientes = items.filter((i) => i.estado === "pendiente");
  const entregados = items.filter((i) => i.estado === "entregado");
  const totalBultos = items.reduce((sum, i) => sum + i.cant_bultos, 0);
  return /* @__PURE__ */ jsxs("div", { className: "rep-page", children: [
    /* @__PURE__ */ jsxs("header", { className: "rep-header", children: [
      /* @__PURE__ */ jsxs("div", { className: "rep-header__logo", children: [
        /* @__PURE__ */ jsx("img", { src: "/img/alzo_logo.png", alt: "Alzo" }),
        /* @__PURE__ */ jsx("span", { children: "Reparto" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rep-header__right", children: [
        /* @__PURE__ */ jsxs("div", { className: "rep-header__info", children: [
          session.repartidor,
          /* @__PURE__ */ jsxs("small", { children: [
            "Patente: ",
            session.patente
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "rep-header__logout", onClick: onLogout, title: "Cambiar patente/perfil", children: "Cambiar" }),
        /* @__PURE__ */ jsx("button", { className: "rep-header__logout", onClick: onGoogleLogout, title: "Cerrar sesión", children: "Salir" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "rep-main", children: [
      /* @__PURE__ */ jsxs("div", { className: "rep-summary", children: [
        /* @__PURE__ */ jsxs("div", { className: "rep-summary__card", children: [
          /* @__PURE__ */ jsx("span", { className: "rep-summary__num", children: items.length }),
          /* @__PURE__ */ jsx("span", { className: "rep-summary__label", children: "Pedidos" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rep-summary__card", children: [
          /* @__PURE__ */ jsx("span", { className: "rep-summary__num rep-summary__num--pending", children: pendientes.length }),
          /* @__PURE__ */ jsx("span", { className: "rep-summary__label", children: "Pendientes" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rep-summary__card", children: [
          /* @__PURE__ */ jsx("span", { className: "rep-summary__num rep-summary__num--done", children: entregados.length }),
          /* @__PURE__ */ jsx("span", { className: "rep-summary__label", children: "Entregados" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rep-summary__card", children: [
          /* @__PURE__ */ jsx("span", { className: "rep-summary__num", children: totalBultos }),
          /* @__PURE__ */ jsx("span", { className: "rep-summary__label", children: "Bultos" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rep-section", ref: scannerSectionRef, children: [
        /* @__PURE__ */ jsx("h2", { className: "rep-section__title", children: bultoMode ? bultoMode.tipo === "carga" ? "Cargando bultos" : "Entregando bultos" : deliveryTarget ? "Confirmar entrega" : "Escanear contenedor" }),
        bultoMode && /* @__PURE__ */ jsxs("div", { className: "rep-bulto-counter", children: [
          /* @__PURE__ */ jsxs("p", { className: "rep-bulto-counter__nombre", children: [
            bultoMode.tipo === "carga" ? "Cargando:" : "Entregando:",
            " ",
            /* @__PURE__ */ jsx("strong", { children: bultoMode.clienteNombre })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rep-bulto-counter__display", children: [
            /* @__PURE__ */ jsx("span", { className: "rep-bulto-counter__current", children: bultoMode.escaneados }),
            /* @__PURE__ */ jsx("span", { className: "rep-bulto-counter__sep", children: "/" }),
            /* @__PURE__ */ jsx("span", { className: "rep-bulto-counter__total", children: bultoMode.totalBultos })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "rep-bulto-counter__hint", children: "Escaneá el siguiente bulto" }),
          /* @__PURE__ */ jsx("button", { className: "rep-btn-cancel-delivery", onClick: () => setBultoMode(null), children: "Cancelar" })
        ] }),
        deliveryTarget && !bultoMode && /* @__PURE__ */ jsxs("div", { className: "rep-delivery-banner", children: [
          /* @__PURE__ */ jsxs("div", { className: "rep-delivery-banner__text", children: [
            /* @__PURE__ */ jsx("span", { children: "Escaneá el contenedor de:" }),
            /* @__PURE__ */ jsx("strong", { children: deliveryTarget.cliente_nombre })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "rep-btn-cancel-delivery", onClick: () => setDeliveryTarget(null), children: "Cancelar" })
        ] }),
        /* @__PURE__ */ jsx(QrReader, { onResult: handleScan, autoOpen: !!deliveryTarget || !!bultoMode }, scannerKey),
        loadingApi && /* @__PURE__ */ jsxs("div", { className: "rep-ocr-processing", style: { paddingTop: 20 }, children: [
          /* @__PURE__ */ jsx("span", { className: "rep-spinner", style: { borderColor: "#dbeafe", borderTopColor: "#2556ff" } }),
          /* @__PURE__ */ jsx("p", { children: "Consultando WMS..." })
        ] }),
        !loadingApi && feedback && /* @__PURE__ */ jsx("div", { className: `rep-feedback rep-feedback--${feedback.tipo}`, children: feedback.msg })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { textAlign: "center", marginBottom: 24 }, children: /* @__PURE__ */ jsx("button", { className: "rep-btn-finalizar", onClick: () => setShowFinalizar(true), children: "Finalizar día" }) }),
      /* @__PURE__ */ jsxs("section", { className: "rep-section", children: [
        /* @__PURE__ */ jsxs("h2", { className: "rep-section__title", children: [
          "Pedidos del día",
          items.length > 0 && /* @__PURE__ */ jsx("span", { className: "rep-section__count", children: items.length })
        ] }),
        loadingItems ? /* @__PURE__ */ jsxs("div", { className: "rep-ocr-processing", children: [
          /* @__PURE__ */ jsx("span", { className: "rep-spinner", style: { borderColor: "#dbeafe", borderTopColor: "#2556ff" } }),
          /* @__PURE__ */ jsx("p", { children: "Cargando pedidos..." })
        ] }) : items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "rep-empty", children: "Aún no hay pedidos escaneados. Escaneá el primer contenedor para comenzar." }) : /* @__PURE__ */ jsxs("div", { className: "rep-items-list", children: [
          pendientes.map((item) => /* @__PURE__ */ jsx(
            ItemCard,
            {
              item,
              isDeliveryTarget: deliveryTarget?.id === item.id,
              onEntregar: () => handleEntregarClick(item),
              onCancelDelivery: () => setDeliveryTarget(null),
              onCancelEntrega: () => cancelarEntrega(item)
            },
            item.id
          )),
          entregados.map((item) => /* @__PURE__ */ jsx(
            ItemCard,
            {
              item,
              isDeliveryTarget: false,
              onEntregar: () => handleEntregarClick(item),
              onCancelDelivery: () => setDeliveryTarget(null),
              onCancelEntrega: () => cancelarEntrega(item)
            },
            item.id
          ))
        ] })
      ] })
    ] }),
    showFinalizar && /* @__PURE__ */ jsx(
      FinalizarScreen,
      {
        session,
        items,
        onCancel: () => setShowFinalizar(false),
        onConfirm: onLogout
      }
    )
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Alzo — Reparto</title><meta name="robots" content="noindex, nofollow"><link rel="icon" type="image/png" href="/img/alzo_logo.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">${renderHead()}</head> <body> ${renderComponent($$result, "RepartoApp", RepartoApp, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/workspace/alzologistica/src/components/reparto/RepartoApp", "client:component-export": "default" })} </body></html>`;
}, "C:/workspace/alzologistica/src/pages/reparto/index.astro", void 0);

const $$file = "C:/workspace/alzologistica/src/pages/reparto/index.astro";
const $$url = "/reparto";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
