import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAddresses, type Address } from "@/store/useStore";
import { useAuth } from "@/store/useCart";
import { toast } from "sonner";

type Form = {
  label: string; name: string; line1: string; city: string; region: string; phone: string; isDefault: boolean;
};
const empty: Form = { label: "", name: "", line1: "", city: "", region: "", phone: "", isDefault: false };

const Addresses = () => {
  const user = useAuth((s) => s.user)!;
  const all = useAddresses((s) => s.addresses);
  const list = all.filter((a) => a.userId === user.id);
  const { add, update, remove, setDefault } = useAddresses();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState<Form>(empty);

  const startNew = () => { setEditing(null); setForm({ ...empty, isDefault: list.length === 0 }); setOpen(true); };
  const startEdit = (a: Address) => {
    setEditing(a);
    setForm({ label: a.label, name: a.name, line1: a.line1, city: a.city, region: a.region, phone: a.phone, isDefault: a.isDefault });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      update(editing.id, { ...form });
      if (form.isDefault) setDefault(user.id, editing.id);
      toast.success("Address updated");
    } else {
      add({ ...form, userId: user.id });
      toast.success("Address added");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold">Saved addresses</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew} className="rounded-full"><Plus className="size-4 mr-2" />Add address</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit address" : "New address"}</DialogTitle></DialogHeader>
            <form className="space-y-3" onSubmit={submit}>
              <div><Label>Label</Label><Input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home, Office…" /></div>
              <div><Label>Full name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Yaa Mensah" /></div>
              <div><Label>Address line</Label><Input required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Street, building" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>City</Label><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Accra" /></div>
                <div><Label>Region</Label><Input required value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Greater Accra" /></div>
              </div>
              <div><Label>Phone</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+233…" /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
                Set as default
              </label>
              <DialogFooter><Button type="submit" className="rounded-full">{editing ? "Save changes" : "Save address"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {list.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center">
          <MapPin className="size-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg font-bold mb-1">No addresses yet</h3>
          <p className="text-sm text-muted-foreground mb-5">Add an address so we can deliver your orders.</p>
          <Button onClick={startNew} className="rounded-full"><Plus className="size-4 mr-2" />Add your first address</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {list.map((a) => (
            <div key={a.id} className="bg-card border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-xl bg-primary/10 grid place-items-center"><MapPin className="size-4 text-primary" /></div>
                  <div>
                    <div className="font-semibold">{a.label}</div>
                    {a.isDefault && <span className="text-[10px] uppercase tracking-wider font-bold text-success">Default</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => startEdit(a)}><Pencil className="size-4" /></Button>
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => { remove(a.id); toast.success("Address removed"); }}><Trash2 className="size-4" /></Button>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                <div className="text-foreground font-medium">{a.name}</div>
                {a.line1}<br />{a.city}, {a.region}<br />{a.phone}
              </div>
              {!a.isDefault && (
                <Button variant="outline" size="sm" className="rounded-full mt-4" onClick={() => { setDefault(user.id, a.id); toast.success("Default updated"); }}>
                  <Star className="size-3.5 mr-2" /> Set as default
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;
