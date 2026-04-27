import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/catalog";

const Categories = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <h2 className="font-display text-2xl font-bold">Categories</h2>
      <Button className="rounded-full"><Plus className="size-4 mr-2" />New category</Button>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((c) => (
        <div key={c.id} className="bg-card border rounded-2xl p-5 group">
          <div className="flex items-start justify-between mb-3">
            <div className="size-12 rounded-xl bg-emerald-gold grid place-items-center text-2xl">{c.icon}</div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="size-8"><Pencil className="size-3.5" /></Button>
              <Button size="icon" variant="ghost" className="size-8"><Trash2 className="size-3.5" /></Button>
            </div>
          </div>
          <div className="font-display text-lg font-bold">{c.name}</div>
          <div className="text-xs text-muted-foreground">{c.count} products</div>
        </div>
      ))}
    </div>
  </div>
);

export default Categories;
