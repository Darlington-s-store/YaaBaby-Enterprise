import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart, useAuth } from "@/store/useCart";
import { useOrders, useAddresses } from "@/store/useStore";
import { formatGHS } from "@/lib/format";
import { toast } from "sonner";

const Checkout = () => {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const user = useAuth((s) => s.user);
  const place = useOrders((s) => s.place);
  const allAddresses = useAddresses((s) => s.addresses);
  const myAddresses = user ? allAddresses.filter((a) => a.userId === user.id) : [];
  const navigate = useNavigate();
  const [method, setMethod] = useState<"paystack" | "momo" | "cod">("paystack");
  const [step, setStep] = useState<"form" | "success">("form");
  const [placedId, setPlacedId] = useState<string>("");

  const defaultAddr = myAddresses.find((a) => a.isDefault) ?? myAddresses[0];
  const [form, setForm] = useState({
    email: user?.email ?? "",
    phone: defaultAddr?.phone ?? "",
    firstName: user?.name?.split(" ")[0] ?? "",
    lastName: user?.name?.split(" ").slice(1).join(" ") ?? "",
    address: defaultAddr?.line1 ?? "",
    city: defaultAddr?.city ?? "Accra",
    region: defaultAddr?.region ?? "Greater Accra",
  });

  if (!user) return <Navigate to="/login" replace state={{ from: "/checkout" }} />;
  if (items.length === 0 && step !== "success") return <Navigate to="/cart" replace />;

  const shipping = subtotal >= 500 ? 0 : 30;
  const tax = Math.round(subtotal * 0.025);
  const total = subtotal + shipping + tax;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentLabel = method === "paystack" ? "Paystack" : method === "momo" ? "MoMo" : "Cash on delivery";
    toast.success(method === "cod" ? "Placing your order…" : "Redirecting to Paystack…");
    setTimeout(() => {
      const order = place({
        userId: user.id,
        customer: { name: `${form.firstName} ${form.lastName}`.trim(), email: form.email, phone: form.phone },
        items: items.map((i) => ({ productId: i.productId, name: i.name, image: i.image, price: i.price, quantity: i.quantity, variant: i.variant })),
        subtotal, shipping, tax, total,
        payment: paymentLabel,
        shippingAddress: { name: `${form.firstName} ${form.lastName}`.trim(), line1: form.address, city: form.city, region: form.region, phone: form.phone },
      });
      clear();
      setPlacedId(order.id);
      setStep("success");
    }, 800);
  };

  if (step === "success") {
    return (
      <div className="container-x mx-auto max-w-xl py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="size-20 rounded-full bg-success/15 grid place-items-center mx-auto mb-6">
            <CheckCircle2 className="size-10 text-success" />
          </div>
        </motion.div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold mb-3">Order confirmed</h1>
        <p className="text-muted-foreground mb-2">Order <strong className="text-foreground">{placedId}</strong></p>
        <p className="text-muted-foreground mb-8">A confirmation has been sent to your email. Track its progress from your dashboard.</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Button asChild variant="outline" className="rounded-full"><Link to={`/account/orders/${placedId}`}>View order</Link></Button>
          <Button asChild className="rounded-full bg-primary hover:bg-primary/90"><Link to="/shop">Keep shopping</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x mx-auto max-w-7xl py-8 lg:py-12">
      <h1 className="font-display text-3xl lg:text-5xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <form onSubmit={onSubmit} className="space-y-8">
          <section className="bg-card border rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold mb-5">Contact</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 h-11" /></div>
              <div><Label>Phone</Label><Input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+233 …" className="mt-1.5 h-11" /></div>
            </div>
          </section>

          <section className="bg-card border rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold mb-5">Shipping address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>First name</Label><Input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1.5 h-11" /></div>
              <div><Label>Last name</Label><Input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-1.5 h-11" /></div>
              <div className="sm:col-span-2"><Label>Address</Label><Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5 h-11" /></div>
              <div><Label>City</Label><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5 h-11" /></div>
              <div><Label>Region</Label><Input required value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="mt-1.5 h-11" /></div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">💡 Save more addresses anytime from your <Link to="/account/addresses" className="text-primary font-semibold">account</Link>.</p>
          </section>

          <section className="bg-card border rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold mb-5">Payment</h2>
            <RadioGroup value={method} onValueChange={(v) => setMethod(v as typeof method)} className="space-y-2">
              {[
                { id: "paystack", label: "Paystack — Card / Bank", desc: "Visa, Mastercard, bank transfer" },
                { id: "momo", label: "Mobile Money (MoMo)", desc: "MTN, Vodafone, AirtelTigo" },
                { id: "cod", label: "Cash on delivery", desc: "Pay when your order arrives" },
              ].map((p) => (
                <label key={p.id} className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition ${method === p.id ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}>
                  <RadioGroupItem value={p.id} className="mt-1" />
                  <div>
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </section>

          <Button type="submit" size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">
            <Lock className="size-4 mr-2" /> Pay {formatGHS(total)} securely
          </Button>
        </form>

        <aside className="lg:sticky lg:top-28 self-start bg-card border rounded-2xl p-6 space-y-4 h-fit">
          <h2 className="font-display text-lg font-bold">Order summary</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {items.map((i) => (
              <div key={i.productId + (i.variant ?? "")} className="flex gap-3 text-sm">
                <img src={i.image} alt={i.name} className="size-14 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="line-clamp-1 font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">Qty {i.quantity}</div>
                </div>
                <div className="font-semibold">{formatGHS(i.price * i.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatGHS(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatGHS(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatGHS(tax)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>{formatGHS(total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
