import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { myOrders } from "@/data/dashboardMock";
import { formatGHS } from "@/lib/format";

const tabs = ["All", "Pending", "Paid", "Shipped", "Delivered", "Cancelled"] as const;

const Orders = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [q, setQ] = useState("");

  const filtered = myOrders.filter((o) =>
    (tab === "All" || o.status === tab) &&
    (q === "" || o.id.toLowerCase().includes(q.toLowerCase()) || o.items[0].name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-display text-2xl font-bold">My orders</h2>
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

      <div className="space-y-3">
        {filtered.length === 0 && <div className="bg-card border rounded-2xl p-10 text-center text-muted-foreground">No orders found.</div>}
        {filtered.map((o) => (
          <Link key={o.id} to={`/account/orders/${o.id}`} className="bg-card border rounded-2xl p-4 lg:p-5 flex items-center gap-4 flex-wrap hover:shadow-card transition-shadow">
            <img src={o.items[0].image} alt="" className="size-16 rounded-xl object-cover bg-muted" />
            <div className="flex-1 min-w-[180px]">
              <div className="font-semibold">{o.id}</div>
              <div className="text-xs text-muted-foreground">{o.date} · {o.items[0].name}{o.items.length > 1 ? ` +${o.items.length - 1}` : ""}</div>
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${o.status === "Delivered" ? "bg-success/15 text-success" : o.status === "Cancelled" || o.status === "Refunded" ? "bg-destructive/15 text-destructive" : "bg-accent/20 text-accent-foreground"}`}>{o.status}</span>
            <div className="font-bold w-24 text-right">{formatGHS(o.total)}</div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;
