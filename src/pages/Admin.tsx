import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/store/useCart";
import { products } from "@/data/catalog";
import { formatGHS } from "@/lib/format";

const kpis = [
  { label: "Revenue (30d)", value: "GH₵ 248,520", delta: "+12.4%", icon: TrendingUp },
  { label: "Orders", value: "1,284", delta: "+8.1%", icon: ShoppingBag },
  { label: "New customers", value: "342", delta: "+22.0%", icon: Users },
  { label: "Products", value: products.length.toString(), delta: "0", icon: Package },
];

const recentOrders = [
  { id: "YBE-3F2A1B", customer: "Ama Boateng", total: 1270, status: "Paid" },
  { id: "YBE-91C7DD", customer: "Kwesi Mensah", total: 540, status: "Shipped" },
  { id: "YBE-A02E4F", customer: "Adwoa Asante", total: 220, status: "Delivered" },
  { id: "YBE-0DE1A4", customer: "Yaw Owusu", total: 4200, status: "Pending" },
  { id: "YBE-77BC22", customer: "Akua Frimpong", total: 850, status: "Paid" },
];

const Admin = () => {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin")
    return (
      <div className="container-x mx-auto max-w-md py-24 text-center">
        <h1 className="font-display text-2xl font-bold mb-3">Admin access required</h1>
        <p className="text-muted-foreground mb-6">Sign in with an email containing "admin" to view this dashboard.</p>
        <Link to="/login" className="text-primary font-semibold underline">Go to login</Link>
      </div>
    );

  return (
    <div className="container-x mx-auto max-w-7xl py-8 lg:py-12">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">Dashboard</p>
          <h1 className="font-display text-3xl lg:text-5xl font-bold">Overview</h1>
        </div>
        <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border rounded-2xl p-5 shadow-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="size-10 rounded-xl bg-primary/10 grid place-items-center">
                <k.icon className="size-5 text-primary" />
              </div>
              <span className={`text-xs font-semibold ${k.delta.startsWith("+") ? "text-success" : "text-muted-foreground"} flex items-center gap-0.5`}>
                {k.delta} {k.delta.startsWith("+") && <ArrowUpRight className="size-3" />}
              </span>
            </div>
            <div className="font-display text-2xl font-bold">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="bg-card border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold">Recent orders</h2>
            <button className="text-xs text-muted-foreground hover:text-primary">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left pb-3">Order</th><th className="text-left pb-3">Customer</th><th className="text-left pb-3">Status</th><th className="text-right pb-3">Total</th></tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-3 font-medium">{o.id}</td>
                    <td className="py-3 text-muted-foreground">{o.customer}</td>
                    <td className="py-3">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
                        o.status === "Paid" ? "bg-success/15 text-success" :
                        o.status === "Pending" ? "bg-destructive/15 text-destructive" :
                        "bg-accent/20 text-accent-foreground"
                      }`}>{o.status}</span>
                    </td>
                    <td className="py-3 text-right font-semibold">{formatGHS(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold">Top products</h2>
            <button><MoreHorizontal className="size-4 text-muted-foreground" /></button>
          </div>
          <div className="space-y-3">
            {products.slice(0, 5).map((p) => (
              <div key={p.id} className="flex gap-3 items-center">
                <img src={p.image} alt={p.name} className="size-12 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold line-clamp-1">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.reviews} reviews · {p.rating}★</div>
                </div>
                <div className="text-sm font-semibold">{formatGHS(p.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
