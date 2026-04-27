import { Navigate, Link, useNavigate } from "react-router-dom";
import { Package, Heart, MapPin, LogOut, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/useCart";
import { products } from "@/data/catalog";
import { formatGHS } from "@/lib/format";

const mockOrders = [
  { id: "YBE-3F2A1B", date: "2026-04-22", status: "Delivered", total: 1270, items: 2 },
  { id: "YBE-91C7DD", date: "2026-04-15", status: "Shipped", total: 540, items: 1 },
  { id: "YBE-A02E4F", date: "2026-03-29", status: "Delivered", total: 220, items: 1 },
];

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="container-x mx-auto max-w-7xl py-8 lg:py-12">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">My account</p>
          <h1 className="font-display text-3xl lg:text-5xl font-bold">Hi, {user.name} 👋</h1>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => { signOut(); navigate("/"); }}>
          <LogOut className="size-4 mr-2" /> Sign out
        </Button>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-1">
          {[
            { icon: Package, label: "Orders", active: true },
            { icon: Heart, label: "Wishlist" },
            { icon: MapPin, label: "Addresses" },
          ].map((i) => (
            <button key={i.label} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium ${i.active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              <i.icon className="size-4" />{i.label}
            </button>
          ))}
        </aside>

        <div className="space-y-8">
          <section>
            <h2 className="font-display text-xl font-bold mb-5">Recent orders</h2>
            <div className="space-y-3">
              {mockOrders.map((o) => (
                <div key={o.id} className="bg-card border rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-semibold">{o.id}</div>
                    <div className="text-xs text-muted-foreground">{o.date} · {o.items} item{o.items > 1 ? "s" : ""}</div>
                  </div>
                  <span className={`text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${o.status === "Delivered" ? "bg-success/15 text-success" : "bg-accent/20 text-accent-foreground"}`}>{o.status}</span>
                  <div className="font-bold">{formatGHS(o.total)}</div>
                  <Button variant="ghost" size="sm" className="rounded-full">Details <ArrowRight className="size-3.5 ml-1" /></Button>
                </div>
              ))}
            </div>
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
      </div>
    </div>
  );
};

export default Account;
