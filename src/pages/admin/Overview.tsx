import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";
import { products } from "@/data/catalog";
import { useOrders, useUsers, useReviews } from "@/store/useStore";
import { formatGHS } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const StatusPill = ({ status }: { status: string }) => {
  const cls =
    status === "Paid" || status === "Delivered" || status === "approved" ? "bg-success/15 text-success" :
    status === "Pending" || status === "pending" ? "bg-accent/20 text-accent-foreground" :
    status === "Cancelled" || status === "Refunded" || status === "rejected" || status === "blocked" ? "bg-destructive/15 text-destructive" :
    "bg-primary/10 text-primary";
  return <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${cls}`}>{status}</span>;
};

const Overview = () => {
  const orders = useOrders((s) => s.orders);
  const users = useUsers((s) => s.users.filter((u) => u.role === "customer"));
  const pendingReviews = useReviews((s) => s.reviews.filter((r) => r.status === "pending").length);

  const totalRev = orders.reduce((s, o) => s + (o.status !== "Cancelled" && o.status !== "Refunded" ? o.total : 0), 0);

  const kpis = [
    { label: "Revenue", value: formatGHS(totalRev), delta: "Live", icon: TrendingUp },
    { label: "Orders", value: orders.length.toString(), delta: orders.length ? "+0%" : "—", icon: ShoppingBag },
    { label: "Customers", value: users.length.toString(), delta: users.length ? "active" : "—", icon: Users },
    { label: "Products", value: products.length.toString(), delta: "live", icon: Package },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-gold p-7 lg:p-9 text-primary-foreground">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest mb-3 bg-white/10 backdrop-blur px-3 py-1 rounded-full">
            <Sparkles className="size-3.5 text-accent" /> Admin control center
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">Welcome to YAA BABY ENT.</h1>
          <p className="opacity-85 max-w-lg">Manage products, orders, customers, reviews, categories and more — everything you need to run the store.</p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"><Link to="/admin/products/new">Add product</Link></Button>
            <Button asChild variant="outline" className="rounded-full bg-white/10 border-white/30 hover:bg-white/20 text-primary-foreground"><Link to="/admin/categories">Manage categories</Link></Button>
          </div>
        </div>
        <div className="absolute -right-12 -bottom-12 size-72 rounded-full bg-accent/30 blur-3xl" />
      </section>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border rounded-2xl p-5 shadow-sm-elegant">
            <div className="flex items-start justify-between mb-3">
              <div className="size-10 rounded-xl bg-primary/10 grid place-items-center"><k.icon className="size-5 text-primary" /></div>
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-0.5">{k.delta} <ArrowUpRight className="size-3" /></span>
            </div>
            <div className="font-display text-2xl font-bold">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Action cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Link to="/admin/orders" className="bg-card border rounded-2xl p-6 hover:shadow-card transition-shadow">
          <ShoppingBag className="size-6 text-primary mb-3" />
          <div className="font-display text-lg font-bold">Orders</div>
          <p className="text-sm text-muted-foreground mt-1">{orders.length === 0 ? "No orders yet — they'll appear here once customers check out." : `${orders.length} total · process & track shipments`}</p>
          <div className="text-xs text-primary font-semibold mt-3 inline-flex items-center gap-1">Open <ArrowRight className="size-3" /></div>
        </Link>
        <Link to="/admin/reviews" className="bg-card border rounded-2xl p-6 hover:shadow-card transition-shadow">
          <Sparkles className="size-6 text-primary mb-3" />
          <div className="font-display text-lg font-bold">Reviews queue</div>
          <p className="text-sm text-muted-foreground mt-1">{pendingReviews === 0 ? "No reviews pending approval." : `${pendingReviews} review${pendingReviews > 1 ? "s" : ""} waiting for your approval`}</p>
          <div className="text-xs text-primary font-semibold mt-3 inline-flex items-center gap-1">Moderate <ArrowRight className="size-3" /></div>
        </Link>
        <Link to="/admin/categories" className="bg-card border rounded-2xl p-6 hover:shadow-card transition-shadow">
          <Package className="size-6 text-primary mb-3" />
          <div className="font-display text-lg font-bold">Catalog</div>
          <p className="text-sm text-muted-foreground mt-1">Manage categories, subcategories and brands</p>
          <div className="text-xs text-primary font-semibold mt-3 inline-flex items-center gap-1">Manage <ArrowRight className="size-3" /></div>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="bg-card border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold">Recent orders</h2>
          <Link to="/admin/orders" className="text-xs text-primary font-semibold flex items-center gap-1">View all <ArrowRight className="size-3" /></Link>
        </div>
        {orders.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No orders yet. Once customers complete checkout, their orders will appear here.</div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Overview;
