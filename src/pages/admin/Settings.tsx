import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Plus, Trash2, AlertTriangle, Power } from "lucide-react";
import { useSettings } from "@/store/useStore";

const Settings = () => {
  const { maintenanceMode, setMaintenanceMode } = useSettings();
  const [zones, setZones] = useState([
    { id: 1, name: "Greater Accra", rate: "25", time: "24h" },
    { id: 2, name: "Kumasi & Ashanti", rate: "45", time: "1-2 days" },
    { id: 3, name: "Other regions", rate: "65", time: "2-4 days" },
  ]);

  const addZone = () => {
    const id = Math.max(0, ...zones.map(z => z.id)) + 1;
    setZones([...zones, { id, name: "New Zone", rate: "0", time: "3-5 days" }]);
  };

  const removeZone = (id: number) => {
    setZones(zones.filter(z => z.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Store settings</h2>
        <Button variant="outline" className="rounded-full" onClick={() => toast.success("Settings synced with cloud")}>Sync Settings</Button>
      </div>

      <form className="bg-card border rounded-2xl p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Store details saved"); }}>
        <h3 className="font-display text-lg font-bold">Store details</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Store name</Label><Input defaultValue="YAA BABY ENT." /></div>
          <div><Label>Support email</Label><Input defaultValue="hello@yaababy.gh" type="email" /></div>
          <div><Label>Phone</Label><Input defaultValue="+233 30 000 0000" /></div>
          <div><Label>Currency</Label><Input defaultValue="GHS — Ghana Cedi" /></div>
        </div>
        <div><Label>Store description</Label><Textarea rows={3} defaultValue="Everything you love. In one storefront. Curated, authenticated, delivered across Ghana." /></div>
        <Button className="rounded-full">Save Details</Button>
      </form>

      <div className="bg-card border rounded-2xl p-6 space-y-4">
        <h3 className="font-display text-lg font-bold">Payments</h3>
        {[
          { name: "Paystack", desc: "Cards, MoMo, Apple Pay across Ghana", on: true },
          { name: "MTN Mobile Money", desc: "Direct MoMo collection", on: true },
          { name: "Cash on delivery", desc: "Pay on arrival within Greater Accra", on: false },
        ].map((p) => (
          <div key={p.name} className="flex items-center justify-between border-t first:border-t-0 first:pt-0 pt-4">
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-muted-foreground">{p.desc}</div>
            </div>
            <Switch defaultChecked={p.on} />
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold">Shipping zones</h3>
            <p className="text-sm text-muted-foreground">Manage delivery rates and times for different regions.</p>
          </div>
          <Button onClick={addZone} variant="outline" size="sm" className="rounded-full">
            <Plus className="size-4 mr-2" /> Add zone
          </Button>
        </div>

        <div className="space-y-3">
          {zones.map((z) => (
            <div key={z.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl border bg-muted/20 group">
              <div className="size-10 rounded-lg bg-background border grid place-items-center text-muted-foreground">
                <MapPin className="size-5" />
              </div>
              <div className="flex-1 min-w-[200px] space-y-1">
                <Input 
                  className="bg-transparent border-none p-0 h-auto font-bold focus-visible:ring-0" 
                  value={z.name} 
                  onChange={(e) => {
                    const newZones = [...zones];
                    const idx = newZones.findIndex(x => x.id === z.id);
                    newZones[idx].name = e.target.value;
                    setZones(newZones);
                  }}
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Rate: GH₵</span>
                  <input 
                    className="w-10 bg-transparent border-b border-muted-foreground/20 focus:border-primary outline-none" 
                    value={z.rate}
                    onChange={(e) => {
                      const newZones = [...zones];
                      const idx = newZones.findIndex(x => x.id === z.id);
                      newZones[idx].rate = e.target.value;
                      setZones(newZones);
                    }}
                  />
                  <span className="mx-1">·</span>
                  <input 
                    className="flex-1 bg-transparent border-b border-muted-foreground/20 focus:border-primary outline-none italic" 
                    value={z.time}
                    onChange={(e) => {
                      const newZones = [...zones];
                      const idx = newZones.findIndex(x => x.id === z.id);
                      newZones[idx].time = e.target.value;
                      setZones(newZones);
                    }}
                  />
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                onClick={() => removeZone(z.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button className="w-full rounded-full h-11" onClick={() => toast.success("Shipping rates updated")}>
          Save Shipping Configuration
        </Button>
      </div>

      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-destructive">System Safety</h3>
            <p className="text-sm text-muted-foreground">Manage critical system-wide states.</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border rounded-xl">
          <div className="space-y-0.5">
            <div className="font-semibold flex items-center gap-2">
              <Power className="size-4 text-destructive" />
              Maintenance Mode
            </div>
            <div className="text-sm text-muted-foreground max-w-md">
              When active, regular users will be redirected to a maintenance page. 
              Only administrators will have access to the site.
            </div>
          </div>
          <Switch 
            checked={maintenanceMode} 
            onCheckedChange={(val) => {
              setMaintenanceMode(val);
              toast.success(`Maintenance mode ${val ? "activated" : "deactivated"}`);
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
