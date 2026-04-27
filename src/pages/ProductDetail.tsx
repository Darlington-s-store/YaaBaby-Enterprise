import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag, Heart, Truck, ShieldCheck, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { products } from "@/data/catalog";
import { useCart } from "@/store/useCart";
import { formatGHS } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";

const ProductDetail = () => {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<string | undefined>();

  if (!product) return <Navigate to="/shop" replace />;

  const variants = product.colors || product.sizes;
  const variantLabel = product.colors ? "Color" : product.sizes ? "Size" : "";
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="container-x mx-auto max-w-7xl py-8 lg:py-12">
      <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="aspect-square rounded-3xl overflow-hidden bg-muted relative"
        >
          <img src={product.image} alt={product.name} className="size-full object-cover" />
          {product.badges && (
            <div className="absolute top-5 left-5 flex flex-col gap-2">
              {product.badges.map((b) => (
                <span key={b} className={`text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${b.startsWith("-") ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"}`}>{b}</span>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="space-y-6"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">{product.brand}</p>
            <h1 className="font-display text-3xl lg:text-5xl font-bold leading-tight mb-4">{product.name}</h1>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`size-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold">{formatGHS(product.price)}</span>
            {product.compareAt && (
              <>
                <span className="text-xl text-muted-foreground line-through">{formatGHS(product.compareAt)}</span>
                <span className="text-sm font-semibold text-success">
                  Save {formatGHS(product.compareAt - product.price)}
                </span>
              </>
            )}
          </div>

          <p className="text-foreground/75 leading-relaxed">{product.description}</p>

          {variants && (
            <div>
              <div className="text-sm font-semibold mb-3">{variantLabel}: <span className="text-muted-foreground font-normal">{variant ?? "Select"}</span></div>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVariant(v)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${variant === v ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
                  >{v}</button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="size-11 grid place-items-center hover:bg-muted rounded-l-full"><Minus className="size-4" /></button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="size-11 grid place-items-center hover:bg-muted rounded-r-full"><Plus className="size-4" /></button>
            </div>
            <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 h-13 rounded-full font-semibold bg-primary hover:bg-primary/90 h-12"
              onClick={() => {
                if (variants && !variant) {
                  toast.error(`Please select a ${variantLabel.toLowerCase()}`);
                  return;
                }
                add(product, qty, variant);
                toast.success(`Added ${qty} × ${product.name}`);
              }}
            >
              <ShoppingBag className="size-4 mr-2" /> Add to cart · {formatGHS(product.price * qty)}
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-12 size-12 p-0">
              <Heart className="size-5" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t">
            {[
              { icon: Truck, text: "24h delivery" },
              { icon: ShieldCheck, text: "Authentic" },
              { icon: RotateCcw, text: "30-day returns" },
            ].map((f) => (
              <div key={f.text} className="text-center">
                <f.icon className="size-5 mx-auto mb-1.5 text-primary" />
                <div className="text-xs font-medium">{f.text}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="mt-16">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-12 p-0">
          {["details", "reviews", "shipping"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 h-12 font-semibold">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="details" className="prose max-w-2xl pt-8 text-foreground/80">
          <p>{product.description}</p>
          <ul>
            <li>Brand: {product.brand}</li>
            <li>Category: {product.category}</li>
            <li>SKU: YBE-{product.id.padStart(5, "0")}</li>
            <li>In stock: {product.stock} units</li>
          </ul>
        </TabsContent>
        <TabsContent value="reviews" className="pt-8 max-w-2xl">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-5xl font-display font-bold">{product.rating}</div>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} className={`size-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />)}
              </div>
              <p className="text-sm text-muted-foreground">{product.reviews} verified reviews</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">Reviews UI coming next iteration.</p>
        </TabsContent>
        <TabsContent value="shipping" className="pt-8 max-w-2xl prose text-foreground/80">
          <p>Free shipping on orders above GH₵500. Standard delivery 24-48 hours within Accra; 2-4 days nationwide. Cash on delivery available.</p>
        </TabsContent>
      </Tabs>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl lg:text-3xl font-bold mb-8">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
