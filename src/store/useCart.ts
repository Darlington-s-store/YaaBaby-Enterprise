import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/catalog";
import { useUsers, type AdminRole, type AdminPermissions } from "@/store/useStore";

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
  role: AdminRole;
  permissions?: AdminPermissions;
  avatar?: string;
};

export type SignUpExtras = {
  phone?: string;
  country?: string;
  region?: string;
  avatar?: string;
  referralCode?: string;
};

type AuthState = {
  user: SessionUser | null;
  remember: boolean;
  signUp: (name: string, email: string, password: string, extras?: SignUpExtras) => Promise<{ ok: boolean; error?: string }>;
  signIn: (email: string, password: string, remember?: boolean) => Promise<{ ok: boolean; error?: string }>;
  adminSignIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<SessionUser, "name" | "email" | "avatar">>) => void;
  // Mock Google sign in (creates account if missing)
  googleSignIn: (mockEmail?: string) => Promise<{ ok: boolean; error?: string }>;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      remember: true,
      signUp: async (name, email, password, extras) => {
        if (!name.trim() || !email.trim() || password.length < 6) {
          return { ok: false, error: "Please enter your name, email, and a password of 6+ characters." };
        }
        if (useUsers.getState().exists(email)) {
          return { ok: false, error: "An account with this email already exists. Please sign in." };
        }
        const created = useUsers.getState().register({
          name, email, password, role: "Customer", ...extras,
        });
        if (!created) return { ok: false, error: "Could not create account." };
        set({ user: { id: created.id, email: created.email, name: created.name, role: created.role, avatar: created.avatar, permissions: created.permissions } });
        return { ok: true };
      },
      signIn: async (email, password, remember = true) => {
        const u = useUsers.getState().authenticate(email, password);
        if (!u) return { ok: false, error: "Invalid email or password. Don't have an account? Sign up first." };
        if (u.role !== "Customer") {
          return { ok: false, error: "Admin accounts must sign in via the admin login page." };
        }
        set({ user: { id: u.id, email: u.email, name: u.name, role: u.role, avatar: u.avatar, permissions: u.permissions }, remember });
        return { ok: true };
      },
      adminSignIn: async (email, password) => {
        const u = useUsers.getState().authenticate(email, password);
        if (!u) return { ok: false, error: "Invalid admin credentials." };
        if (u.role === "Customer") return { ok: false, error: "This account does not have admin access." };
        set({ user: { id: u.id, email: u.email, name: u.name, role: u.role, avatar: u.avatar, permissions: u.permissions } });
        return { ok: true };
      },
      googleSignIn: async (mockEmail) => {
        // Mock Google sign-in: creates an account on the fly with a fake name based on the email.
        const email = (mockEmail ?? "google.user@gmail.com").trim().toLowerCase();
        const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const existing = useUsers.getState().users.find((u) => u.email.toLowerCase() === email);
        const u = existing ?? useUsers.getState().register({ name, email, password: "google-oauth-mock", role: "Customer" });
        if (!u) return { ok: false, error: "Could not sign in with Google." };
        if (u.role !== "Customer") return { ok: false, error: "Admin accounts must use the admin login page." };
        set({ user: { id: u.id, email: u.email, name: u.name, role: u.role, avatar: u.avatar, permissions: u.permissions } });
        return { ok: true };
      },
      signOut: () => set({ user: null }),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
    }),
    { name: "yaa-auth" },
  ),
);
