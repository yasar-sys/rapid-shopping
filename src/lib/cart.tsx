import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  productId: string; // RS-...
  name: string;
  image: string;
  price: number; // unit
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  add: (i: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE = "rs_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    return {
      items,
      count,
      subtotal,
      add: (i, qty = 1) =>
        setItems((prev) => {
          const found = prev.find((x) => x.productId === i.productId);
          if (found)
            return prev.map((x) =>
              x.productId === i.productId ? { ...x, qty: x.qty + qty } : x,
            );
          return [...prev, { ...i, qty }];
        }),
      remove: (id) => setItems((p) => p.filter((x) => x.productId !== id)),
      setQty: (id, qty) =>
        setItems((p) =>
          p
            .map((x) => (x.productId === id ? { ...x, qty: Math.max(0, qty) } : x))
            .filter((x) => x.qty > 0),
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}