import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Heart, Wallet, Truck, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/store/useCart";
import { useOrders, useWishlist } from "@/store/useStore";
import { products } from "@/data/catalog";
import { formatGHS } from "@/lib/format";
import { Button } from "@/components/ui/button";

const Overview = () => {
  const user = useAuth((s) => s.user)!;
  const allOrders = useOrders((s) => s.orders);
  const wishlistIds = useWishlist((s) => s.ids);
  const myOrders = allOrders.filter((o) => o.userId === user.id);

  const stats = [
    { label: "Total orders", value: myOrders.length, icon: Package, to: "/account/orders" },
    { label: "Wishlist", value: wishlistIds.length, icon: Heart, to: "/account/wishlist" },
    { label: "In transit", value: myOrders.filter((o) => o.status === "Shipped").length, icon: Truck, to: "/account/orders" },
    { label: "Total spent", value: formatGHS(myOrders.reduce((s, o) => s + o.total, 0)), icon: Wallet, to: "/account/orders" },
  ];

  const recent = myOrders.slice(0, 3);

  return (
    <div className="space-y-8 max-w-6xl">
      <section className="relative overflow-hidden rounded-3xl bg-emerald-gold p-7 lg:p-9 text-primary-foreground">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest mb-3 bg-white/10 backdrop-blur px-3 py-1 rounded-full">
            <Sparkles className="size-3.5 text-accent" /> Welcome back
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-2">Hi, {user.name.split(" ")[0]} 👋</h2>
          <p className="opacity-85 text-sm mb-5 max-w-md">Browse new arrivals, track your orders and manage everything in one place.</p>
          <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/shop">Continue shopping <ArrowRight className="size-4 ml-1" /></Link>
          </Button>
        </div>
        <div className="absolute -right-12 -bottom-12 size-72 rounded-full bg-accent/30 blur-3xl" />
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={s.to} className="block bg-card border rounded-2xl p-5 hover:shadow-card transition-shadow">
              <div className="size-10 rounded-xl bg-primary/10 grid place-items-center mb-3">
                <s.icon className="size-5 text-primary" />
              </div>
              <div className="font-display text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </Link>
          </motion.div>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">Recent orders</h2>
          <Link to="/account/orders" className="text-sm text-primary font-semibold">View all</Link>
        </div>
        {recent.length === 0 ? (
          <div className="bg-card border rounded-2xl p-10 text-center">
            <Package className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold mb-1">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-5">Your order history will appear here once you complete a purchase.</p>
            <Button asChild className="rounded-full"><Link to="/shop">Browse the shop</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((o) => (
              <Link key={o.id} to={`/account/orders/${o.id}`} className="bg-card border rounded-2xl p-4 lg:p-5 flex items-center gap-4 flex-wrap hover:shadow-card transition-shadow">
                <img src={o.items[0].image} alt="" className="size-14 rounded-xl object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{o.id}</div>
                  <div className="text-xs text-muted-foreground">{o.date} · {o.items.length} item{o.items.length > 1 ? "s" : ""}</div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-accent/20 text-accent-foreground">{o.status}</span>
                <div className="font-bold">{formatGHS(o.total)}</div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold mb-5">Recommended for you</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((p) => (
            <Link key={p.id} to={`/product/${p.slug}`} className="group">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-2">
                <img src={p.image} alt={p.name} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="text-sm font-semibold line-clamp-1">{p.name}</div>
              <div className="text-sm text-muted-foreground">{formatGHS(p.price)}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Overview;
