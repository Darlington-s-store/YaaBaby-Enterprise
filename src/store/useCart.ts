import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/catalog";
import { useUsers } from "@/store/useStore";

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

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
};

type AuthState = {
  user: SessionUser | null;
  // Customer flows
  signUp: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  // Separate admin sign-in (only allows users with admin role)
  adminSignIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
  // Profile updates
  updateProfile: (patch: Partial<Pick<SessionUser, "name" | "email">>) => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signUp: async (name, email, password) => {
        if (!name.trim() || !email.trim() || password.length < 6) {
          return { ok: false, error: "Please enter your name, email, and a password of 6+ characters." };
        }
        if (useUsers.getState().exists(email)) {
          return { ok: false, error: "An account with this email already exists. Please sign in." };
        }
        const created = useUsers.getState().register(name, email, password, "customer");
        if (!created) return { ok: false, error: "Could not create account." };
        set({ user: { id: created.id, email: created.email, name: created.name, role: created.role } });
        return { ok: true };
      },
      signIn: async (email, password) => {
        const u = useUsers.getState().authenticate(email, password);
        if (!u) return { ok: false, error: "Invalid email or password. Don't have an account? Sign up first." };
        if (u.role === "admin") {
          return { ok: false, error: "Admin accounts must sign in via the admin login page." };
        }
        set({ user: { id: u.id, email: u.email, name: u.name, role: u.role } });
        return { ok: true };
      },
      adminSignIn: async (email, password) => {
        const u = useUsers.getState().authenticate(email, password);
        if (!u) return { ok: false, error: "Invalid admin credentials." };
        if (u.role !== "admin") return { ok: false, error: "This account does not have admin access." };
        set({ user: { id: u.id, email: u.email, name: u.name, role: u.role } });
        return { ok: true };
      },
      signOut: () => set({ user: null }),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
    }),
    { name: "yaa-auth" },
  ),
);
