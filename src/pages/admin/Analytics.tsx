import { motion } from "framer-motion";
import { TrendingUp, BarChart3, ShoppingBag, Users, Calendar, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrders, useUsers } from "@/store/useStore";
import { formatGHS } from "@/lib/format";
import { useProducts } from "@/store/useProducts";
import { useVisualSearch } from "@/store/useStore";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { useEffect, useMemo } from "react";
import { subDays, format, startOfDay, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

const Analytics = () => {
  const { products, fetchProducts } = useProducts();
  const { orders, fetchAllOrders } = useOrders();
  const users = useUsers((s) => s.users);

  const { history, fetchHistory, updateRecord } = useVisualSearch();
  
  useEffect(() => {
    fetchProducts();
    fetchAllOrders();
    fetchHistory();
  }, [fetchProducts, fetchAllOrders, fetchHistory]);

  const customers = users.filter((u) => u.role === "Customer");
  const aov = orders.length ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0;

  // Generate chart data from last 7 days
  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dateObj = subDays(new Date(), 6 - i);
      const dayOrders = orders.filter(o => isSameDay(new Date(o.date), dateObj));
      return {
        name: format(dateObj, "EEE"),
        revenue: dayOrders.reduce((s, o) => s + o.total, 0),
        orders: dayOrders.length
      };
    });
  }, [orders]);

  const metrics = [
    { label: "Avg order value", value: formatGHS(aov), icon: TrendingUp },
    { label: "Total orders", value: orders.length.toString(), icon: ShoppingBag },
    { label: "Customers", value: customers.length.toString(), icon: Users },
    { label: "Products live", value: products.length.toString(), icon: Calendar },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Analytics</h2>
        <div className="text-xs font-semibold bg-muted px-3 py-1 rounded-full text-muted-foreground flex items-center gap-1.5">
          <Calendar className="size-3" /> Last 7 Days
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border rounded-2xl p-5 shadow-sm-elegant">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{m.label}</div>
              <m.icon className="size-4 text-primary/40" />
            </div>
            <div className="font-display text-2xl font-bold">{m.value}</div>
            <div className="text-[10px] font-bold text-success flex items-center gap-1 mt-2 uppercase tracking-tight">Live tracking active</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card border rounded-3xl p-6 shadow-sm-elegant">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display text-lg font-bold">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Sales performance over the last week</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Revenue</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }} 
                  tickFormatter={(v) => `GH₵${v}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid hsl(var(--border))', 
                    boxShadow: 'var(--shadow-elegant)',
                    fontSize: '12px'
                  }}
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart/List */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm-elegant">
          <h3 className="font-display text-lg font-bold mb-1">Top Sellers</h3>
          <p className="text-xs text-muted-foreground mb-6">Best performing items</p>
          
          <div className="space-y-4">
            {products.slice(0, 5).map((p, i) => {
              const sold = orders.flatMap((o) => o.items).filter((it) => it.productId === p.id).reduce((s, it) => s + it.quantity, 0);
              return (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted/30 transition-colors">
                  <div className="relative">
                    <img src={p.image} alt="" className="size-12 rounded-xl object-cover bg-muted border border-border/50" />
                    <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full bg-primary text-[10px] text-primary-foreground font-bold grid place-items-center border-2 border-card">{i + 1}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{p.name}</div>
                    <div className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">{p.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-primary">{sold}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Sold</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t">
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <Bar dataKey="orders" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border p-2 rounded-lg text-[10px] font-bold shadow-xl">
                          {payload[0].value} Orders
                        </div>
                      );
                    }
                    return null;
                  }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Order Volume (7D)</div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <h3 className="font-display text-sm font-bold mb-4">Category Distribution</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(products.reduce((acc, p) => {
                      acc[p.category] = (acc[p.category] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {products.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={[`hsl(var(--primary))`, `hsl(var(--accent))`, `hsl(var(--emerald-600))`, `hsl(var(--gold-500))`][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Search Section */}
      <div className="bg-card border rounded-3xl p-8 shadow-sm-elegant overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Camera className="size-32" />
        </div>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              Visual Search Insights
              <Sparkles className="size-5 text-accent animate-pulse" />
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Real-time analysis of customer image-based discovery patterns.</p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => fetchHistory()}>
            Refresh Data
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {history.length > 0 ? (
            history.slice(0, 4).map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "group relative rounded-2xl overflow-hidden bg-muted border transition-all",
                  item.isRequest ? "border-accent ring-2 ring-accent/20 shadow-lg shadow-accent/10" : "border-border/50"
                )}
              >
                <img 
                  src={item.imageUrl} 
                  alt="" 
                  className="w-full aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform">
                  {item.isRequest && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      <div className="bg-accent text-accent-foreground text-[10px] font-black px-2 py-1 rounded-md shadow-xl animate-bounce">
                        PRIORITY REQUEST
                      </div>
                      <Button 
                        size="sm" 
                        className="h-7 px-3 text-[10px] rounded-full bg-white text-primary hover:bg-white/90 font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRecord(item.id, { isRequest: false });
                        }}
                      >
                        Mark Handled
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.detectedTags.map(tag => (
                      <span key={tag} className="text-[8px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/60 font-medium">
                      {format(new Date(item.createdAt), 'MMM d, HH:mm')}
                    </span>
                    <span className={cn(
                      "text-[10px] font-black uppercase",
                      item.resultsCount > 0 ? "text-accent" : "text-destructive"
                    )}>
                      {item.resultsCount} Matches
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl">
              <Camera className="size-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No visual searches recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
