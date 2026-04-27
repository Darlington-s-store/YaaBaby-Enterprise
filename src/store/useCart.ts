import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/catalog";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
};

type CartState = {
  items: CartItem[];
  add: (p: Product, quantity?: number, variant?: string) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p, quantity = 1, variant) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === p.id && i.variant === variant);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === p.id && i.variant === variant
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...s.items,
              { productId: p.id, name: p.name, price: p.price, image: p.image, quantity, variant },
            ],
          };
        }),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, quantity) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.productId === productId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "yaa-cart" },
  ),
);

type AuthState = {
  user: { id: string; email: string; name: string; role: "customer" | "admin" } | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: async (email) => {
        const role = email.toLowerCase().includes("admin") ? "admin" : "customer";
        set({
          user: { id: crypto.randomUUID(), email, name: email.split("@")[0], role },
        });
      },
      signUp: async (name, email) => {
        const role = email.toLowerCase().includes("admin") ? "admin" : "customer";
        set({ user: { id: crypto.randomUUID(), email, name, role } });
      },
      signOut: () => set({ user: null }),
    }),
    { name: "yaa-auth" },
  ),
);
