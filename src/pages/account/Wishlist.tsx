import { Link } from "react-router-dom";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useWishlist } from "@/store/useStore";
import { formatGHS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/useCart";
import { toast } from "sonner";
import { useProducts } from "@/store/useProducts";

const Wishlist = () => {
  const products = useProducts((s) => s.products);
  const { ids, toggle } = useWishlist();
  const items = products.filter((p) => ids.includes(p.id));
  const add = useCart((s) => s.add);

  if (items.length === 0)
    return (
      <div className="bg-card border rounded-2xl p-12 text-center max-w-2xl">
        <Heart className="size-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-display text-xl font-bold mb-2">Your wishlist is empty</h3>
        <p className="text-muted-foreground mb-5">Tap the heart icon on any product to save it for later.</p>
        <Button asChild className="rounded-full"><Link to="/shop">Start shopping</Link></Button>
      </div>
    );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Wishlist <span className="text-muted-foreground text-base font-normal">({items.length})</span></h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.id} className="bg-card border rounded-2xl overflow-hidden group">
            <Link to={`/product/${p.slug}`} className="block aspect-square bg-muted overflow-hidden">
              <img src={p.image} alt={p.name} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <div className="p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{p.brand}</div>
              <Link to={`/product/${p.slug}`} className="font-semibold line-clamp-1 hover:text-primary">{p.name}</Link>
              <div className="flex items-center justify-between mt-3">
                <div className="font-bold">{formatGHS(p.price)}</div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="size-9 rounded-full" onClick={() => { toggle(p.id); toast.success("Removed from wishlist"); }}>
                    <X className="size-4" />
                  </Button>
                  <Button size="icon" className="size-9 rounded-full bg-primary" onClick={() => { add(p); toast.success("Added to cart"); }}>
                    <ShoppingBag className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
