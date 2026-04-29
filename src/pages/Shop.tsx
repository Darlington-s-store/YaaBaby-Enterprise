import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, ChevronRight, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { categories } from "@/data/catalog";
import { formatGHS } from "@/lib/format";
import { useProducts } from "@/store/useProducts";

const Shop = () => {
  const products = useProducts((s) => s.products);
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat");
  const sale = params.get("sale") === "true";

  const [price, setPrice] = useState<[number, number]>([0, 5000]);
  const [brands, setBrands] = useState<string[]>([]);
  const [sort, setSort] = useState("featured");

  const allBrands = Array.from(new Set(products.map((p) => p.brand)));

  const filtered = useMemo(() => {
    let list = products.slice();
    if (cat) list = list.filter((p) => p.category === cat);
    if (sale) list = list.filter((p) => p.compareAt);
    list = list.filter((p) => p.price >= price[0] && p.price <= price[1]);
    if (brands.length) list = list.filter((p) => brands.includes(p.brand));
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [cat, sale, price, brands, sort]);

  const Filters = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => { params.delete("cat"); setParams(params); }}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${!cat ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >All categories</button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { params.set("cat", c.id); setParams(params); }}
              className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition ${cat === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            ><span>{c.icon} {c.name}</span><ChevronRight className="size-3.5 opacity-50" /></button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Price (GH₵)</h3>
        <Slider value={price} onValueChange={(v) => setPrice(v as [number, number])} min={0} max={5000} step={50} />
        <div className="flex justify-between text-sm mt-3 text-muted-foreground">
          <span>{formatGHS(price[0])}</span><span>{formatGHS(price[1])}</span>
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Brands</h3>
        <div className="space-y-2.5">
          {allBrands.map((b) => (
            <label key={b} className="flex items-center gap-2.5 cursor-pointer text-sm">
              <Checkbox
                checked={brands.includes(b)}
                onCheckedChange={(c) => setBrands(c ? [...brands, b] : brands.filter((x) => x !== b))}
              />
              {b}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-x mx-auto max-w-7xl py-8 lg:py-12">
      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">Shop</span>
        {cat && <><ChevronRight className="size-3.5" /><span className="text-foreground capitalize">{categories.find((c) => c.id === cat)?.name}</span></>}
      </nav>

      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-5xl font-bold mb-2">
            {sale ? "Flash Sale" : cat ? categories.find((c) => c.id === cat)?.name : "All products"}
          </h1>
          <p className="text-muted-foreground text-sm">{filtered.length} products</p>
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden rounded-full">
                <Filter className="size-4 mr-2" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="mt-6"><Filters /></div>
            </SheetContent>
          </Sheet>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px] rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
              <SelectItem value="rating">Top rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden lg:block sticky top-28 self-start">
          <Filters />
        </aside>
        <div>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No products match your filters.</p>
              <Button variant="outline" onClick={() => { setBrands([]); setPrice([0, 5000]); setParams({}); }}>
                <X className="size-4 mr-2" /> Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
