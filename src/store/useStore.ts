import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, Subcategory, Brand } from "@/data/taxonomy";
import { defaultCategories } from "@/data/taxonomy";

// =================== TAXONOMY (Admin managed) ===================
type TaxonomyState = {
  categories: Category[];
  addCategory: (name: string, icon: string) => void;
  updateCategory: (id: string, patch: Partial<Pick<Category, "name" | "icon">>) => void;
  removeCategory: (id: string) => void;
  addSubcategory: (catId: string, name: string) => void;
  updateSubcategory: (catId: string, subId: string, name: string) => void;
  removeSubcategory: (catId: string, subId: string) => void;
  addBrand: (catId: string, subId: string, name: string) => void;
  removeBrand: (catId: string, subId: string, brandId: string) => void;
  resetToDefaults: () => void;
};

const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const useTaxonomy = create<TaxonomyState>()(
  persist(
    (set) => ({
      categories: defaultCategories,
      addCategory: (name, icon) =>
        set((s) => ({
          categories: [...s.categories, { id: slug(name) || crypto.randomUUID(), name, icon: icon || "🛍️", subcategories: [] }],
        })),
      updateCategory: (id, patch) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
      addSubcategory: (catId, name) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === catId ? { ...c, subcategories: [...c.subcategories, { id: slug(name) || crypto.randomUUID(), name, brands: [] }] } : c,
          ),
        })),
      updateSubcategory: (catId, subId, name) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === catId
              ? { ...c, subcategories: c.subcategories.map((sc) => (sc.id === subId ? { ...sc, name } : sc)) }
              : c,
          ),
        })),
      removeSubcategory: (catId, subId) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === catId ? { ...c, subcategories: c.subcategories.filter((sc) => sc.id !== subId) } : c,
          ),
        })),
      addBrand: (catId, subId, name) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === catId
              ? {
                  ...c,
                  subcategories: c.subcategories.map((sc) =>
                    sc.id === subId ? { ...sc, brands: [...sc.brands, { id: slug(name) || crypto.randomUUID(), name }] } : sc,
                  ),
                }
              : c,
          ),
        })),
      removeBrand: (catId, subId, brandId) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === catId
              ? {
                  ...c,
                  subcategories: c.subcategories.map((sc) =>
                    sc.id === subId ? { ...sc, brands: sc.brands.filter((b) => b.id !== brandId) } : sc,
                  ),
                }
              : c,
          ),
        })),
      resetToDefaults: () => set({ categories: defaultCategories }),
    }),
    { name: "yaa-taxonomy-v1" },
  ),
);

// =================== REVIEWS (User-submitted, admin-approved) ===================
export type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

type ReviewsState = {
  reviews: Review[];
  add: (r: Omit<Review, "id" | "createdAt" | "status">) => void;
  setStatus: (id: string, status: Review["status"]) => void;
  remove: (id: string) => void;
};

export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      reviews: [],
      add: (r) =>
        set((s) => ({
          reviews: [
            { ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: "pending" },
            ...s.reviews,
          ],
        })),
      setStatus: (id, status) => set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, status } : r)) })),
      remove: (id) => set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),
    }),
    { name: "yaa-reviews-v1" },
  ),
);

// =================== ADDRESSES (per user) ===================
export type Address = {
  id: string;
  userId: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  region: string;
  phone: string;
  isDefault: boolean;
};

type AddressState = {
  addresses: Address[];
  add: (a: Omit<Address, "id">) => void;
  update: (id: string, patch: Partial<Address>) => void;
  remove: (id: string) => void;
  setDefault: (userId: string, id: string) => void;
};

export const useAddresses = create<AddressState>()(
  persist(
    (set) => ({
      addresses: [],
      add: (a) =>
        set((s) => ({
          addresses: [
            ...s.addresses.map((x) => (x.userId === a.userId && a.isDefault ? { ...x, isDefault: false } : x)),
            { ...a, id: crypto.randomUUID() },
          ],
        })),
      update: (id, patch) => set((s) => ({ addresses: s.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      remove: (id) => set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
      setDefault: (userId, id) =>
        set((s) => ({
          addresses: s.addresses.map((a) => (a.userId === userId ? { ...a, isDefault: a.id === id } : a)),
        })),
    }),
    { name: "yaa-addresses-v1" },
  ),
);

// =================== ORDERS (placed via checkout) ===================
export type OrderStatus = "Pending" | "Paid" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
};

export type Order = {
  id: string;
  userId: string;
  date: string;
  customer: { name: string; email: string; phone: string };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  payment: "Paystack" | "MoMo" | "Card" | "Cash on delivery";
  shippingAddress: { name: string; line1: string; city: string; region: string; phone: string };
  tracking?: string;
};

type OrdersState = {
  orders: Order[];
  place: (o: Omit<Order, "id" | "date" | "status">) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
  remove: (id: string) => void;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      place: (o) => {
        const order: Order = {
          ...o,
          id: `YBE-${Date.now().toString(36).toUpperCase()}`,
          date: new Date().toISOString().slice(0, 10),
          status: "Pending",
        };
        set({ orders: [order, ...get().orders] });
        return order;
      },
      setStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, status, tracking: status === "Shipped" || status === "Delivered" ? o.tracking ?? `GH${Math.floor(Math.random() * 9000000 + 1000000)}` : o.tracking }
              : o,
          ),
        })),
      remove: (id) => set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
    }),
    { name: "yaa-orders-v1" },
  ),
);

// =================== USERS (registry of all signed-up accounts) ===================
export type AppUser = {
  id: string;
  name: string;
  email: string;
  password: string; // demo only — never do this in production
  role: "customer" | "admin";
  createdAt: string;
  status: "active" | "blocked";
  // Extended profile (mock)
  phone?: string;
  country?: string;
  region?: string;
  avatar?: string; // data URL or http URL
  referralCode?: string; // referral they used at signup
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: "customer" | "admin";
  phone?: string;
  country?: string;
  region?: string;
  avatar?: string;
  referralCode?: string;
};

type UsersState = {
  users: AppUser[];
  register: (payload: RegisterPayload) => AppUser | null;
  authenticate: (email: string, password: string) => AppUser | null;
  setStatus: (id: string, status: AppUser["status"]) => void;
  setRole: (id: string, role: AppUser["role"]) => void;
  update: (id: string, patch: Partial<AppUser>) => void;
  remove: (id: string) => void;
  exists: (email: string) => boolean;
  setPasswordByEmail: (email: string, password: string) => boolean;
};

// Seeded admin so the user can always get into the admin dashboard
const seededAdmin: AppUser = {
  id: "admin-seed",
  name: "Yaa Baby Admin",
  email: "admin@yaababy.gh",
  password: "admin1234",
  role: "admin",
  createdAt: new Date().toISOString().slice(0, 10),
  status: "active",
  emailVerified: true,
  phoneVerified: true,
};

export const useUsers = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [seededAdmin],
      register: (payload) => {
        const e = payload.email.trim().toLowerCase();
        if (get().users.some((u) => u.email.toLowerCase() === e)) return null;
        const u: AppUser = {
          id: crypto.randomUUID(),
          name: payload.name.trim(),
          email: e,
          password: payload.password,
          role: payload.role ?? "customer",
          createdAt: new Date().toISOString().slice(0, 10),
          status: "active",
          phone: payload.phone,
          country: payload.country,
          region: payload.region,
          avatar: payload.avatar,
          referralCode: payload.referralCode,
          emailVerified: false,
          phoneVerified: false,
        };
        set({ users: [...get().users, u] });
        return u;
      },
      authenticate: (email, password) => {
        const e = email.trim().toLowerCase();
        const u = get().users.find((x) => x.email.toLowerCase() === e && x.password === password);
        if (!u || u.status === "blocked") return null;
        return u;
      },
      setStatus: (id, status) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) })),
      setRole: (id, role) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, role } : u)) })),
      update: (id, patch) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
      remove: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
      exists: (email) => get().users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()),
      setPasswordByEmail: (email, password) => {
        const e = email.trim().toLowerCase();
        let found = false;
        set((s) => ({
          users: s.users.map((u) => {
            if (u.email.toLowerCase() === e) { found = true; return { ...u, password }; }
            return u;
          }),
        }));
        return found;
      },
    }),
    { name: "yaa-users-v1" },
  ),
);

// =================== OTP (mock) ===================
// In a real app this would be sent via email/SMS provider. For demo we
// surface the code via toast and store it for verification.
type OtpKind = "email" | "phone" | "password-reset";
type OtpRecord = { kind: OtpKind; target: string; code: string; createdAt: number };

type OtpState = {
  pending: OtpRecord[];
  issue: (kind: OtpKind, target: string) => string;
  verify: (kind: OtpKind, target: string, code: string) => boolean;
  clear: (kind: OtpKind, target: string) => void;
};

export const useOtp = create<OtpState>()(
  persist(
    (set, get) => ({
      pending: [],
      issue: (kind, target) => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const t = target.trim().toLowerCase();
        const others = get().pending.filter((p) => !(p.kind === kind && p.target === t));
        set({ pending: [...others, { kind, target: t, code, createdAt: Date.now() }] });
        return code;
      },
      verify: (kind, target, code) => {
        const t = target.trim().toLowerCase();
        const rec = get().pending.find((p) => p.kind === kind && p.target === t);
        if (!rec) return false;
        const fresh = Date.now() - rec.createdAt < 15 * 60 * 1000; // 15 min
        return fresh && rec.code === code.trim();
      },
      clear: (kind, target) => {
        const t = target.trim().toLowerCase();
        set((s) => ({ pending: s.pending.filter((p) => !(p.kind === kind && p.target === t)) }));
      },
    }),
    { name: "yaa-otp-v1" },
  ),
);

// =================== WISHLIST (per current user) ===================
type WishlistState = {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
};
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((s) => ({ ids: s.ids.includes(productId) ? s.ids.filter((x) => x !== productId) : [...s.ids, productId] })),
      has: (productId) => get().ids.includes(productId),
      clear: () => set({ ids: [] }),
    }),
    { name: "yaa-wishlist-v1" },
  ),
);
