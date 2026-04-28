import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useTaxonomy } from "@/store/useStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Categories = () => {
  const { categories, addCategory, updateCategory, removeCategory, addSubcategory, removeSubcategory, addBrand, removeBrand, resetToDefaults } = useTaxonomy();
  const [openCat, setOpenCat] = useState<string | null>(categories[0]?.id ?? null);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🛍️");

  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const [subInput, setSubInput] = useState<Record<string, string>>({});
  const [brandInput, setBrandInput] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Categories, subcategories & brands</h2>
          <p className="text-sm text-muted-foreground mt-1">Build your catalog taxonomy. Customers see this on the storefront.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => { resetToDefaults(); toast.success("Reset to defaults"); }}>Reset</Button>
          <Dialog open={newCatOpen} onOpenChange={setNewCatOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="size-4 mr-2" />New category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New category</DialogTitle></DialogHeader>
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!newCatName.trim()) return; addCategory(newCatName, newCatIcon); toast.success("Category added"); setNewCatName(""); setNewCatOpen(false); }}>
                <div><Label>Name</Label><Input required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="e.g. Garden & Outdoor" /></div>
                <div><Label>Icon (emoji)</Label><Input value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} placeholder="🛍️" /></div>
                <DialogFooter><Button type="submit" className="rounded-full">Create</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="bg-card border rounded-2xl p-16 text-center">
          <Tag className="size-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No categories yet.</p>
          <Button onClick={() => setNewCatOpen(true)} className="rounded-full"><Plus className="size-4 mr-2" />Create your first category</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((c) => {
            const isOpen = openCat === c.id;
            return (
              <div key={c.id} className="bg-card border rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 hover:bg-muted/30">
                  <button onClick={() => setOpenCat(isOpen ? null : c.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    {isOpen ? <ChevronDown className="size-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
                    <div className="size-10 rounded-xl bg-emerald-gold grid place-items-center text-xl shrink-0">{c.icon}</div>
                    <div className="min-w-0">
                      <div className="font-display text-lg font-bold truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.subcategories.length} subcategor{c.subcategories.length === 1 ? "y" : "ies"} · {c.subcategories.reduce((s, x) => s + x.brands.length, 0)} brands</div>
                    </div>
                  </button>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="size-8" onClick={() => { setEditCatId(c.id); setEditName(c.name); setEditIcon(c.icon); }}><Pencil className="size-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive" onClick={() => { if (confirm(`Delete category "${c.name}"?`)) { removeCategory(c.id); toast.success("Category deleted"); } }}><Trash2 className="size-3.5" /></Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t bg-muted/20 p-5 space-y-4">
                    {/* Add subcategory */}
                    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = (subInput[c.id] ?? "").trim(); if (!v) return; addSubcategory(c.id, v); setSubInput({ ...subInput, [c.id]: "" }); toast.success("Subcategory added"); }}>
                      <Input value={subInput[c.id] ?? ""} onChange={(e) => setSubInput({ ...subInput, [c.id]: e.target.value })} placeholder="New subcategory name" className="h-10" />
                      <Button type="submit" className="rounded-full"><Plus className="size-4 mr-1" />Add</Button>
                    </form>

                    {c.subcategories.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No subcategories yet.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {c.subcategories.map((sc) => (
                          <div key={sc.id} className="bg-card border rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-semibold">{sc.name}</div>
                              <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => { if (confirm(`Delete "${sc.name}"?`)) { removeSubcategory(c.id, sc.id); toast.success("Subcategory removed"); } }}><Trash2 className="size-3.5" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {sc.brands.length === 0 && <span className="text-xs text-muted-foreground">No brands</span>}
                              {sc.brands.map((b) => (
                                <span key={b.id} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                  {b.name}
                                  <button onClick={() => removeBrand(c.id, sc.id, b.id)} className="hover:text-destructive"><X className="size-3" /></button>
                                </span>
                              ))}
                            </div>
                            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const key = `${c.id}-${sc.id}`; const v = (brandInput[key] ?? "").trim(); if (!v) return; addBrand(c.id, sc.id, v); setBrandInput({ ...brandInput, [key]: "" }); }}>
                              <Input value={brandInput[`${c.id}-${sc.id}`] ?? ""} onChange={(e) => setBrandInput({ ...brandInput, [`${c.id}-${sc.id}`]: e.target.value })} placeholder="Add brand…" className="h-8 text-sm" />
                              <Button type="submit" size="sm" variant="outline" className="rounded-full">Add</Button>
                            </form>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit category dialog */}
      <Dialog open={!!editCatId} onOpenChange={(o) => !o && setEditCatId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit category</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!editCatId) return; updateCategory(editCatId, { name: editName, icon: editIcon }); toast.success("Updated"); setEditCatId(null); }}>
            <div><Label>Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div><Label>Icon</Label><Input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} /></div>
            <DialogFooter><Button type="submit" className={cn("rounded-full")}>Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
