import { useState } from "react";
import { 
  CreditCard, Smartphone, Plus, Trash2, 
  CheckCircle2, ShieldCheck, Info,
  MoreVertical, CreditCard as CardIcon,
  Phone as MobileIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/useCart";
import { usePaymentMethods, PaymentMethod } from "@/store/useStore";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Payment = () => {
  const user = useAuth((s) => s.user);
  const { methods, add, remove, setDefault } = usePaymentMethods();
  const [isOpen, setIsOpen] = useState(false);
  const [methodType, setMethodType] = useState<"card" | "momo">("card");
  
  // Form state
  const [formData, setFormData] = useState({
    provider: "",
    nameOnAccount: "",
    last4: "",
    expiry: "",
    phoneNumber: "",
    isDefault: false
  });

  const userMethods = methods.filter(m => m.userId === user?.id);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (methodType === "card") {
      if (!formData.provider || !formData.last4 || !formData.expiry || !formData.nameOnAccount) {
        return toast.error("Please fill in all card details");
      }
    } else {
      if (!formData.provider || !formData.phoneNumber || !formData.nameOnAccount) {
        return toast.error("Please fill in all Mobile Money details");
      }
    }

    add({
      userId: user.id,
      type: methodType,
      ...formData,
      isDefault: formData.isDefault || userMethods.length === 0
    });

    toast.success("Payment method added successfully");
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      provider: "",
      nameOnAccount: "",
      last4: "",
      expiry: "",
      phoneNumber: "",
      isDefault: false
    });
  };

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Payment Methods</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your saved cards and mobile money accounts for faster checkout.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg shadow-primary/20">
              <Plus className="size-4 mr-2" /> Add New Method
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            <div className="flex p-1 bg-muted rounded-xl mb-4">
              <button 
                onClick={() => setMethodType("card")}
                className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2", methodType === "card" ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}
              >
                <CardIcon className="size-3.5" /> Credit/Debit Card
              </button>
              <button 
                onClick={() => setMethodType("momo")}
                className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2", methodType === "momo" ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}
              >
                <MobileIcon className="size-3.5" /> Mobile Money
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Network / Provider</Label>
                  <Select onValueChange={(v) => setFormData({...formData, provider: v})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {methodType === "card" ? (
                        <>
                          <SelectItem value="Visa">Visa</SelectItem>
                          <SelectItem value="Mastercard">Mastercard</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                          <SelectItem value="Vodafone">Vodafone Cash</SelectItem>
                          <SelectItem value="AirtelTigo">AirtelTigo Money</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Account Name</Label>
                  <Input 
                    placeholder="John Doe" 
                    className="rounded-xl"
                    value={formData.nameOnAccount}
                    onChange={e => setFormData({...formData, nameOnAccount: e.target.value})}
                  />
                </div>

                {methodType === "card" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Last 4 Digits</Label>
                      <Input 
                        placeholder="1234" 
                        maxLength={4} 
                        className="rounded-xl"
                        value={formData.last4}
                        onChange={e => setFormData({...formData, last4: e.target.value.replace(/\D/g, "")})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Expiry</Label>
                      <Input 
                        placeholder="MM/YY" 
                        maxLength={5} 
                        className="rounded-xl"
                        value={formData.expiry}
                        onChange={e => setFormData({...formData, expiry: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label>Phone Number</Label>
                    <Input 
                      placeholder="054..." 
                      className="rounded-xl"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                    checked={formData.isDefault}
                    onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                  />
                  <Label htmlFor="isDefault" className="text-xs font-normal cursor-pointer">Set as default payment method</Label>
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full rounded-xl py-6">Save Method</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {userMethods.map((m) => (
          <div key={m.id} className={cn(
            "group relative bg-card border rounded-2xl p-6 transition-all hover:shadow-lg",
            m.isDefault && "border-primary ring-1 ring-primary/20"
          )}>
            <div className="flex items-start justify-between">
              <div className={cn(
                "size-10 rounded-xl grid place-items-center mb-4",
                m.type === "card" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {m.type === "card" ? <CreditCard className="size-5" /> : <Smartphone className="size-5" />}
              </div>
              <div className="flex items-center gap-2">
                {m.isDefault && <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[10px] font-bold border-none h-5 px-2">DEFAULT</Badge>}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    {!m.isDefault && (
                      <DropdownMenuItem onClick={() => setDefault(user!.id, m.id)}>
                        <CheckCircle2 className="size-4 mr-2" /> Set as default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => remove(m.id)} className="text-destructive">
                      <Trash2 className="size-4 mr-2" /> Remove method
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold">{m.provider}</p>
              <p className="text-sm text-muted-foreground">
                {m.type === "card" ? `•••• •••• •••• ${m.last4}` : m.phoneNumber}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{m.nameOnAccount}</span>
              {m.expiry && <span className="text-[10px] text-muted-foreground">{m.expiry}</span>}
            </div>
          </div>
        ))}

        {userMethods.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed rounded-3xl bg-muted/5">
            <div className="size-16 rounded-3xl bg-muted grid place-items-center mx-auto mb-4">
              <CreditCard className="size-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-bold text-lg">No saved methods</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1 mb-6">
              Add your credit cards or Mobile Money accounts for faster and safer checkouts.
            </p>
            <Button variant="outline" className="rounded-full px-8" onClick={() => setIsOpen(true)}>
              <Plus className="size-4 mr-2" /> Get Started
            </Button>
          </div>
        )}
      </div>

      <div className="bg-muted/40 border rounded-2xl p-6 flex items-start gap-4">
        <div className="size-10 rounded-full bg-emerald/10 text-emerald-700 grid place-items-center flex-shrink-0">
          <ShieldCheck className="size-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm">Secure & Encrypted</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your payment data is fully encrypted and never stored on our local servers. We use enterprise-grade tokenization via Paystack to ensure your financial security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
