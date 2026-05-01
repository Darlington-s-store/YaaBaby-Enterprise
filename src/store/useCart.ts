import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";
import type { Product } from "@/data/catalog";
import { signInWithPopup, signInWithRedirect, getRedirectResult, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";

declare global {
  interface Window {
    confirmationResult: ConfirmationResult;
  }
}

export type CartItem = {
  id?: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
};

type CartState = {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  add: (p: Product, quantity?: number, variant?: string) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  setQty: (itemId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  subtotal: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  (set, get) => ({
    items: [],
    loading: false,

    fetchCart: async () => {
      set({ loading: true });
      try {
        const res = await api.get('/cart');
        const items = res.data.items.map((item: { id: string; productId: string; quantity: number; Product: { name: string; basePrice: number; images: { url: string }[] }; ProductVariant?: { color?: string; size?: string; priceOverride?: number } | null }) => ({
          id: item.id,
          productId: item.productId,
          name: item.Product.name,
          price: item.ProductVariant?.priceOverride || item.Product.basePrice,
          image: item.Product.images?.[0]?.url || '',
          quantity: item.quantity,
          variant: item.ProductVariant ? `${item.ProductVariant.color || ''} ${item.ProductVariant.size || ''}` : undefined
        }));
        set({ items, loading: false });
      } catch (err: unknown) {
        set({ loading: false });
      }
    },

    add: async (p, quantity = 1, variant) => {
      set({ loading: true });
      try {
        await api.post('/cart/add', { productId: p.id, quantity, variantId: variant });
        await get().fetchCart();
      } catch (err) {
        set({ loading: false });
      }
    },

    remove: async (itemId) => {
      set({ loading: true });
      try {
        await api.delete(`/cart/remove/${itemId}`);
        set((s) => ({ items: s.items.filter((i) => i.id !== itemId), loading: false }));
      } catch (err) {
        set({ loading: false });
      }
    },

    setQty: async (itemId, quantity) => {
      if (quantity <= 0) return get().remove(itemId);
      set({ loading: true });
      try {
        await api.put(`/cart/update/${itemId}`, { quantity });
        set((s) => ({
          items: s.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
          loading: false
        }));
      } catch (err) {
        set({ loading: false });
      }
    },

    clear: async () => {
      // Logic for clearing cart (depends on backend implementation, usually happens after order)
      set({ items: [] });
    },

    subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  })
);

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  permissions?: Record<string, unknown>;
};

type AuthState = {
  user: SessionUser | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string, extras?: Record<string, unknown>) => Promise<{ ok: boolean; user?: SessionUser; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; user?: SessionUser; error?: string }>;
  adminSignIn: (email: string, password: string) => Promise<{ ok: boolean; user?: SessionUser; error?: string }>;
  signOut: () => void;
  initialize: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  phoneSignIn: (phone: string, code?: string) => Promise<{ ok: boolean; error?: string; requiresVerification?: boolean }>;
  updateProfile: (data: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>;
};

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,

      signUp: async (name, email, password, extras) => {
        try {
          const res = await api.post('/auth/register', { fullName: name, email, password, ...extras });
          const { accessToken, user } = res.data;
          const normalizedRole = user.role?.toLowerCase() || 'customer';
          const sessionUser = { id: user.id, email: user.email, name: user.fullName, role: normalizedRole };
          localStorage.setItem('accessToken', accessToken);
          set({ user: sessionUser });
          return { ok: true, user: sessionUser };
        } catch (err: unknown) {
          return { ok: false, error: (err as ApiError).response?.data?.message || "Registration failed" };
        }
      },

      signIn: async (email, password) => {
        try {
          const res = await api.post('/auth/login', { email, password });
          const { accessToken, user } = res.data;
          const normalizedRole = user.role?.toLowerCase() || 'customer';
          const sessionUser = { id: user.id, email: user.email, name: user.fullName, role: normalizedRole };
          localStorage.setItem('accessToken', accessToken);
          set({ user: sessionUser });
          return { ok: true, user: sessionUser };
        } catch (err: unknown) {
          return { ok: false, error: (err as ApiError).response?.data?.message || "Login failed" };
        }
      },
      adminSignIn: async (email, password) => {
        try {
          const res = await api.post('/auth/login', { email, password });
          const { accessToken, user } = res.data;
          
          const isAdmin = ['admin', 'super_admin', 'manager'].includes(user.role?.toLowerCase());
          if (!isAdmin) {
            return { ok: false, error: "Access denied: Not an administrator" };
          }

          const normalizedRole = user.role?.toLowerCase() || 'customer';
          const sessionUser = { id: user.id, email: user.email, name: user.fullName, role: normalizedRole };
          localStorage.setItem('accessToken', accessToken);
          set({ user: sessionUser });
          return { ok: true, user: sessionUser };
        } catch (err: unknown) {
          return { ok: false, error: (err as ApiError).response?.data?.message || "Admin login failed" };
        }
      },

      signOut: () => {
        localStorage.removeItem('accessToken');
        api.post('/auth/logout');
        set({ user: null });
      },

      initialize: async () => {
        // Handle Google Redirect Result
        try {
          console.log("🔄 Checking for Google redirect result...");
          const result = await getRedirectResult(auth);
          if (result) {
            console.log("✅ Google redirect detected for:", result.user.email);
            const idToken = await result.user.getIdToken();
            
            console.log("📡 Sending token to backend...");
            const res = await api.post('/auth/google/firebase', { idToken });
            const { accessToken, user } = res.data;
            
            console.log("🎉 Backend login successful!");
            localStorage.setItem('accessToken', accessToken);
            const normalizedRole = user.role?.toLowerCase() || 'customer';
            set({ user: { id: user.id, email: user.email, name: user.fullName, role: normalizedRole, avatar: user.avatarUrl } });
          }
        } catch (err: unknown) {
          const error = err as any; // Cast for specific properties
          console.error("❌ Redirect Auth Error:", error);
          if (error.code === 'auth/unauthorized-domain') {
            console.error("👉 FIX: You must add this domain to Firebase Console > Authentication > Settings > Authorized Domains");
          }
        }

        const token = localStorage.getItem('accessToken');
        if (token && !get().user) {
          try {
            // Placeholder: Backend needs a GET /auth/me or similar
          } catch (err) {
            set({ user: null });
          }
        }
      },
      googleSignIn: async () => {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (err: unknown) {
          console.error("Google Sign-In failed:", err);
          throw err;
        }
      },
      phoneSignIn: async (phone, code) => {
        try {
          // If no code, start the phone auth process
          if (!code) {
            const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              size: 'invisible'
            });
            const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
            // Store confirmation in a window variable or similar for the next step
            window.confirmationResult = confirmation;
            return { ok: true, requiresVerification: true };
          }

          // If code is provided, verify it
          const confirmation = window.confirmationResult;
          if (!confirmation) return { ok: false, error: "Session expired. Please try again." };

          const result = await confirmation.confirm(code);
          const idToken = await result.user.getIdToken();

          const res = await api.post('/auth/phone/firebase', { idToken });
          const { accessToken, user } = res.data;

          localStorage.setItem('accessToken', accessToken);
          const normalizedRole = user.role?.toLowerCase() || 'customer';
          set({ user: { id: user.id, email: user.email, name: user.fullName, role: normalizedRole, avatar: user.avatarUrl } });
          
          return { ok: true };
        } catch (err: unknown) {
          console.error("Phone Sign-In failed:", err);
          const message = err instanceof Error ? err.message : "Verification failed";
          return { ok: false, error: message };
        }
      },
      updateProfile: async (data: Record<string, unknown>) => {
        try {
          const res = await api.put('/auth/profile', data);
          const { user } = res.data;
          set({ user: { ...get().user!, email: user.email, name: user.fullName } });
          return { ok: true };
        } catch (err: unknown) {
          return { ok: false, error: (err as ApiError).response?.data?.message || "Update failed" };
        }
      }
    }),
    { name: "yaa-auth" }
  )
);
