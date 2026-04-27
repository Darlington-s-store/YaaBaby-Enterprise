import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/useCart";
import { formatGHS } from "@/lib/format";

const Cart = () => {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  const shipping = subtotal === 0 ? 0 : subtotal >= 500 ? 0 : 30;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-x mx-auto max-w-2xl py-24 text-center">
        <div className="size-20 rounded-full bg-muted grid place-items-center mx-auto mb-6">
          <ShoppingBag className="size-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Discover bestsellers and start filling it up.</p>
        <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90">
          <Link to="/shop">Start shopping <ArrowRight className="ml-2 size-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-x mx-auto max-w-7xl py-8 lg:py-12">
      <h1 className="font-display text-3xl lg:text-5xl font-bold mb-8">Your cart</h1>
      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.productId + (item.variant ?? "")} className="flex gap-4 p-4 bg-card border rounded-2xl">
              <img src={item.image} alt={item.name} className="size-24 sm:size-28 rounded-xl object-cover bg-muted" />
              <div className="flex-1 min-w-0 flex flex-col">
                <Link to={`/product/${item.productId}`} className="font-semibold leading-snug line-clamp-2 hover:text-primary">{item.name}</Link>
                {item.variant && <p className="text-xs text-muted-foreground mt-1">Variant: {item.variant}</p>}
                <div className="mt-auto flex items-end justify-between">
                  <div className="flex items-center border rounded-full">
                    <button onClick={() => setQty(item.productId, item.quantity - 1)} className="size-9 grid place-items-center hover:bg-muted rounded-l-full"><Minus className="size-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => setQty(item.productId, item.quantity + 1)} className="size-9 grid place-items-center hover:bg-muted rounded-r-full"><Plus className="size-3.5" /></button>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatGHS(item.price * item.quantity)}</div>
                    <button onClick={() => remove(item.productId)} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1 mt-1">
                      <Trash2 className="size-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-28 self-start bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Order summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatGHS(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatGHS(shipping)}</span></div>
            {subtotal < 500 && (
              <div className="text-xs text-accent-foreground bg-accent/20 rounded-lg p-3">
                Add {formatGHS(500 - subtotal)} more for free delivery 🚚
              </div>
            )}
          </div>
          <div className="flex justify-between font-bold text-lg pt-3 border-t">
            <span>Total</span><span>{formatGHS(total)}</span>
          </div>
          <Button asChild size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">
            <Link to="/checkout">Checkout <ArrowRight className="ml-2 size-4" /></Link>
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">Secure checkout · Paystack & MoMo</p>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
