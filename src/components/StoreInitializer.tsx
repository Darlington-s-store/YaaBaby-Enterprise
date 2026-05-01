import { useEffect } from "react";
import { useAuth, useCart } from "@/store/useCart";
import { useProducts } from "@/store/useProducts";
import { useTaxonomy, useSettings } from "@/store/useStore";

export const StoreInitializer = ({ children }: { children: React.ReactNode }) => {
  const { user, initialize } = useAuth();
  const fetchProducts = useProducts((s) => s.fetchProducts);
  const fetchCategories = useTaxonomy((s) => s.fetchCategories);
  const fetchSettings = useSettings((s) => s.fetchSettings);
  const fetchCart = useCart((s) => s.fetchCart);

  useEffect(() => {
    // Basic auth check and initial data
    initialize();
    fetchProducts();
    fetchCategories();
    fetchSettings();
  }, [initialize, fetchProducts, fetchCategories, fetchSettings]);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  return <>{children}</>;
};
