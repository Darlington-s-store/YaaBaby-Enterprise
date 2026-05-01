import { useState, useEffect } from "react";
import { 
  Truck, Globe, MapPin, Plus, 
  Settings2, Trash2, Edit3, Info,
  Package, CheckCircle2, XCircle, UserPlus,
  Link as LinkIcon, Phone
} from "lucide-react";
import { useShipping, useDeliveryPartners, ShippingZone, ShippingMethod, DeliveryPartner } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Shipping = () => {
  const { zones, fetchZones, addZone, updateZone, removeZone, addMethod, removeMethod } = useShipping();

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const { partners, add: addPartner, update: updatePartner, remove: removePartner } = useDeliveryPartners();

  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [isPartnerOpen, setIsPartnerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"zones" | "partners">("zones");

  // Zone State
  const [newZone, setNewZone] = useState<Partial<ShippingZone>>({
    name: "",
    regions: [],
    methods: [],
    enabled: true
  });

  // Partner State
  const [newPartner, setNewPartner] = useState<Partial<DeliveryPartner>>({
    name: "",
    contact: "",
    trackingUrlTemplate: "",
    status: "active"
  });

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone.name || newZone.regions?.length === 0) return toast.error("Name and regions are required");
    addZone(newZone as Omit<ShippingZone, "id">);
    toast.success("Shipping zone added");
    setIsZoneOpen(false);
    setNewZone({ name: "", regions: [], methods: [], enabled: true });
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name || !newPartner.contact) return toast.error("Name and contact are required");
    addPartner(newPartner as Omit<DeliveryPartner, "id">);
    toast.success("Delivery partner registered");
    setIsPartnerOpen(false);
    setNewPartner({ name: "", contact: "", trackingUrlTemplate: "", status: "active" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Shipping & Logistics</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure shipping rates, delivery zones, and manage logistics partners.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-muted p-1 rounded-full flex">
            <button 
              onClick={() => setActiveTab("zones")}
              className={cn("px-4 py-1.5 text-xs font-bold rounded-full transition-all", activeTab === "zones" ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}
            >Zones & Rates</button>
            <button 
              onClick={() => setActiveTab("partners")}
              className={cn("px-4 py-1.5 text-xs font-bold rounded-full transition-all", activeTab === "partners" ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}
            >Delivery Partners</button>
          </div>
        </div>
      </div>

      {activeTab === "zones" ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsZoneOpen(true)} className="rounded-full shadow-lg shadow-primary/20">
              <Plus className="size-4 mr-2" /> Add Shipping Zone
            </Button>
          </div>

          <div className="grid gap-6">
            {zones.map((zone) => (
              <div key={zone.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="p-6 border-b flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                      <Globe className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold flex items-center gap-2 text-lg">
                        {zone.name}
                        {!zone.enabled && <Badge variant="outline" className="text-[10px] bg-slate-100">Disabled</Badge>}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{zone.regions.join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={zone.enabled} onCheckedChange={(v) => updateZone(zone.id, { enabled: v })} />
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-destructive" onClick={() => removeZone(zone.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <Truck className="size-4 text-primary" /> Shipping Methods
                      </h4>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {zone.methods.map((method) => (
                        <div key={method.id} className="p-4 rounded-xl border bg-muted/10 relative group">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-sm">{method.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {method.type === "flat" && "Flat Rate"}
                                {method.type === "free_threshold" && `Free over GH₵${method.threshold}`}
                                {method.type === "weight" && "Weight Based"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">GH₵{method.price.toFixed(2)}</p>
                              <button onClick={() => removeMethod(zone.id, method.id)} className="text-[10px] text-destructive hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const name = prompt("Method Name?");
                          const price = Number(prompt("Price?"));
                          if (name && !isNaN(price)) {
                            addMethod(zone.id, { name, price, type: "flat" });
                          }
                        }}
                        className="p-4 rounded-xl border border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 group"
                      >
                        <Plus className="size-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-primary">Add Rate</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsPartnerOpen(true)} className="rounded-full shadow-lg shadow-primary/20">
              <UserPlus className="size-4 mr-2" /> Register Partner
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <div key={partner.id} className="bg-card border rounded-2xl p-6 space-y-4 hover:shadow-lg transition-all relative overflow-hidden group">
                <div className={cn("absolute top-0 right-0 size-24 -mt-8 -mr-8 rounded-full opacity-5 group-hover:scale-110 transition-transform", partner.status === "active" ? "bg-emerald" : "bg-slate-400")} />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="size-12 rounded-2xl bg-muted grid place-items-center shadow-sm">
                    <Package className="size-6 text-primary" />
                  </div>
                  <Switch checked={partner.status === "active"} onCheckedChange={(v) => updatePartner(partner.id, { status: v ? "active" : "inactive" })} />
                </div>

                <div className="relative z-10">
                  <h3 className="font-bold text-lg">{partner.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Phone className="size-3" /> {partner.contact}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2 relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tracking Template</p>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-transparent hover:border-primary/20 transition-all cursor-default">
                    <LinkIcon className="size-3 text-primary" />
                    <span className="text-[10px] font-mono truncate flex-1">{partner.trackingUrlTemplate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 relative z-10">
                  <Badge variant={partner.status === "active" ? "outline" : "secondary"} className={cn("text-[10px] font-bold", partner.status === "active" ? "text-emerald-700 bg-emerald/10" : "")}>
                    {partner.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-full" onClick={() => removePartner(partner.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Zone Dialog */}
      <Dialog open={isZoneOpen} onOpenChange={setIsZoneOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Shipping Zone</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddZone} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Zone Name</Label>
              <Input placeholder="e.g. West Africa" value={newZone.name} onChange={e => setNewZone({...newZone, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Regions (Comma separated)</Label>
              <Input placeholder="e.g. Greater Accra, Ashanti, Central" value={newZone.regions?.join(", ")} onChange={e => setNewZone({...newZone, regions: e.target.value.split(",").map(r => r.trim())})} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full rounded-xl">Create Zone</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Partner Dialog */}
      <Dialog open={isPartnerOpen} onOpenChange={setIsPartnerOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register Delivery Partner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPartner} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Partner Name</Label>
              <Input placeholder="e.g. Kwik Delivery" value={newPartner.name} onChange={e => setNewPartner({...newPartner, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Number / Email</Label>
              <Input placeholder="+233..." value={newPartner.contact} onChange={e => setNewPartner({...newPartner, contact: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Tracking URL Template</Label>
              <Input placeholder="https://track.it/{{id}}" value={newPartner.trackingUrlTemplate} onChange={e => setNewPartner({...newPartner, trackingUrlTemplate: e.target.value})} />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                <Info className="size-3" /> Use {"{{id}}"} placeholder for the tracking number
              </p>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full rounded-xl">Register Partner</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shipping;
