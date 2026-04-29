import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as seedProducts, type Product } from "@/data/catalog";

export type AdminProduct = Product;

type ProductsState = {
  products: AdminProduct[];
  upsert: (p: AdminProduct) => void;
  remove: (id: string) => void;
  resetToSeeds: () => void;
  getById: (id: string) => AdminProduct | undefined;
  getBySlug: (slug: string) => AdminProduct | undefined;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const useProducts = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: seedProducts,
      upsert: (p) =>
        set((s) => {
          const safe: AdminProduct = {
            ...p,
            slug: p.slug?.trim() ? slugify(p.slug) : slugify(p.name),
          };
          const exists = s.products.some((x) => x.id === safe.id);
          return {
            products: exists
              ? s.products.map((x) => (x.id === safe.id ? safe : x))
              : [safe, ...s.products],
          };
        }),
      remove: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      resetToSeeds: () => set({ products: seedProducts }),
      getById: (id) => get().products.find((p) => p.id === id),
      getBySlug: (slug) => get().products.find((p) => p.slug === slug),
    }),
    { name: "yaa-products-v1" },
  ),
);

export const generateProductId = () => `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export { slugify };
