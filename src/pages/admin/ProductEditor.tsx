import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { products, categories } from "@/data/catalog";
import { toast } from "sonner";

const ProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const product = isNew ? null : products.find((p) => p.id === id);

  if (!isNew && !product)
    return (
      <div className="bg-card border rounded-2xl p-10 text-center">
        <p className="text-muted-foreground mb-4">Product not found.</p>
        <Link to="/admin/products" className="text-primary font-semibold">Back to products</Link>
      </div>
    );

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); toast.success(isNew ? "Product created" : "Product updated"); navigate("/admin/products"); }}>
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to products
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold">{isNew ? "New product" : product!.name}</h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="rounded-full">Save as draft</Button>
          <Button type="submit" className="rounded-full">{isNew ? "Publish product" : "Save changes"}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <div><Label>Product name</Label><Input defaultValue={product?.name} placeholder="Nova Wireless Headphones" /></div>
            <div><Label>Description</Label><Textarea rows={6} defaultValue={product?.description} placeholder="Tell customers what makes this product special…" /></div>
          </div>

          <div className="bg-card border rounded-2xl p-6">
            <Label className="block mb-3">Images</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {product?.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted border">
                  <img src={img} alt="" className="size-full object-cover" />
                </div>
              ))}
              <button type="button" className="aspect-square rounded-xl border-2 border-dashed grid place-items-center hover:bg-muted/50 transition-colors">
                <div className="text-center text-muted-foreground">
                  <Upload className="size-5 mx-auto mb-1" />
                  <span className="text-xs">Upload</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
            <div><Label>Price (GHS)</Label><Input type="number" defaultValue={product?.price} /></div>
            <div><Label>Compare at</Label><Input type="number" defaultValue={product?.compareAt ?? ""} /></div>
            <div><Label>SKU</Label><Input defaultValue={product?.id ? `SKU-${product.id}-001` : ""} /></div>
            <div><Label>Stock</Label><Input type="number" defaultValue={product?.stock} /></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold">Organisation</h3>
            <div>
              <Label>Category</Label>
              <Select defaultValue={product?.category}>
                <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Brand</Label><Input defaultValue={product?.brand} placeholder="Aurix" /></div>
            <div><Label>Tags / badges</Label><Input defaultValue={product?.badges?.join(", ")} placeholder="New, Best Seller" /></div>
          </div>

          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold">Variants</h3>
            <div><Label>Colors</Label><Input defaultValue={product?.colors?.join(", ")} placeholder="Onyx, Gold, Cream" /></div>
            <div><Label>Sizes</Label><Input defaultValue={product?.sizes?.join(", ")} placeholder="S, M, L, XL" /></div>
          </div>

          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold">SEO</h3>
            <div><Label>URL slug</Label><Input defaultValue={product?.slug} /></div>
            <div><Label>Meta title</Label><Input placeholder={product?.name} /></div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductEditor;
