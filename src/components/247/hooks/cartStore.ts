// src/components/247/hooks/cartStore.ts
// Persiste en localStorage para sobrevivir navegación entre páginas

export interface CartItem {
  cartKey: string;   // clave única para deduplicación (incluye selecciones en combos)
  codigo: number;
  cod_combo?: string;
  descripcion: string;
  precioFinal: number;
  cantidad: number;
  multiplo: number;
  descuento: number;
  familiaNombre?: string;
  rubro?: string;
  tipo: "articulo" | "combo";
  // Para combos: lista completa de ítems. elegido=true → el usuario lo eligió en el modal
  contenido?: Array<{ producto: string; nombre: string | null; cantidad: number; elegido?: boolean; descuentos?: number }>;
}

const KEY     = "alzo_cart";
const AGE_KEY = "alzo_mayor18";

function load(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch { return []; }
}

function save(cart: CartItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {}
}

function dispatch() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("cart-updated"));
}

// Genera una cartKey única. Para combos con selecciones incluye los ítems elegidos.
function buildCartKey(item: Omit<CartItem, "cantidad" | "cartKey">): string {
  if (item.tipo === "combo" && item.contenido) {
    const elegidos = item.contenido
      .filter(c => c.elegido)
      .map(c => `${c.producto}x${c.cantidad}`)
      .sort()
      .join(",");
    return elegidos ? `combo:${item.cod_combo}:${elegidos}` : `combo:${item.cod_combo}`;
  }
  return String(item.codigo);
}

export function getCart(): CartItem[]  { return load(); }
export function getCartCount(): number { return load().reduce((s, i) => s + i.cantidad, 0); }

function requiresAgeGate(item: Omit<CartItem, "cantidad" | "cartKey">): boolean {
  const keywords = ["cigarro", "cigarri", "tabaco"];
  const haystack = `${item.rubro ?? ""} ${item.familiaNombre ?? ""} ${item.descripcion}`.toLowerCase();
  return keywords.some(k => haystack.includes(k));
}

export function addToCart(item: Omit<CartItem, "cantidad" | "cartKey">): "added" | "pending" {
  if (typeof window !== "undefined" && requiresAgeGate(item)) {
    const age = localStorage.getItem(AGE_KEY);
    if (age === null) {
      window.dispatchEvent(new CustomEvent("cart-age-gate", { detail: item }));
      return "pending";
    }
  }
  const cartKey  = buildCartKey(item);
  const cart     = load();
  const existing = cart.find(i => i.cartKey === cartKey);
  if (existing) {
    existing.cantidad += item.multiplo || 1;
  } else {
    cart.push({ ...item, cartKey, cantidad: item.multiplo || 1 });
  }
  save(cart);
  dispatch();
  return "added";
}

export function setAgeVerified(v: boolean) {
  try { localStorage.setItem(AGE_KEY, v ? "true" : "false"); } catch {}
}

export function removeFromCart(cartKey: string) {
  save(load().filter(i => i.cartKey !== cartKey));
  dispatch();
}

export function clearCart() {
  save([]);
  dispatch();
}

export function updateQuantity(cartKey: string, cantidad: number) {
  save(load().map(i => i.cartKey === cartKey ? { ...i, cantidad } : i));
  dispatch();
}
