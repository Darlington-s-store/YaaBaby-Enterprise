import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Settings = () => (
  <div className="space-y-6">
    <h2 className="font-display text-2xl font-bold">Store settings</h2>

    <form className="bg-card border rounded-2xl p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Store details saved"); }}>
      <h3 className="font-display text-lg font-bold">Store details</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>Store name</Label><Input defaultValue="YAA BABY ENT." /></div>
        <div><Label>Support email</Label><Input defaultValue="hello@yaababy.gh" type="email" /></div>
        <div><Label>Phone</Label><Input defaultValue="+233 30 000 0000" /></div>
        <div><Label>Currency</Label><Input defaultValue="GHS — Ghana Cedi" /></div>
      </div>
      <div><Label>Store description</Label><Textarea rows={3} defaultValue="Everything you love. In one storefront. Curated, authenticated, delivered across Ghana." /></div>
      <Button className="rounded-full">Save</Button>
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

    <div className="bg-card border rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-lg font-bold">Shipping zones</h3>
      {[
        { zone: "Greater Accra", rate: "GH₵ 25 · 24h" },
        { zone: "Kumasi & Ashanti", rate: "GH₵ 45 · 1-2 days" },
        { zone: "Other regions", rate: "GH₵ 65 · 2-4 days" },
      ].map((z) => (
        <div key={z.zone} className="flex items-center justify-between border-t first:border-t-0 first:pt-0 pt-3">
          <div className="font-medium">{z.zone}</div>
          <div className="text-sm text-muted-foreground">{z.rate}</div>
        </div>
      ))}
      <Button variant="outline" className="rounded-full">Add zone</Button>
    </div>

    <div className="bg-card border rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-lg font-bold">Team</h3>
      {[
        { name: "Admin User", email: "admin@yaababy.gh", role: "Owner" },
        { name: "Ops Lead", email: "ops@yaababy.gh", role: "Manager" },
      ].map((t) => (
        <div key={t.email} className="flex items-center gap-3 border-t first:border-t-0 first:pt-0 pt-3">
          <div className="size-10 rounded-full bg-emerald-gold grid place-items-center text-primary-foreground font-bold">{t.name[0]}</div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.email}</div>
          </div>
          <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-accent/20 text-accent-foreground">{t.role}</span>
        </div>
      ))}
      <Button variant="outline" className="rounded-full">Invite member</Button>
    </div>
  </div>
);

export default Settings;
