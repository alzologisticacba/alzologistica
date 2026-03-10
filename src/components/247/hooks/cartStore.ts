// src/components/247/hooks/cartStore.ts
// Persiste en localStorage para sobrevivir navegación entre páginas

export interface CartItem {
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
  contenido?: Array<{ producto: string; nombre: string | null; cantidad: number; elegido?: boolean }>;
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

export function getCart(): CartItem[]  { return load(); }
export function getCartCount(): number { return load().reduce((s, i) => s + i.cantidad, 0); }

function requiresAgeGate(item: Omit<CartItem, "cantidad">): boolean {
  const keywords = ["cigarro", "cigarri", "tabaco"];
  const haystack = `${item.rubro ?? ""} ${item.familiaNombre ?? ""} ${item.descripcion}`.toLowerCase();
  return keywords.some(k => haystack.includes(k));
}

export function addToCart(item: Omit<CartItem, "cantidad">): "added" | "pending" {
  if (typeof window !== "undefined" && requiresAgeGate(item)) {
    const age = localStorage.getItem(AGE_KEY);
    if (age === null) {
      window.dispatchEvent(new CustomEvent("cart-age-gate", { detail: item }));
      return "pending";
    }
  }
  const cart     = load();
  const existing = cart.find(i => i.codigo === item.codigo);
  if (existing) {
    existing.cantidad += item.multiplo || 1;
    if (item.contenido) existing.contenido = item.contenido;
  } else {
    cart.push({ ...item, cantidad: item.multiplo || 1 });
  }
  save(cart);
  dispatch();
  return "added";
}

export function setAgeVerified(v: boolean) {
  try { localStorage.setItem(AGE_KEY, v ? "true" : "false"); } catch {}
}

export function removeFromCart(codigo: number) {
  save(load().filter(i => i.codigo !== codigo));
  dispatch();
}

export function clearCart() {
  save([]);
  dispatch();
}

export function updateQuantity(codigo: number, cantidad: number) {
  save(load().map(i => i.codigo === codigo ? { ...i, cantidad } : i));
  dispatch();
}