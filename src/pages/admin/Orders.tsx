import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Download, ArrowRight, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/store/useStore";
import { formatGHS } from "@/lib/format";
import { StatusPill } from "./Overview";

const tabs = ["All", "Pending", "Paid", "Shipped", "Delivered", "Cancelled", "Refunded"] as const;

const Orders = () => {
  const orders = useOrders((s) => s.orders);
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [q, setQ] = useState("");
  const filtered = orders.filter((o) =>
    (tab === "All" || o.status === tab) &&
    (q === "" || o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold">Orders <span className="text-muted-foreground text-base font-normal">({orders.length})</span></h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full"><Filter className="size-4 mr-2" />Filter</Button>
          <Button variant="outline" size="sm" className="rounded-full"><Download className="size-4 mr-2" />Export</Button>
        </div>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by order or customer…" className="pl-10 h-10 rounded-full bg-muted/60 border-transparent" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${tab === t ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}>{t}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border rounded-2xl p-16 text-center">
          <ShoppingBag className="size-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg font-bold mb-1">{orders.length === 0 ? "No orders yet" : "No orders match your filters"}</h3>
          <p className="text-sm text-muted-foreground">{orders.length === 0 ? "Customer orders will appear here as soon as the first checkout happens." : "Try a different filter or search term."}</p>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                <tr>
                  <th className="text-left p-4">Order</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Payment</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Total</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t hover:bg-muted/30">
                    <td className="p-4 font-semibold">{o.id}</td>
                    <td className="p-4 text-muted-foreground">{o.date}</td>
                    <td className="p-4">{o.customer.name}</td>
                    <td className="p-4 text-muted-foreground">{o.payment}</td>
                    <td className="p-4"><StatusPill status={o.status} /></td>
                    <td className="p-4 text-right font-semibold">{formatGHS(o.total)}</td>
                    <td className="p-4 text-right"><Link to={`/admin/orders/${o.id}`} className="text-primary"><ArrowRight className="size-4" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
