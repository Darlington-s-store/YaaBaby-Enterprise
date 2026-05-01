import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, Subcategory, Brand } from "@/data/taxonomy";
import { defaultCategories } from "@/data/taxonomy";
import { useNotifications } from "./useNotifications";
import api from "@/services/api";

// =================== TAXONOMY (Admin managed) ===================
type TaxonomyState = {
  categories: Category[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string, icon: string) => Promise<void>;
  updateCategory: (id: string, patch: Partial<Pick<Category, "name" | "icon">>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addSubcategory: (parentId: string, name: string) => Promise<void>;
  removeSubcategory: (parentId: string, id: string) => Promise<void>;
  addBrand: (categoryId: string, subcategoryId: string, name: string) => Promise<void>;
  removeBrand: (categoryId: string, subcategoryId: string, id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
};

const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const useTaxonomy = create<TaxonomyState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/products/categories');
      
      interface BackendCategory {
        id: string;
        name: string;
        icon: string;
        children?: BackendCategory[];
        brands?: { id: string; name: string }[];
      }

      // Map 'children' from backend to 'subcategories' for frontend
      const mapped = res.data.map((c: BackendCategory) => ({
        ...c,
        subcategories: (c.children || []).map((sc: BackendCategory) => ({
          ...sc,
          brands: sc.brands || []
        }))
      }));
      set({ categories: mapped, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  addCategory: async (name, icon) => {
    set({ loading: true });
    try {
      await api.post('/products/categories', { name, icon });
      await get().fetchCategories();
    } catch (err) {
      set({ loading: false });
    }
  },

  updateCategory: async (id, patch) => {
    set({ loading: true });
    try {
      await api.put(`/products/categories/${id}`, patch);
      await get().fetchCategories();
    } catch (err) {
      set({ loading: false });
    }
  },

  removeCategory: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/products/categories/${id}`);
      set((s) => ({
        categories: s.categories.filter((c) => c.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ loading: false });
    }
  },

  addSubcategory: async (parentId, name) => {
    set({ loading: true });
    try {
      await api.post('/products/categories', { name, parentId, icon: '📦' });
      await get().fetchCategories();
    } catch (err) {
      set({ loading: false });
    }
  },

  removeSubcategory: async (parentId, id) => {
    await get().removeCategory(id);
  },

  addBrand: async (categoryId, subcategoryId, name) => {
    set({ loading: true });
    try {
      const cat = get().categories.find(c => c.id === categoryId);
      const sub = cat?.subcategories.find(s => s.id === subcategoryId);
      if (!sub) {
        console.error("Subcategory not found for brand addition:", subcategoryId);
        set({ loading: false });
        return;
      }
      
      const newBrand = { id: slug(name), name };
      const updatedBrands = [...(sub.brands || []), newBrand];
      
      console.log(`Adding brand "${name}" to subcategory ${subcategoryId}. New list:`, updatedBrands);
      
      await api.put(`/products/categories/${subcategoryId}`, { brands: updatedBrands });
      await get().fetchCategories();
    } catch (err) {
      console.error("Failed to add brand:", err);
      set({ loading: false });
    }
  },

  removeBrand: async (categoryId, subcategoryId, brandId) => {
    set({ loading: true });
    try {
      const cat = get().categories.find(c => c.id === categoryId);
      const sub = cat?.subcategories.find(s => s.id === subcategoryId);
      if (!sub) {
        set({ loading: false });
        return;
      }
      
      const updatedBrands = (sub.brands || []).filter(b => b.id !== brandId);
      
      await api.put(`/products/categories/${subcategoryId}`, { brands: updatedBrands });
      await get().fetchCategories();
    } catch (err) {
      set({ loading: false });
    }
  },

  resetToDefaults: async () => {
    set({ loading: true });
    try {
      await get().fetchCategories();
    } catch (err) {
      set({ loading: false });
    }
  }
}));

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
  loading: boolean;
  fetchReviews: (productId?: string) => Promise<void>;
  add: (r: Omit<Review, "id" | "createdAt" | "status">) => Promise<void>;
  setStatus: (id: string, status: Review["status"]) => Promise<void>;
  reply: (id: string, text: string) => Promise<void>;
  toggleFlag: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useReviews = create<ReviewsState>((set, get) => ({
  reviews: [],
  loading: false,

  fetchReviews: async (productId) => {
    set({ loading: true });
    try {
      const url = productId ? `/reviews/product/${productId}` : '/reviews/admin/pending';
      const res = await api.get(url);
      set({ reviews: res.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  add: async (r) => {
    set({ loading: true });
    try {
      await api.post('/reviews', r);
      // Don't refetch automatically, wait for moderation or show success
      set({ loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  setStatus: async (id, status) => {
    set({ loading: true });
    try {
      await api.put(`/reviews/moderate/${id}`, { status });
      set((s) => ({
        reviews: s.reviews.map((r) => (r.id === id ? { ...r, status } : r)),
        loading: false
      }));
    } catch (err) {
      set({ loading: false });
    }
  },

  reply: async (id, text) => {
    set({ loading: true });
    try {
      await api.post(`/reviews/reply/${id}`, { text });
      await get().fetchReviews();
    } catch (err) {
      set({ loading: false });
    }
  },

  toggleFlag: async (id) => {
    set((s) => ({
      reviews: s.reviews.map((r) => r.id === id ? { ...r, flagged: !r.flagged } : r)
    }));
    try {
      await api.put(`/reviews/flag/${id}`);
    } catch (err) {
      // Revert on failure
      set((s) => ({
        reviews: s.reviews.map((r) => r.id === id ? { ...r, flagged: !r.flagged } : r)
      }));
    }
  },

  remove: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/reviews/${id}`);
      set((s) => ({
        reviews: s.reviews.filter((r) => r.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ loading: false });
    }
  },
}));

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

type CheckoutPayload = {
  items: { productId: string; variantId?: string; quantity: number }[];
  addressId: string;
  paymentMethod: string;
  shippingMethodId: string;
};

type OrdersState = {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  place: (o: CheckoutPayload) => Promise<Order>;
  setStatus: (id: string, status: OrderStatus) => Promise<void>;
  adminUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useOrders = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/orders/my-orders');
      set({ orders: res.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  fetchAllOrders: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/orders');
      set({ orders: res.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  place: async (o) => {
    set({ loading: true });
    try {
      const res = await api.post('/orders/checkout', o);
      const order = res.data.order;
      
      set((s) => ({ orders: [order, ...s.orders], loading: false }));

      useNotifications.getState().addNotification({
        type: "order",
        title: "Order Placed! 🛒",
        message: `Your order ${order.id} has been received.`,
        link: `/account/orders/${order.id}`,
      });

      return order;
    } catch (err: unknown) {
      set({ loading: false });
      throw err;
    }
  },

  setStatus: async (id, status) => {
    set({ loading: true });
    try {
      await api.put(`/orders/${id}/status`, { status });
      set((s) => ({
        orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        loading: false
      }));
    } catch (err) {
      set({ loading: false });
    }
  },

  adminUpdateStatus: async (id, status) => {
    set({ loading: true });
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      set((s) => ({
        orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        loading: false
      }));
    } catch (err) {
      set({ loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/orders/${id}`);
      set((s) => ({
        orders: s.orders.filter((o) => o.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ loading: false });
    }
  },
}));

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
  loading: boolean;
  fetch: () => Promise<void>;
  add: (t: Omit<Transaction, "id" | "date">) => Promise<void>;
  setStatus: (id: string, status: Transaction["status"]) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => void;
};

export const useTransactions = create<TransactionsState>((set, get) => ({
  transactions: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/payments');
      interface BackendPayment {
        id: string;
        orderId: string;
        transactionId?: string;
        amount: string | number;
        paymentGateway: string;
        status: string;
        createdAt: string;
        Order?: {
          customer?: {
            fullName: string;
            email: string;
          };
        };
      }
      const mapped = res.data.map((p: BackendPayment) => ({
        id: p.id,
        orderId: p.orderId,
        reference: p.transactionId || 'N/A',
        customerName: p.Order?.customer?.fullName || 'Guest',
        customerEmail: p.Order?.customer?.email || 'N/A',
        amount: Number(p.amount),
        channel: p.paymentGateway === 'paystack' ? 'Paystack' : (p.paymentGateway === 'momo' ? 'MoMo' : 'Bank Transfer'),
        status: p.status === 'successful' ? 'success' : (p.status === 'failed' ? 'failed' : 'pending'),
        date: p.createdAt
      }));
      set({ transactions: mapped, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  add: async (t) => {
    set({ loading: true });
    try {
      // In a real app, this might create an offline payment record
      // For now we just mock the push to backend or re-fetch
      await get().fetch();
    } catch (err) {
      set({ loading: false });
    }
  },

  setStatus: async (id, status) => {
    set({ loading: true });
    try {
      const apiStatus = status === 'success' ? 'successful' : (status === 'failed' ? 'failed' : 'pending');
      await api.put(`/admin/payments/${id}/status`, { status: apiStatus });
      await get().fetch();
    } catch (err) {
      set({ loading: false });
    }
  },

  remove: async (id) => {
    // Admin generally shouldn't delete financial records, but we'll allow it for demo
    set({ loading: true });
    try {
      await api.delete(`/admin/payments/${id}`);
      await get().fetch();
    } catch (err) {
      set({ loading: false });
    }
  },

  clearAll: () => set({ transactions: [] })
}));


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
  loading: boolean;
  fetchZones: () => Promise<void>;
  addZone: (z: Omit<ShippingZone, "id" | "methods">) => Promise<void>;
  updateZone: (id: string, patch: Partial<ShippingZone>) => Promise<void>;
  removeZone: (id: string) => Promise<void>;
  addMethod: (zoneId: string, m: Omit<ShippingMethod, "id">) => Promise<void>;
  removeMethod: (zoneId: string, methodId: string) => Promise<void>;
};

export const useShipping = create<ShippingState>((set, get) => ({
  zones: [],
  loading: false,

  fetchZones: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/shipping/zones');
      set({ zones: res.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  addZone: async (z) => {
    set({ loading: true });
    try {
      await api.post('/shipping/zones', z);
      await get().fetchZones();
    } catch (err) {
      set({ loading: false });
    }
  },

  updateZone: async (id, patch) => {
    set({ loading: true });
    try {
      await api.put(`/shipping/zones/${id}`, patch);
      await get().fetchZones();
    } catch (err) {
      set({ loading: false });
    }
  },

  removeZone: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/shipping/zones/${id}`);
      await get().fetchZones();
    } catch (err) {
      set({ loading: false });
    }
  },

  addMethod: async (zoneId, m) => {
    set({ loading: true });
    try {
      await api.post(`/shipping/zones/${zoneId}/methods`, m);
      await get().fetchZones();
    } catch (err) {
      set({ loading: false });
    }
  },

  removeMethod: async (zoneId, methodId) => {
    set({ loading: true });
    try {
      await api.delete(`/shipping/methods/${methodId}`);
      await get().fetchZones();
    } catch (err) {
      set({ loading: false });
    }
  }
}));

export type DeliveryPartner = {
  id: string;
  name: string;
  contact: string;
  trackingUrlTemplate: string; // e.g. "https://fedex.com/track?id={{id}}"
  status: "active" | "inactive";
};

type DeliveryPartnersState = {
  partners: DeliveryPartner[];
  fetchPartners: () => Promise<void>;
  add: (p: Omit<DeliveryPartner, "id">) => Promise<void>;
  update: (id: string, patch: Partial<DeliveryPartner>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useDeliveryPartners = create<DeliveryPartnersState>()(
  (set, get) => ({
    partners: [],
    fetchPartners: async () => {
      try {
        const res = await api.get('/shipping/partners');
        set({ partners: res.data });
      } catch (err) {
        console.error('Failed to fetch partners:', err);
      }
    },
    add: async (p) => {
      try {
        await api.post('/shipping/partners', p);
        await get().fetchPartners();
      } catch (err) {
        console.error('Failed to add partner:', err);
      }
    },
    update: async (id, patch) => {
      try {
        await api.put(`/shipping/partners/${id}`, patch);
        await get().fetchPartners();
      } catch (err) {
        console.error('Failed to update partner:', err);
      }
    },
    remove: async (id) => {
      try {
        await api.delete(`/shipping/partners/${id}`);
        await get().fetchPartners();
      } catch (err) {
        console.error('Failed to remove partner:', err);
      }
    }
  })
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
  fetchUsers: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<AppUser | null>;
  setStatus: (id: string, status: AppUser["status"]) => Promise<void>;
  setRole: (id: string, role: AdminRole, permissions?: AdminPermissions) => Promise<void>;
  update: (id: string, patch: Partial<AppUser>) => Promise<void>;
  logActivity: (userId: string, action: string, target: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
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

// No seeded admin - fetch from backend instead

export const useUsers = create<UsersState>()(
  (set, get) => ({
    users: [],
    fetchUsers: async () => {
        try {
          const res = await api.get('/admin/users');
          interface BackendUser {
            id: string;
            fullName: string;
            email: string;
            role: string;
            isBanned: boolean;
            createdAt?: string;
          }
          const mapped = res.data.map((u: BackendUser) => ({
            id: u.id,
            name: u.fullName,
            email: u.email,
            role: u.role === 'customer' ? 'Customer' : (u.role === 'super_admin' ? 'Super Admin' : (u.role === 'admin' ? 'Admin' : 'Manager')),
            status: u.isBanned ? 'blocked' : 'active',
            createdAt: u.createdAt?.split('T')[0]
          }));
          set({ users: mapped });
        } catch (err) {
          console.error('Failed to fetch users:', err);
        }
      },
      register: async (payload) => {
        try {
          const res = await api.post('/auth/register', {
            fullName: payload.name,
            email: payload.email,
            password: payload.password,
            role: payload.role?.toLowerCase() || 'customer'
          });
          await get().fetchUsers();
          return res.data.user;
        } catch (err) {
          console.error('Registration failed:', err);
          return null;
        }
      },
      setStatus: async (id, status) => {
        try {
          const isBanned = status === 'blocked';
          await api.put(`/admin/users/${id}/status`, { isBanned });
          await get().fetchUsers();
        } catch (err) {
          console.error('Failed to set user status:', err);
        }
      },
      setRole: async (id, role, permissions) => {
        try {
          await api.put(`/admin/users/${id}/role`, { role: role.toLowerCase().replace(' ', '_'), permissions });
          await get().fetchUsers();
        } catch (err) {
          console.error('Failed to set user role:', err);
        }
      },
      update: async (id, patch) => {
        try {
          await api.put(`/admin/users/${id}`, patch);
          await get().fetchUsers();
        } catch (err) {
          console.error('Failed to update user:', err);
        }
      },
      logActivity: async (userId, action, target) => {
        try {
          await api.post(`/admin/users/${userId}/activity`, { action, target });
        } catch (err) {
          console.error('Failed to log activity:', err);
        }
      },
      remove: async (id) => {
        try {
          await api.delete(`/admin/users/${id}`);
          await get().fetchUsers();
        } catch (err) {
          console.error('Failed to remove user:', err);
        }
      },
    }),
);

// =================== OTP (mock) ===================
// In a real app this would be sent via email/SMS provider. For demo we
// surface the code via toast and store it for verification.
type OtpKind = "email" | "phone" | "password-reset";
type OtpRecord = { kind: OtpKind; target: string; code: string; createdAt: number };

type OtpState = {
  pending: OtpRecord[];
  issue: (kind: OtpKind, target: string) => string;
  send: (email: string) => Promise<boolean>;
  verify: (email: string, code: string) => Promise<boolean>;
};

export const useOtp = create<OtpState>()(
  (set) => ({
    pending: [],
    issue: (kind, target) => {
      // Dummy implementation for type safety, backend handles actual issuance
      return "000000";
    },
    send: async (email) => {
      try {
        await api.post('/auth/request-otp', { email });
        return true;
      } catch (err) {
        return false;
      }
    },
    verify: async (email, code) => {
      try {
        await api.post('/auth/verify', { otp: code });
        return true;
      } catch (err) {
        return false;
      }
    },
  })
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
interface SiteConfig {
  name: string;
  slogan: string;
  logo: string;
  favicon: string;
  maintenanceMode: boolean;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  whatsapp: string;
}

interface SocialLinks {
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
}

type SettingsState = {
  maintenanceMode: boolean;
  siteConfig: SiteConfig | null;
  contactInfo: ContactInfo | null;
  socialLinks: SocialLinks | null;
  fetchSettings: () => Promise<void>;
  setMaintenanceMode: (enabled: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      maintenanceMode: false,
      siteConfig: null,
      contactInfo: null,
      socialLinks: null,
      fetchSettings: async () => {
        try {
          const res = await api.get('/settings');
          const settings = res.data;
          set({ 
            siteConfig: settings.site_config,
            contactInfo: settings.contact_info,
            socialLinks: settings.social_links,
            maintenanceMode: settings.site_config?.maintenanceMode || false 
          });
        } catch (err) {
          console.error('Failed to fetch settings:', err);
        }
      },
      setMaintenanceMode: (maintenanceMode) => set({ maintenanceMode }),
    }),
    { name: "yaa-settings-v1" }
  )
);

// =================== VISUAL SEARCH (Image based discovery) ===================
export type VisualSearchRecord = {
  id: string;
  imageUrl: string;
  detectedTags: string[];
  resultsCount: number;
  status: 'processing' | 'completed' | 'failed';
  customerId?: string;
  isRequest?: boolean;
  adminNotes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

type VisualSearchState = {
  history: VisualSearchRecord[];
  loading: boolean;
  fetchHistory: () => Promise<void>;
  updateRecord: (id: string, patch: Partial<VisualSearchRecord>) => Promise<void>;
};

export const useVisualSearch = create<VisualSearchState>((set, get) => ({
  history: [],
  loading: false,
  fetchHistory: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/visual-search/history');
      set({ history: res.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },
  updateRecord: async (id, patch) => {
    set({ loading: true });
    try {
      // Assuming we have an admin endpoint for this or we reuse the request one
      await api.put(`/admin/visual-search/${id}`, patch);
      set((s) => ({
        history: s.history.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        loading: false
      }));
    } catch (err) {
      set({ loading: false });
    }
  },
}));
