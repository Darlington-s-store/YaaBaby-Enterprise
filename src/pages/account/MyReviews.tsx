import { Link } from "react-router-dom";
import { MessageSquare, Star } from "lucide-react";
import { useAuth } from "@/store/useCart";
import { useReviews } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/store/useProducts";

const MyReviews = () => {
  const products = useProducts((s) => s.products);
  const user = useAuth((s) => s.user)!;
  const allReviews = useReviews((s) => s.reviews);
  const mine = allReviews.filter((r) => r.userId === user.id);

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="font-display text-2xl font-bold">My reviews</h2>

      {mine.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center">
          <MessageSquare className="size-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg font-bold mb-1">You haven't written any reviews yet</h3>
          <p className="text-sm text-muted-foreground mb-5">Open any product to share your experience.</p>
          <Button asChild className="rounded-full"><Link to="/shop">Browse products</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {mine.map((r) => {
            const p = products.find((x) => x.id === r.productId);
            return (
              <div key={r.id} className="bg-card border rounded-2xl p-5 flex gap-4 items-start">
                {p && <img src={p.image} alt="" className="size-14 rounded-xl object-cover bg-muted shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Link to={p ? `/product/${p.slug}` : "#"} className="font-semibold hover:text-primary line-clamp-1">{p?.name ?? "Product"}</Link>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${r.status === "approved" ? "bg-success/15 text-success" : r.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-accent/20 text-accent-foreground"}`}>{r.status}</span>
                  </div>
                  <div className="flex gap-0.5 mt-2 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`size-3.5 ${i < r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />)}
                  </div>
                  <div className="font-semibold text-sm">{r.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{r.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">Submitted {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReviews;
