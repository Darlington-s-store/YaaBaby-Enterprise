import { create } from "zustand";
import api from "@/services/api";
import type { Product } from "@/data/catalog";
import { useNotifications } from "./useNotifications";

interface BackendImage {
  url: string;
  isPrimary?: boolean;
}

export interface BackendProduct extends Omit<Product, 'image' | 'images'> {
  images?: BackendImage[];
}

type ProductsState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  upsert: (p: Product | FormData) => Promise<void>;
  remove: (id: string) => Promise<void>;
  getById: (id: string) => Product | undefined;
  getBySlug: (slug: string) => Product | undefined;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useProducts = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/products');
      const mappedProducts = response.data.map((p: BackendProduct) => ({
        ...p,
        image: p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url || "",
        images: p.images?.map((img) => img.url) || [],
        price: Number(p.price),
        compareAt: p.compareAt ? Number(p.compareAt) : undefined,
      }));
      set({ products: mappedProducts, loading: false });
    } catch (err: unknown) {
      set({ error: (err as ApiError).message, loading: false });
    }
  },

  upsert: async (p) => {
    set({ loading: true });
    try {
      const isFormData = p instanceof FormData;
      const id = isFormData ? p.get('id') as string : p.id;
      const isNew = id?.startsWith('temp_');

      const response = isNew
        ? await api.post('/products', p, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
          })
        : await api.put(`/products/${id}`, p, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
          });

      const rawProduct = response.data as BackendProduct;
      const updatedProduct: Product = {
        ...rawProduct,
        image: rawProduct.images?.find((img) => img.isPrimary)?.url || rawProduct.images?.[0]?.url || "",
        images: rawProduct.images?.map((img) => img.url) || [],
        price: Number(rawProduct.price),
        compareAt: rawProduct.compareAt ? Number(rawProduct.compareAt) : undefined,
      };
      
      set((s) => ({
        products: s.products.some(x => x.id === updatedProduct.id)
          ? s.products.map(x => x.id === updatedProduct.id ? updatedProduct : x)
          : [updatedProduct, ...s.products],
        loading: false
      }));

      if (updatedProduct.stock < 10) {
        useNotifications.getState().addNotification({
          type: "stock",
          title: "Low Stock Alert ⚠️",
          message: `${updatedProduct.name} is running low.`,
          link: `/admin/inventory`,
        });
      }
    } catch (err: unknown) {
      set({ error: (err as ApiError).message, loading: false });
      throw err;
    }
  },

  remove: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/products/${id}`);
      set((s) => ({
        products: s.products.filter((p) => p.id !== id),
        loading: false
      }));
    } catch (err: unknown) {
      set({ error: (err as ApiError).message, loading: false });
    }
  },

  getById: (id) => get().products.find((p) => p.id === id),
  getBySlug: (slug) => get().products.find((p) => p.slug === slug),
}));

export const generateProductId = () => `temp_${Date.now()}`;
export { slugify };
