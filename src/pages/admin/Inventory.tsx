import { AlertTriangle, Package } from "lucide-react";
import { products } from "@/data/catalog";

const Inventory = () => {
  const sorted = [...products].sort((a, b) => a.stock - b.stock);
  const low = sorted.filter((p) => p.stock < 15);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Inventory</h2>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-2xl p-5">
          <div className="size-10 rounded-xl bg-success/15 grid place-items-center mb-3"><Package className="size-5 text-success" /></div>
          <div className="font-display text-2xl font-bold">{products.reduce((s, p) => s + p.stock, 0)}</div>
          <div className="text-xs text-muted-foreground mt-1">Units in stock</div>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <div className="size-10 rounded-xl bg-destructive/15 grid place-items-center mb-3"><AlertTriangle className="size-5 text-destructive" /></div>
          <div className="font-display text-2xl font-bold">{low.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Low-stock SKUs</div>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <div className="size-10 rounded-xl bg-primary/10 grid place-items-center mb-3"><Package className="size-5 text-primary" /></div>
          <div className="font-display text-2xl font-bold">{products.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Active products</div>
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        <div className="p-5 border-b font-display font-bold">Stock levels</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
              <tr><th className="text-left p-4">Product</th><th className="text-left p-4">Brand</th><th className="text-right p-4">Stock</th><th className="text-left p-4 w-1/3">Level</th></tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const pct = Math.min(100, (p.stock / 150) * 100);
                const cls = p.stock < 15 ? "bg-destructive" : p.stock < 50 ? "bg-accent" : "bg-success";
                return (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">
                      <div className="flex gap-3 items-center">
                        <img src={p.image} alt="" className="size-10 rounded-lg object-cover bg-muted" />
                        <div className="font-semibold line-clamp-1">{p.name}</div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.brand}</td>
                    <td className="p-3 text-right font-semibold">{p.stock}</td>
                    <td className="p-3"><div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full ${cls}`} style={{ width: `${pct}%` }} /></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
