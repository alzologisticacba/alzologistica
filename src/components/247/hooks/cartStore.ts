// src/components/247/hooks/cartStore.ts
// Persiste en localStorage para sobrevivir navegación entre páginas

export interface CartItem {
  codigo: number;
  descripcion: string;
  precioFinal: number;
  cantidad: number;
  multiplo: number;
  descuento: number;
  familiaNombre?: string;
  rubro?: string;
  tipo: "articulo" | "combo";
}

const KEY = "alzo_cart";

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

export function addToCart(item: Omit<CartItem, "cantidad">) {
  const cart     = load();
  const existing = cart.find(i => i.codigo === item.codigo);
  if (existing) {
    existing.cantidad += item.multiplo || 1;
  } else {
    cart.push({ ...item, cantidad: item.multiplo || 1 });
  }
  save(cart);
  dispatch();
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