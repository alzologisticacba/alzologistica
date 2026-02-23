// src/components/247/hooks/cartStore.ts
// Usa window como estado global para compartir entre instancias React separadas

export interface CartItem {
  codigo: number;
  descripcion: string;
  precioFinal: number;
  cantidad: number;
  multiplo: number;
  descuento: number;
  tipo: "articulo" | "combo";
}

declare global {
  interface Window { __alzo_cart__: CartItem[]; }
}

function getStore(): CartItem[] {
  if (typeof window === "undefined") return [];
  if (!window.__alzo_cart__) window.__alzo_cart__ = [];
  return window.__alzo_cart__;
}

export function getCart()      { return getStore(); }
export function getCartCount() { return getStore().reduce((s, i) => s + i.cantidad, 0); }

export function addToCart(item: Omit<CartItem, "cantidad">) {
  const cart     = getStore();
  const existing = cart.find(i => i.codigo === item.codigo);
  if (existing) {
    existing.cantidad += item.multiplo || 1;
  } else {
    cart.push({ ...item, cantidad: item.multiplo || 1 });
  }
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function removeFromCart(codigo: number) {
  window.__alzo_cart__ = getStore().filter(i => i.codigo !== codigo);
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function clearCart() {
  window.__alzo_cart__ = [];
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function updateQuantity(codigo: number, cantidad: number) {
  window.__alzo_cart__ = getStore().map(i => i.codigo === codigo ? { ...i, cantidad } : i);
  window.dispatchEvent(new CustomEvent("cart-updated"));
}