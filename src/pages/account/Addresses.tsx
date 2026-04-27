import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { myAddresses } from "@/data/dashboardMock";
import { toast } from "sonner";

const Addresses = () => {
  const [list, setList] = useState(myAddresses);
  const [open, setOpen] = useState(false);

  const setDefault = (id: string) => {
    setList(list.map((a) => ({ ...a, isDefault: a.id === id })));
    toast.success("Default address updated");
  };
  const remove = (id: string) => {
    setList(list.filter((a) => a.id !== id));
    toast.success("Address removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold">Saved addresses</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full"><Plus className="size-4 mr-2" />Add address</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New address</DialogTitle></DialogHeader>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); toast.success("Address added"); setOpen(false); }}>
              <div><Label>Label</Label><Input placeholder="Home, Office…" /></div>
              <div><Label>Full name</Label><Input placeholder="Yaa Mensah" /></div>
              <div><Label>Address line</Label><Input placeholder="Street, building" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>City</Label><Input placeholder="Accra" /></div>
                <div><Label>Region</Label><Input placeholder="Greater Accra" /></div>
              </div>
              <div><Label>Phone</Label><Input placeholder="+233…" /></div>
              <DialogFooter><Button type="submit" className="rounded-full">Save address</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                <Button size="icon" variant="ghost" className="size-8"><Pencil className="size-4" /></Button>
                <Button size="icon" variant="ghost" className="size-8" onClick={() => remove(a.id)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <div className="text-foreground font-medium">{a.name}</div>
              {a.line1}<br />{a.city}, {a.region}<br />{a.phone}
            </div>
            {!a.isDefault && (
              <Button variant="outline" size="sm" className="rounded-full mt-4" onClick={() => setDefault(a.id)}>
                <Star className="size-3.5 mr-2" /> Set as default
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Addresses;
