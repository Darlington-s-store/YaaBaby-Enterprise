import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight, MoreHorizontal, ArrowRight } from "lucide-react";
import { products } from "@/data/catalog";
import { orders, revenueSeries, adminCustomers } from "@/data/dashboardMock";
import { formatGHS } from "@/lib/format";

const totalRev = orders.reduce((s, o) => s + (o.status !== "Cancelled" && o.status !== "Refunded" ? o.total : 0), 0);

const kpis = [
  { label: "Revenue (30d)", value: formatGHS(totalRev), delta: "+12.4%", icon: TrendingUp },
  { label: "Orders", value: orders.length.toString(), delta: "+8.1%", icon: ShoppingBag },
  { label: "Customers", value: adminCustomers.length.toString(), delta: "+22.0%", icon: Users },
  { label: "Products", value: products.length.toString(), delta: "+3", icon: Package },
];

const max = Math.max(...revenueSeries.map((r) => r.value));

const Overview = () => (
  <div className="space-y-8">
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k, i) => (
        <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border rounded-2xl p-5 shadow-sm-elegant">
          <div className="flex items-start justify-between mb-3">
            <div className="size-10 rounded-xl bg-primary/10 grid place-items-center"><k.icon className="size-5 text-primary" /></div>
            <span className="text-xs font-semibold text-success flex items-center gap-0.5">{k.delta} <ArrowUpRight className="size-3" /></span>
          </div>
          <div className="font-display text-2xl font-bold">{k.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
        </motion.div>
      ))}
    </div>

    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
      <div className="bg-card border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-lg font-bold">Revenue this week</h2>
            <p className="text-xs text-muted-foreground">Daily gross revenue</p>
          </div>
          <span className="text-xs text-muted-foreground">7 days</span>
        </div>
        <div className="flex items-end gap-3 h-52">
          {revenueSeries.map((r, i) => (
            <div key={r.day} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }} animate={{ height: `${(r.value / max) * 100}%` }} transition={{ delay: i * 0.07, duration: 0.6 }}
                className="w-full rounded-t-lg bg-emerald-gold relative group"
              >
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition bg-foreground text-background px-1.5 py-0.5 rounded">{formatGHS(r.value)}</span>
              </motion.div>
              <span className="text-xs text-muted-foreground">{r.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold">Top products</h2>
          <button><MoreHorizontal className="size-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          {products.slice(0, 5).map((p) => (
            <Link key={p.id} to={`/admin/products/${p.id}`} className="flex gap-3 items-center hover:bg-muted/50 p-1.5 rounded-lg -mx-1.5">
              <img src={p.image} alt={p.name} className="size-12 rounded-lg object-cover bg-muted" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold line-clamp-1">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.reviews} reviews · {p.rating}★</div>
              </div>
              <div className="text-sm font-semibold">{formatGHS(p.price)}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-card border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-lg font-bold">Recent orders</h2>
        <Link to="/admin/orders" className="text-xs text-primary font-semibold flex items-center gap-1">View all <ArrowRight className="size-3" /></Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left pb-3">Order</th><th className="text-left pb-3">Customer</th><th className="text-left pb-3">Status</th><th className="text-right pb-3">Total</th></tr>
          </thead>
          <tbody>
            {orders.slice(0, 6).map((o) => (
              <tr key={o.id} className="border-t hover:bg-muted/30">
                <td className="py-3 font-medium"><Link to={`/admin/orders/${o.id}`} className="hover:text-primary">{o.id}</Link></td>
                <td className="py-3 text-muted-foreground">{o.customer.name}</td>
                <td className="py-3"><StatusPill status={o.status} /></td>
                <td className="py-3 text-right font-semibold">{formatGHS(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const StatusPill = ({ status }: { status: string }) => {
  const cls =
    status === "Paid" || status === "Delivered" ? "bg-success/15 text-success" :
    status === "Pending" ? "bg-destructive/15 text-destructive" :
    status === "Cancelled" || status === "Refunded" ? "bg-muted text-muted-foreground" :
    "bg-accent/20 text-accent-foreground";
  return <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${cls}`}>{status}</span>;
};

export default Overview;
