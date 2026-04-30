import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight, ArrowRight, Sparkles, Calendar } from "lucide-react";
import { useOrders, useUsers, useReviews } from "@/store/useStore";
import { formatGHS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/store/useProducts";
import { useMemo } from "react";
import { subDays, format, isSameDay } from "date-fns";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useNotifications } from "@/store/useNotifications";

export const StatusPill = ({ status }: { status: string }) => {
  const cls =
    status === "Paid" || status === "Delivered" || status === "approved" ? "bg-success/15 text-success" :
      status === "Pending" || status === "pending" ? "bg-accent/20 text-accent-foreground" :
        status === "Cancelled" || status === "Refunded" || status === "rejected" || status === "blocked" ? "bg-destructive/15 text-destructive" :
          "bg-primary/10 text-primary";
  return <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${cls}`}>{status}</span>;
};

const Overview = () => {
  const products = useProducts((s) => s.products);
  const orders = useOrders((s) => s.orders);
  const allUsers = useUsers((s) => s.users);
  const allReviews = useReviews((s) => s.reviews);
  const users = allUsers.filter((u) => u.role === "Customer");
  const pendingReviews = allReviews.filter((r) => r.status === "pending").length;

  const totalRev = orders.reduce((s, o) => s + (o.status !== "Cancelled" && o.status !== "Refunded" ? o.total : 0), 0);

  const kpis = [
    { label: "Revenue", value: formatGHS(totalRev), delta: "Live", icon: TrendingUp },
    { label: "Orders", value: orders.length.toString(), delta: orders.length ? "+0%" : "—", icon: ShoppingBag },
    { label: "Customers", value: users.length.toString(), delta: users.length ? "active" : "—", icon: Users },
    { label: "Products", value: products.length.toString(), delta: "live", icon: Package },
  ];

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dateObj = subDays(new Date(), 6 - i);
      const dayOrders = orders.filter(o => isSameDay(new Date(o.date), dateObj));
      return {
        name: format(dateObj, "EEE"),
        revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      };
    });
  }, [orders]);

  const catData = useMemo(() => {
    const counts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-8 pb-10 pt-2">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Admin Overview</h1>
        <div className="flex gap-2">
          <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground"><Link to="/admin/products/new">Add product</Link></Button>
          <Button asChild size="sm" variant="outline" className="rounded-full"><Link to="/admin/categories">Categories</Link></Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border rounded-2xl p-5 shadow-sm-elegant">
            <div className="flex items-start justify-between mb-3">
              <div className="size-10 rounded-xl bg-primary/10 grid place-items-center"><k.icon className="size-5 text-primary" /></div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{k.delta}</span>
            </div>
            <div className="font-display text-2xl font-bold">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-3xl p-6 shadow-sm-elegant">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display text-lg font-bold">Revenue Trend</h3>
                <p className="text-xs text-muted-foreground">Performance over the last 7 days</p>
              </div>
              <Link to="/admin/analytics" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                View detailed analytics <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₵${v}`} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-6 shadow-sm-elegant">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold">Recent orders</h2>
              <Link to="/admin/orders" className="text-xs text-primary font-semibold flex items-center gap-1">View all <ArrowRight className="size-3" /></Link>
            </div>
            {orders.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground italic">Nothing to see here yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                    <tr><th className="text-left pb-3">Order</th><th className="text-left pb-3">Customer</th><th className="text-left pb-3">Status</th><th className="text-right pb-3">Total</th></tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="border-t hover:bg-muted/30 transition-colors group">
                        <td className="py-3.5 font-bold"><Link to={`/admin/orders/${o.id}`} className="group-hover:text-primary">{o.id}</Link></td>
                        <td className="py-3.5 text-muted-foreground">{o.customer.name}</td>
                        <td className="py-3.5"><StatusPill status={o.status} /></td>
                        <td className="py-3.5 text-right font-black">{formatGHS(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <div className="bg-card border rounded-3xl p-6 shadow-sm-elegant">
            <h3 className="font-display text-sm font-bold mb-5 uppercase tracking-wider text-muted-foreground">Catalog Spread</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {catData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {catData.slice(0, 4).map((c, i) => (
                <div key={c.name} className="flex items-center justify-between text-[11px] font-bold uppercase">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                  <span>{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Link to="/admin/reviews" className="flex items-center justify-between bg-card border rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-accent/10 grid place-items-center"><Sparkles className="size-5 text-accent" /></div>
                <div>
                  <div className="text-sm font-bold">Pending Reviews</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">{pendingReviews} to check</div>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            <Link to="/admin/inventory" className="flex items-center justify-between bg-card border rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 grid place-items-center"><Package className="size-5 text-primary" /></div>
                <div>
                  <div className="text-sm font-bold">Stock Status</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">Manage Inventory</div>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </div>

          <div className="bg-card border rounded-3xl p-6 shadow-sm-elegant relative overflow-hidden group">
            <div className="absolute top-0 right-0 size-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <h3 className="font-display text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">Alert Simulator</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase justify-start gap-2 rounded-xl" onClick={() => useNotifications.getState().addNotification({ type: "sale", title: "Flash Sale Started! 🔥", message: "Our weekend blowout is live. Up to 40% off!", link: "/shop?sale=true" })}>
                <span>🔥</span> Flash Sale
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase justify-start gap-2 rounded-xl" onClick={() => useNotifications.getState().addNotification({ type: "stock", title: "Back in Stock! 📦", message: "The Nova Wireless Headphones are now available.", link: "/product/nova-wireless-headphones" })}>
                <span>📦</span> Restock
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase justify-start gap-2 rounded-xl" onClick={() => useNotifications.getState().addNotification({ type: "promo", title: "Promo Unlocked! 🎁", message: "Use code WELCOME20 for 20% off your next order.", link: "/shop" })}>
                <span>🎁</span> Promo
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase justify-start gap-2 rounded-xl" onClick={() => useNotifications.getState().addNotification({ type: "loyalty", title: "Tier Upgrade! 🏆", message: "Congratulations! You've reached Gold Status.", link: "/account/loyalty" })}>
                <span>🏆</span> Loyalty
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase justify-start gap-2 rounded-xl" onClick={() => useNotifications.getState().addNotification({ type: "search", title: "Search Ready! 🔍", message: "Your visual search results are processed.", link: "/shop?search_id=123" })}>
                <span>🔍</span> Search
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase justify-start gap-2 rounded-xl" onClick={() => useNotifications.getState().addNotification({ type: "admin_alert", title: "Payment Failed 🚨", message: "Order #YBE-721A payment was declined.", link: "/admin/orders/YBE-721A" })}>
                <span>🚨</span> Payment Fail
              </Button>
            </div>
            <p className="text-[9px] text-muted-foreground mt-4 font-medium uppercase tracking-tight italic">* Use these to test the Notification Center & Toasts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
