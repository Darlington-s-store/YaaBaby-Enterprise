import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { categories } from "@/data/catalog";
import { useProducts, generateProductId, slugify } from "@/store/useProducts";
import type { Product } from "@/data/catalog";

type FormState = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: string;
  compareAt: string;
  stock: string;
  rating: string;
  reviews: string;
  description: string;
  images: string[];
  badges: string;
  colors: string;
  sizes: string;
};

const empty: FormState = {
  id: "", name: "", slug: "", brand: "", category: "",
  price: "", compareAt: "", stock: "", rating: "0", reviews: "0",
  description: "", images: [], badges: "", colors: "", sizes: "",
};

const fromProduct = (p: Product): FormState => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  brand: p.brand,
  category: p.category,
  price: String(p.price),
  compareAt: p.compareAt ? String(p.compareAt) : "",
  stock: String(p.stock),
  rating: String(p.rating),
  reviews: String(p.reviews),
  description: p.description,
  images: p.images?.length ? p.images : (p.image ? [p.image] : []),
  badges: p.badges?.join(", ") ?? "",
  colors: p.colors?.join(", ") ?? "",
  sizes: p.sizes?.join(", ") ?? "",
});

const splitCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

const ProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const isNew = !id || id === "new";
  const existing = useProducts((s) => (isNew ? undefined : s.products.find((p) => p.id === id)));
  const upsert = useProducts((s) => s.upsert);
  const remove = useProducts((s) => s.remove);

  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  // Hydrate the form when the product loads (or once for new)
  useEffect(() => {
    if (isNew) {
      setForm({ ...empty, id: generateProductId() });
    } else if (existing) {
      setForm(fromProduct(existing));
    }
  }, [isNew, existing?.id]);

  // Keep slug in sync with name when slug field hasn't been hand-edited
  const slugAuto = useMemo(() => slugify(form.name), [form.name]);
  const slugIsCustom = useRef(false);

  if (!isNew && !existing) {
    return (
      <div className="bg-card border rounded-2xl p-10 text-center">
        <p className="text-muted-foreground mb-4">Product not found.</p>
        <Link to="/admin/products" className="text-primary font-semibold">← Back to products</Link>
      </div>
    );
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onUpload = (files?: FileList | null) => {
    if (!files?.length) return;
    const readers = Array.from(files).slice(0, 6 - form.images.length).map(
      (f) =>
        new Promise<string>((resolve, reject) => {
          if (f.size > 3 * 1024 * 1024) return reject(new Error(`${f.name} is over 3MB`));
          const r = new FileReader();
          r.onload = () => (typeof r.result === "string" ? resolve(r.result) : reject(new Error("read failed")));
          r.onerror = () => reject(r.error ?? new Error("read failed"));
          r.readAsDataURL(f);
        }),
    );
    Promise.all(readers)
      .then((dataUrls) => set("images", [...form.images, ...dataUrls]))
      .catch((err: Error) => toast.error(err.message));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Name is required";
    if (!form.brand.trim()) return "Brand is required";
    if (!form.category) return "Choose a category";
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) return "Price must be a positive number";
    const stock = Number(form.stock);
    if (!Number.isInteger(stock) || stock < 0) return "Stock must be a non-negative whole number";
    if (form.compareAt && Number(form.compareAt) <= price) return "Compare-at price should be higher than price";
    if (!form.description.trim()) return "Description is required";
    if (form.images.length === 0) return "Add at least one image";
    return null;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) return toast.error(error);
    setSaving(true);
    const finalSlug = (form.slug || slugAuto).trim();
    const product: Product = {
      id: form.id,
      name: form.name.trim(),
      slug: finalSlug,
      brand: form.brand.trim(),
      category: form.category,
      price: Number(form.price),
      compareAt: form.compareAt ? Number(form.compareAt) : undefined,
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      image: form.images[0],
      images: form.images,
      badges: splitCsv(form.badges),
      stock: Number(form.stock),
      description: form.description.trim(),
      colors: splitCsv(form.colors),
      sizes: splitCsv(form.sizes),
    };
    upsert(product);
    setTimeout(() => {
      setSaving(false);
      toast.success(isNew ? "Product created" : "Product updated");
      navigate("/admin/products");
    }, 250);
  };

  const onDelete = () => {
    if (isNew) return;
    remove(form.id);
    toast.success("Product deleted");
    navigate("/admin/products");
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to products
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">{isNew ? "New product" : form.name || "Edit product"}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">SKU · {form.id || "—"}</p>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="size-4 mr-1.5" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                  <AlertDialogDescription>This permanently removes "{form.name}" from the catalogue.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="submit" disabled={saving} className="rounded-full">
            {saving ? "Saving…" : isNew ? "Publish product" : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <div>
              <Label>Product name</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5" placeholder="Nova Wireless Headphones" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={6} value={form.description} onChange={(e) => set("description", e.target.value)} className="mt-1.5" placeholder="Tell customers what makes this product special…" />
              <p className="text-xs text-muted-foreground mt-1">{form.description.length} characters</p>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <Label>Images <span className="text-muted-foreground font-normal">({form.images.length}/6)</span></Label>
              {form.images.length < 6 && (
                <Button type="button" variant="ghost" size="sm" className="text-primary" onClick={() => fileRef.current?.click()}>
                  <Upload className="size-4 mr-1" /> Upload
                </Button>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onUpload(e.target.files)} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted border group">
                  <img src={img} alt={`Image ${i + 1}`} className="size-full object-cover" />
                  {i === 0 && <span className="absolute top-1.5 left-1.5 text-[9px] uppercase tracking-wider font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Cover</span>}
                  <button
                    type="button"
                    onClick={() => set("images", form.images.filter((_, k) => k !== i))}
                    className="absolute top-1.5 right-1.5 size-6 grid place-items-center rounded-full bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              {form.images.length < 6 && (
                <button type="button" onClick={() => fileRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed grid place-items-center hover:bg-muted/50 transition-colors">
                  <div className="text-center text-muted-foreground">
                    <Upload className="size-5 mx-auto mb-1" />
                    <span className="text-xs">Add photo</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
            <div><Label>Price (GH₵)</Label><Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} className="mt-1.5" /></div>
            <div><Label>Compare at <span className="text-muted-foreground font-normal">(optional)</span></Label><Input type="number" min={0} step="0.01" value={form.compareAt} onChange={(e) => set("compareAt", e.target.value)} className="mt-1.5" /></div>
            <div><Label>Stock on hand</Label><Input type="number" min={0} step="1" value={form.stock} onChange={(e) => set("stock", e.target.value)} className="mt-1.5" /></div>
            <div><Label>Average rating <span className="text-muted-foreground font-normal">(seed)</span></Label><Input type="number" min={0} max={5} step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)} className="mt-1.5" /></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold">Organisation</h3>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose category" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => set("brand", e.target.value)} className="mt-1.5" placeholder="Aurix" /></div>
            <div>
              <Label>Tags / badges <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
              <Input value={form.badges} onChange={(e) => set("badges", e.target.value)} className="mt-1.5" placeholder="New, Best Seller" />
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold">Variants</h3>
            <div><Label>Colours</Label><Input value={form.colors} onChange={(e) => set("colors", e.target.value)} className="mt-1.5" placeholder="Onyx, Gold, Cream" /></div>
            <div><Label>Sizes</Label><Input value={form.sizes} onChange={(e) => set("sizes", e.target.value)} className="mt-1.5" placeholder="S, M, L, XL" /></div>
          </div>

          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold">SEO</h3>
            <div>
              <Label>URL slug</Label>
              <Input
                value={form.slug || (slugIsCustom.current ? "" : slugAuto)}
                onChange={(e) => { slugIsCustom.current = true; set("slug", e.target.value); }}
                className="mt-1.5 font-mono text-sm"
                placeholder="auto-generated from name"
              />
              <p className="text-xs text-muted-foreground mt-1">/product/{(form.slug || slugAuto) || "your-product"}</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductEditor;
