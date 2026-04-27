import { useState } from "react";
import { CreditCard, Plus, Trash2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { myPaymentMethods } from "@/data/dashboardMock";
import { toast } from "sonner";

const Payment = () => {
  const [list, setList] = useState(myPaymentMethods);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold">Payment methods</h2>
        <Button className="rounded-full"><Plus className="size-4 mr-2" />Add method</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((m) => (
          <div key={m.id} className={`relative overflow-hidden rounded-2xl p-6 text-primary-foreground ${m.type === "MoMo" ? "bg-emerald-gold" : "bg-hero"}`}>
            <div className="flex items-center justify-between mb-10">
              <div className="size-10 rounded-xl bg-white/15 grid place-items-center">
                {m.type === "MoMo" ? <Smartphone className="size-5" /> : <CreditCard className="size-5" />}
              </div>
              <button onClick={() => { setList(list.filter((x) => x.id !== m.id)); toast.success("Removed"); }} className="size-8 rounded-full bg-white/15 grid place-items-center hover:bg-white/25"><Trash2 className="size-3.5" /></button>
            </div>
            <div className="font-display text-xl font-bold tracking-widest">{m.detail}</div>
            <div className="flex items-center justify-between mt-3 text-xs opacity-90">
              <span>{m.label}</span>
              {m.isDefault && <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-bold">Default</span>}
            </div>
            <div className="absolute -right-10 -bottom-10 size-44 rounded-full bg-white/10 blur-2xl" />
          </div>
        ))}
      </div>

      <div className="bg-muted/50 rounded-2xl p-5 text-sm text-muted-foreground">
        🔒 Your payment information is encrypted and processed securely via Paystack. We never store your full card details.
      </div>
    </div>
  );
};

export default Payment;
