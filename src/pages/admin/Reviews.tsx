import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReviews } from "@/store/useStore";
import { toast } from "sonner";

const tabs = ["pending", "approved", "rejected"] as const;

const Reviews = () => {
  const all = useReviews((s) => s.reviews);
  const setStatus = useReviews((s) => s.setStatus);
  const remove = useReviews((s) => s.remove);
  const [tab, setTab] = useState<(typeof tabs)[number]>("pending");

  const filtered = all.filter((r) => r.status === tab);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Reviews moderation</h2>
          <p className="text-sm text-muted-foreground mt-1">Approve or reject customer reviews before they appear on the website.</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => {
          const count = all.filter((r) => r.status === t).length;
          return (
            <button key={t} onClick={() => setTab(t)} className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors capitalize ${tab === t ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}>
              {t} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border rounded-2xl p-16 text-center">
          <MessageSquare className="size-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg font-bold mb-1">No {tab} reviews</h3>
          <p className="text-sm text-muted-foreground">{tab === "pending" ? "When customers write reviews, they'll appear here for your approval." : `No reviews currently ${tab}.`}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const p = products.find((x) => x.id === r.productId);
            return (
              <div key={r.id} className="bg-card border rounded-2xl p-5">
                <div className="flex gap-4 items-start">
                  {p && <img src={p.image} alt="" className="size-16 rounded-xl object-cover bg-muted shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <div>
                        <Link to={p ? `/product/${p.slug}` : "#"} className="font-semibold hover:text-primary line-clamp-1">{p?.name ?? "Product"}</Link>
                        <p className="text-xs text-muted-foreground">By {r.userName} · {new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`size-4 ${i < r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />)}
                      </div>
                    </div>
                    <div className="font-semibold text-sm">{r.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{r.body}</p>
                    <div className="flex gap-2 mt-4">
                      {r.status !== "approved" && (
                        <Button size="sm" className="rounded-full bg-success text-success-foreground hover:bg-success/90" onClick={() => { setStatus(r.id, "approved"); toast.success("Review approved & published"); }}>
                          <Check className="size-3.5 mr-1.5" /> Approve & publish
                        </Button>
                      )}
                      {r.status !== "rejected" && (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => { setStatus(r.id, "rejected"); toast.success("Review rejected"); }}>
                          <X className="size-3.5 mr-1.5" /> Reject
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="rounded-full text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this review?")) { remove(r.id); toast.success("Deleted"); } }}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reviews;
