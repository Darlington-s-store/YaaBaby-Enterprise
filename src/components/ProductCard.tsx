import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/useCart";
import { formatGHS } from "@/lib/format";
import { toast } from "sonner";
import type { Product } from "@/data/catalog";

export const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const add = useCart((s) => s.add);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="product-card group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.badges && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
                    b.startsWith("-") ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"
                  }`}
                >{b}</span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider font-medium">{product.brand}</span>
            <span className="flex items-center gap-1">
              <Star className="size-3 fill-accent text-accent" />
              {product.rating}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-bold text-lg">{formatGHS(product.price)}</span>
            {product.compareAt && (
              <span className="text-sm text-muted-foreground line-through">{formatGHS(product.compareAt)}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Button
          variant="secondary"
          className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={(e) => {
            e.preventDefault();
            add(product, 1);
            toast.success(`${product.name} added to cart`);
          }}
        >
          <ShoppingBag className="size-4 mr-2" /> Quick add
        </Button>
      </div>
    </motion.div>
  );
};
