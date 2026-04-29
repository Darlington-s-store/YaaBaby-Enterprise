import { motion } from "framer-motion";
import { TrendingUp, BarChart3 } from "lucide-react";
import { useOrders, useUsers } from "@/store/useStore";
import { formatGHS } from "@/lib/format";
import { useProducts } from "@/store/useProducts";

const Analytics = () => {
  const products = useProducts((s) => s.products);
  const orders = useOrders((s) => s.orders);
  const customers = useUsers((s) => s.users).filter((u) => u.role === "customer");
  const aov = orders.length ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0;

  const metrics = [
    { label: "Avg order value", value: formatGHS(aov) },
    { label: "Total orders", value: orders.length.toString() },
    { label: "Customers", value: customers.length.toString() },
    { label: "Products live", value: products.length.toString() },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <h2 className="font-display text-2xl font-bold">Analytics</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border rounded-2xl p-5">
            <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
            <div className="font-display text-2xl font-bold">{m.value}</div>
            <div className="text-xs font-semibold text-success flex items-center gap-1 mt-2"><TrendingUp className="size-3" /> Live</div>
          </motion.div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-card border rounded-2xl p-16 text-center">
          <BarChart3 className="size-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg font-bold mb-1">No data to chart yet</h3>
          <p className="text-sm text-muted-foreground">Charts and trends will appear here once orders start coming in.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold mb-5">Top products by sales</h3>
          <div className="space-y-3">
            {products.slice(0, 5).map((p) => {
              const sold = orders.flatMap((o) => o.items).filter((i) => i.productId === p.id).reduce((s, i) => s + i.quantity, 0);
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <img src={p.image} alt="" className="size-10 rounded-lg object-cover bg-muted" />
                  <div className="flex-1 text-sm font-semibold">{p.name}</div>
                  <div className="text-sm font-semibold">{sold} sold</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
