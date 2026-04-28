import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/useCart";
import { useOrders } from "@/store/useStore";
import { formatGHS } from "@/lib/format";

const tabs = ["All", "Pending", "Paid", "Shipped", "Delivered", "Cancelled"] as const;

const Orders = () => {
  const user = useAuth((s) => s.user)!;
  const myOrders = useOrders((s) => s.orders.filter((o) => o.userId === user.id));
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [q, setQ] = useState("");

  const filtered = myOrders.filter((o) =>
    (tab === "All" || o.status === tab) &&
    (q === "" || o.id.toLowerCase().includes(q.toLowerCase()) || o.items[0].name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-display text-2xl font-bold">My orders <span className="text-muted-foreground text-base font-normal">({myOrders.length})</span></h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders…" className="pl-10 h-10 rounded-full bg-muted/60 border-transparent" />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${tab === t ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center">
          <Package className="size-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg font-bold mb-1">{myOrders.length === 0 ? "You haven't placed any orders yet" : "No orders match your filters"}</h3>
          <p className="text-sm text-muted-foreground mb-5">{myOrders.length === 0 ? "Start shopping to see your orders here." : "Try a different filter or search term."}</p>
          {myOrders.length === 0 && <Button asChild className="rounded-full"><Link to="/shop">Start shopping</Link></Button>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <Link key={o.id} to={`/account/orders/${o.id}`} className="bg-card border rounded-2xl p-4 lg:p-5 flex items-center gap-4 flex-wrap hover:shadow-card transition-shadow">
              <img src={o.items[0].image} alt="" className="size-16 rounded-xl object-cover bg-muted" />
              <div className="flex-1 min-w-[180px]">
                <div className="font-semibold">{o.id}</div>
                <div className="text-xs text-muted-foreground">{o.date} · {o.items[0].name}{o.items.length > 1 ? ` +${o.items.length - 1}` : ""}</div>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-accent/20 text-accent-foreground">{o.status}</span>
              <div className="font-bold w-24 text-right">{formatGHS(o.total)}</div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
