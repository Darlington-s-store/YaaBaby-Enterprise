import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, Subcategory, Brand } from "@/data/taxonomy";
import { defaultCategories } from "@/data/taxonomy";
import { useNotifications } from "./useNotifications";

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
  flagged?: boolean;
  reply?: {
    text: string;
    adminName: string;
    date: string;
  };
  images?: string[];
};

type ReviewsState = {
  reviews: Review[];
  add: (r: Omit<Review, "id" | "createdAt" | "status">) => void;
  setStatus: (id: string, status: Review["status"]) => void;
  reply: (id: string, text: string, adminName: string) => void;
  toggleFlag: (id: string) => void;
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
      reply: (id, text, adminName) => set((s) => ({
        reviews: s.reviews.map((r) => r.id === id ? { 
          ...r, 
          reply: { text, adminName, date: new Date().toISOString() } 
        } : r)
      })),
      toggleFlag: (id) => set((s) => ({
        reviews: s.reviews.map((r) => r.id === id ? { ...r, flagged: !r.flagged } : r)
      })),
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
  deliveryPartnerId?: string;
  trackingUrl?: string;
};

type OrdersState = {
  orders: Order[];
  place: (o: Omit<Order, "id" | "date" | "status">) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
  assignPartner: (id: string, partnerId: string, trackingUrl?: string) => void;
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

        // Notifications
        useNotifications.getState().addNotification({
          type: "order",
          title: "Order Placed! 🛒",
          message: `Your order ${order.id} has been received and is pending payment.`,
          link: `/account/orders/${order.id}`,
        });

        useNotifications.getState().addNotification({
          type: "admin_alert",
          title: "New Order Received 🛍️",
          message: `${order.customer.name} just placed an order for GH₵${order.total.toFixed(2)}.`,
          link: `/admin/orders/${order.id}`,
        });

        return order;
      },
      setStatus: (id, status) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, status, tracking: status === "Shipped" || status === "Delivered" ? o.tracking ?? `GH${Math.floor(Math.random() * 9000000 + 1000000)}` : o.tracking }
              : o,
          ),
        }));

        // Notification for status change
        const order = get().orders.find(o => o.id === id);
        if (order) {
          const statusMessages: Record<string, string> = {
            Paid: "Payment confirmed 💳. We are processing your order.",
            Shipped: "Order shipped 🚚. Your package is on its way!",
            Delivered: "Order delivered ✅. Enjoy your purchase!",
            Cancelled: "Order cancelled ❌. Contact support for details.",
            Refunded: "Refund processed 💰. The amount should reflect soon.",
          };

          if (statusMessages[status]) {
            useNotifications.getState().addNotification({
              type: "order",
              title: `Order ${status}`,
              message: statusMessages[status],
              link: `/account/orders/${id}`,
            });
          }
        }
      },
      assignPartner: (id, partnerId, trackingUrl) => set((s) => ({
        orders: s.orders.map((o) => o.id === id ? { ...o, deliveryPartnerId: partnerId, trackingUrl: trackingUrl || o.trackingUrl } : o)
      })),
      remove: (id) => set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
    }),
    { name: "yaa-orders-v1" },
  ),
);

// =================== PAYMENT METHODS (per user) ===================
export type PaymentMethod = {
  id: string;
  userId: string;
  type: "card" | "momo";
  provider: string; // e.g. "MTN", "Visa", "Mastercard", "AirtelTigo", "Vodafone"
  last4?: string; // for card
  expiry?: string; // for card
  phoneNumber?: string; // for momo
  nameOnAccount: string;
  isDefault: boolean;
};

type PaymentMethodsState = {
  methods: PaymentMethod[];
  add: (m: Omit<PaymentMethod, "id">) => void;
  remove: (id: string) => void;
  setDefault: (userId: string, id: string) => void;
};

export const usePaymentMethods = create<PaymentMethodsState>()(
  persist(
    (set) => ({
      methods: [],
      add: (m) =>
        set((s) => ({
          methods: [
            ...s.methods.map((x) => (x.userId === m.userId && m.isDefault ? { ...x, isDefault: false } : x)),
            { ...m, id: crypto.randomUUID() },
          ],
        })),
      remove: (id) => set((s) => ({ methods: s.methods.filter((m) => m.id !== id) })),
      setDefault: (userId, id) =>
        set((s) => ({
          methods: s.methods.map((m) => (m.userId === userId ? { ...m, isDefault: m.id === id } : m)),
        })),
    }),
    { name: "yaa-payment-methods-v1" },
  ),
);


// =================== TRANSACTIONS (Financial records) ===================
export type Transaction = {
  id: string;
  orderId: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  channel: "Paystack" | "MoMo" | "Bank Transfer" | "Cash on delivery";
  status: "success" | "pending" | "failed" | "reversed";
  date: string;
  receiptUrl?: string;
};

type TransactionsState = {
  transactions: Transaction[];
  add: (t: Omit<Transaction, "id" | "date">) => void;
  setStatus: (id: string, status: Transaction["status"]) => void;
  remove: (id: string) => void;
};

export const useTransactions = create<TransactionsState>()(
  persist(
    (set) => ({
      transactions: [],
      add: (t) => set((s) => ({
        transactions: [
          { ...t, id: crypto.randomUUID(), date: new Date().toISOString() },
          ...s.transactions
        ]
      })),
      setStatus: (id, status) => set((s) => ({
        transactions: s.transactions.map((t) => t.id === id ? { ...t, status } : t)
      })),
      remove: (id) => set((s) => ({
        transactions: s.transactions.filter((t) => t.id !== id)
      }))
    }),
    { name: "yaa-transactions-v1" }
  )
);


// =================== SHIPPING & DELIVERY ===================

export type ShippingMethod = {
  id: string;
  name: string;
  type: "flat" | "weight" | "free_threshold";
  price: number;
  threshold?: number; // for free_threshold
  minWeight?: number;
  maxWeight?: number;
};

export type ShippingZone = {
  id: string;
  name: string;
  regions: string[]; // e.g. ["Greater Accra", "Ashanti"]
  methods: ShippingMethod[];
  enabled: boolean;
};

type ShippingState = {
  zones: ShippingZone[];
  addZone: (z: Omit<ShippingZone, "id">) => void;
  updateZone: (id: string, patch: Partial<ShippingZone>) => void;
  removeZone: (id: string) => void;
  addMethod: (zoneId: string, m: Omit<ShippingMethod, "id">) => void;
  removeMethod: (zoneId: string, methodId: string) => void;
};

export const useShipping = create<ShippingState>()(
  persist(
    (set) => ({
      zones: [
        {
          id: "gh-main",
          name: "Ghana (Standard)",
          regions: ["Greater Accra", "Ashanti", "Central"],
          enabled: true,
          methods: [
            { id: "flat-1", name: "Flat Rate", type: "flat", price: 20 },
            { id: "free-1", name: "Free over 500", type: "free_threshold", price: 0, threshold: 500 }
          ]
        }
      ],
      addZone: (z) => set((s) => ({ zones: [...s.zones, { ...z, id: crypto.randomUUID() }] })),
      updateZone: (id, patch) => set((s) => ({ zones: s.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)) })),
      removeZone: (id) => set((s) => ({ zones: s.zones.filter((z) => z.id !== id) })),
      addMethod: (zoneId, m) => set((s) => ({
        zones: s.zones.map((z) => z.id === zoneId ? { ...z, methods: [...z.methods, { ...m, id: crypto.randomUUID() }] } : z)
      })),
      removeMethod: (zoneId, methodId) => set((s) => ({
        zones: s.zones.map((z) => z.id === zoneId ? { ...z, methods: z.methods.filter((m) => m.id !== methodId) } : z)
      }))
    }),
    { name: "yaa-shipping-v1" }
  )
);

export type DeliveryPartner = {
  id: string;
  name: string;
  contact: string;
  trackingUrlTemplate: string; // e.g. "https://fedex.com/track?id={{id}}"
  status: "active" | "inactive";
};

type DeliveryPartnersState = {
  partners: DeliveryPartner[];
  add: (p: Omit<DeliveryPartner, "id">) => void;
  update: (id: string, patch: Partial<DeliveryPartner>) => void;
  remove: (id: string) => void;
};

export const useDeliveryPartners = create<DeliveryPartnersState>()(
  persist(
    (set) => ({
      partners: [
        { id: "p-1", name: "FedEx Ghana", contact: "+233 302 123456", trackingUrlTemplate: "https://fedex.com/track?q={{id}}", status: "active" },
        { id: "p-2", name: "DHL Express", contact: "+233 302 654321", trackingUrlTemplate: "https://dhl.com/track?id={{id}}", status: "active" }
      ],
      add: (p) => set((s) => ({ partners: [...s.partners, { ...p, id: crypto.randomUUID() }] })),
      update: (id, patch) => set((s) => ({ partners: s.partners.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      remove: (id) => set((s) => ({ partners: s.partners.filter((p) => p.id !== id) }))
    }),
    { name: "yaa-delivery-partners-v1" }
  )
);

// =================== USERS (registry of all signed-up accounts) ===================
export type AdminRole = "Super Admin" | "Admin" | "Manager" | "Support Agent" | "Customer";

export type AdminPermissions = {
  can_edit_products: boolean;
  can_view_analytics: boolean;
  can_process_refunds: boolean;
  can_manage_users: boolean;
  can_manage_inventory: boolean;
  can_view_logs: boolean;
};

export type AdminActivity = {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  ip?: string;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  password: string; // demo only — never do this in production
  role: AdminRole;
  permissions?: AdminPermissions;
  activities?: AdminActivity[];
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
  role?: AdminRole;
  permissions?: AdminPermissions;
  phone?: string;
  country?: string;
  region?: string;
  avatar?: string;
  referralCode?: string;
};

type UsersState = {
  users: AppUser[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  register: (payload: RegisterPayload) => AppUser | null;
  authenticate: (email: string, password: string) => AppUser | null;
  setStatus: (id: string, status: AppUser["status"]) => void;
  setRole: (id: string, role: AdminRole, permissions?: AdminPermissions) => void;
  update: (id: string, patch: Partial<AppUser>) => void;
  logActivity: (userId: string, action: string, target: string) => void;
  remove: (id: string) => void;
  exists: (email: string) => boolean;
  setPasswordByEmail: (email: string, password: string) => boolean;
};

const defaultPermissions: AdminPermissions = {
  can_edit_products: true,
  can_view_analytics: true,
  can_process_refunds: false,
  can_manage_users: false,
  can_manage_inventory: true,
  can_view_logs: true,
};

const superAdminPermissions: AdminPermissions = {
  can_edit_products: true,
  can_view_analytics: true,
  can_process_refunds: true,
  can_manage_users: true,
  can_manage_inventory: true,
  can_view_logs: true,
};

// Seeded admin so the user can always get into the admin dashboard
const seededAdmin: AppUser = {
  id: "admin-seed",
  name: "Yaa Baby Admin",
  email: "admin@yaababy.gh",
  password: "admin1234",
  role: "Super Admin",
  permissions: superAdminPermissions,
  activities: [],
  createdAt: new Date().toISOString().slice(0, 10),
  status: "active",
  emailVerified: true,
  phoneVerified: true,
};

export const useUsers = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [seededAdmin],
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      register: (payload) => {
        const e = payload.email.trim().toLowerCase();
        if (get().users.some((u) => u.email.toLowerCase() === e)) return null;
        
        const role = payload.role ?? "Customer";
        const permissions = payload.permissions || (role === "Super Admin" ? superAdminPermissions : (role === "Customer" ? undefined : defaultPermissions));

        const u: AppUser = {
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          name: payload.name.trim(),
          email: e,
          password: payload.password,
          role,
          permissions,
          activities: [],
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

        // Notifications
        useNotifications.getState().addNotification({
          type: "account",
          title: "Account Created ✅",
          message: `Welcome to YaaBaby, ${u.name}! Start exploring our baby essentials.`,
          link: "/account",
        });

        if (role !== "Customer") {
          useNotifications.getState().addNotification({
            type: "admin_alert",
            title: "New Admin Registered 🛡️",
            message: `${u.name} has been added as ${role}.`,
            link: "/admin/management",
          });
        }

        return u;
      },
      authenticate: (email, password) => {
        const e = email.trim().toLowerCase();
        const u = get().users.find((x) => x.email.toLowerCase() === e && x.password === password);
        if (!u || u.status === "blocked") return null;
        return u;
      },
      setStatus: (id, status) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) })),
      setRole: (id, role, permissions) => 
        set((s) => ({ 
          users: s.users.map((u) => (u.id === id ? { 
            ...u, 
            role, 
            permissions: permissions || (role === "Super Admin" ? superAdminPermissions : (role === "Customer" ? undefined : defaultPermissions)) 
          } : u)) 
        })),
      update: (id, patch) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
      logActivity: (userId, action, target) => {
        set((s) => ({
          users: s.users.map((u) => u.id === userId ? {
            ...u,
            activities: [
              { id: crypto.randomUUID(), action, target, timestamp: new Date().toISOString() },
              ...(u.activities || [])
            ].slice(0, 50) // Keep last 50 activities
          } : u)
        }));
      },
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
    {
      name: "yaa-users-v2", // Bump version for schema change
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          const hasAdmin = state.users.some((u) => u.email === seededAdmin.email);
          if (!hasAdmin) state.users.push(seededAdmin);
        }
      },
    },
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

// =================== SYSTEM SETTINGS (Maintenance Mode, etc.) ===================
type SettingsState = {
  maintenanceMode: boolean;
  setMaintenanceMode: (enabled: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      maintenanceMode: false,
      setMaintenanceMode: (maintenanceMode) => set({ maintenanceMode }),
    }),
    { name: "yaa-settings-v1" }
  )
);
