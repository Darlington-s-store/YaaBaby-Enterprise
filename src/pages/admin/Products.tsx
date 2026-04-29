import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/catalog";
import { useProducts } from "@/store/useProducts";
import { formatGHS } from "@/lib/format";
import { toast } from "sonner";

const Products = () => {
  const products = useProducts((s) => s.products);
  const remove = useProducts((s) => s.remove);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const filtered = products.filter((p) => (cat === "all" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold">Products <span className="text-muted-foreground">({products.length})</span></h2>
        <Button asChild className="rounded-full"><Link to="/admin/products/new"><Plus className="size-4 mr-2" />New product</Link></Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="pl-10 h-10 rounded-full bg-muted/60 border-transparent" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setCat("all")} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${cat === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-background"}`}>All</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${cat === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-background"}`}>{c.name}</button>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Brand</th>
                <th className="text-right p-4">Price</th>
                <th className="text-right p-4">Stock</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex gap-3 items-center">
                      <img src={p.image} alt="" className="size-12 rounded-lg object-cover bg-muted" />
                      <div>
                        <div className="font-semibold line-clamp-1">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.rating}★ · {p.reviews}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground capitalize">{p.category}</td>
                  <td className="p-3">{p.brand}</td>
                  <td className="p-3 text-right font-semibold">{formatGHS(p.price)}</td>
                  <td className="p-3 text-right">
                    <span className={`text-xs font-bold ${p.stock < 15 ? "text-destructive" : "text-success"}`}>{p.stock}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button asChild size="icon" variant="ghost" className="size-8"><Link to={`/admin/products/${p.id}`}><Pencil className="size-3.5" /></Link></Button>
                      <Button size="icon" variant="ghost" className="size-8" onClick={() => { remove(p.id); toast.success("Product deleted"); }}><Trash2 className="size-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
