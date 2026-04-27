import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { revenueSeries, orders, adminCustomers } from "@/data/dashboardMock";
import { products } from "@/data/catalog";
import { formatGHS } from "@/lib/format";

const conversion = [
  { label: "Visitors", value: "24,820" },
  { label: "Add to cart", value: "5,140", pct: "20.7%" },
  { label: "Checkouts started", value: "1,820", pct: "7.3%" },
  { label: "Orders completed", value: orders.length.toString(), pct: "5.1%" },
];

const max = Math.max(...revenueSeries.map((r) => r.value));

const channelData = [
  { name: "Direct", value: 38, color: "hsl(var(--primary))" },
  { name: "Social", value: 28, color: "hsl(var(--accent))" },
  { name: "Search", value: 22, color: "hsl(var(--primary-glow))" },
  { name: "Referral", value: 12, color: "hsl(var(--muted-foreground))" },
];

const Analytics = () => (
  <div className="space-y-8">
    <h2 className="font-display text-2xl font-bold">Analytics</h2>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Avg order value", value: formatGHS(orders.reduce((s, o) => s + o.total, 0) / orders.length), trend: "+4.2%", up: true },
        { label: "Conversion rate", value: "5.1%", trend: "+0.6%", up: true },
        { label: "Returning customers", value: "42%", trend: "+3.1%", up: true },
        { label: "Cart abandonment", value: "64%", trend: "-2.4%", up: false },
      ].map((m, i) => (
        <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border rounded-2xl p-5">
          <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
          <div className="font-display text-2xl font-bold">{m.value}</div>
          <div className={`text-xs font-semibold flex items-center gap-1 mt-2 ${m.up ? "text-success" : "text-destructive"}`}>
            {m.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />} {m.trend}
          </div>
        </motion.div>
      ))}
    </div>

    <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
      <div className="bg-card border rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold mb-6">Revenue trend</h3>
        <div className="flex items-end gap-3 h-64">
          {revenueSeries.map((r, i) => (
            <div key={r.day} className="flex-1 flex flex-col items-center gap-2">
              <motion.div initial={{ height: 0 }} animate={{ height: `${(r.value / max) * 100}%` }} transition={{ delay: i * 0.07, duration: 0.6 }} className="w-full rounded-t-lg bg-emerald-gold" />
              <span className="text-xs text-muted-foreground">{r.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold mb-6">Traffic by channel</h3>
        <div className="space-y-4">
          {channelData.map((c) => (
            <div key={c.name}>
              <div className="flex justify-between text-sm mb-1.5"><span>{c.name}</span><span className="font-semibold">{c.value}%</span></div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${c.value}%` }} transition={{ duration: 0.7 }} className="h-full" style={{ background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card border rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold mb-5">Conversion funnel</h3>
        <div className="space-y-3">
          {conversion.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="text-sm w-44">{s.label}</div>
              <div className="flex-1 h-9 rounded-lg bg-muted overflow-hidden relative">
                <motion.div initial={{ width: 0 }} animate={{ width: `${100 - i * 22}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} className="h-full bg-emerald-gold flex items-center px-3 text-xs text-primary-foreground font-semibold">{s.value}</motion.div>
              </div>
              {s.pct && <div className="text-xs text-muted-foreground w-12 text-right">{s.pct}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold mb-5">Top customers</h3>
        <div className="space-y-3">
          {[...adminCustomers].sort((a, b) => b.spent - a.spent).slice(0, 5).map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-emerald-gold grid place-items-center text-primary-foreground text-sm font-bold">{c.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold line-clamp-1">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.orders} orders</div>
              </div>
              <div className="text-sm font-semibold">{formatGHS(c.spent)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-card border rounded-2xl p-6">
      <h3 className="font-display text-lg font-bold mb-5">Best-selling products</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.slice(0, 4).map((p, i) => (
          <div key={p.id} className="bg-muted/40 rounded-xl p-3">
            <img src={p.image} alt="" className="aspect-square rounded-lg object-cover w-full bg-muted mb-3" />
            <div className="text-sm font-semibold line-clamp-1">{p.name}</div>
            <div className="text-xs text-muted-foreground">{(420 - i * 60)} sold</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Analytics;
