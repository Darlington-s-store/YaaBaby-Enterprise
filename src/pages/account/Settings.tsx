import { useAuth } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const Settings = () => {
  const user = useAuth((s) => s.user)!;
  const updateProfile = useAuth((s) => s.updateProfile);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="font-display text-2xl font-bold">Profile & settings</h2>

      <form className="bg-card border rounded-2xl p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); updateProfile({ name, email }); toast.success("Profile updated"); }}>
        <h3 className="font-display text-lg font-bold">Profile</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="size-16 rounded-full bg-emerald-gold grid place-items-center text-primary-foreground font-display text-2xl font-bold">{name[0]?.toUpperCase()}</div>
          <Button type="button" variant="outline" size="sm" className="rounded-full">Change photo</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
          <div><Label>Phone</Label><Input placeholder="+233 …" /></div>
          <div><Label>Date of birth</Label><Input type="date" /></div>
        </div>
        <Button className="rounded-full">Save changes</Button>
      </form>

      <form className="bg-card border rounded-2xl p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Password changed"); }}>
        <h3 className="font-display text-lg font-bold">Password</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><Label>Current</Label><Input type="password" /></div>
          <div><Label>New</Label><Input type="password" /></div>
          <div><Label>Confirm</Label><Input type="password" /></div>
        </div>
        <Button className="rounded-full">Update password</Button>
      </form>

      <div className="bg-card border border-destructive/30 rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold text-destructive mb-1">Danger zone</h3>
        <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
        <Button variant="destructive" className="rounded-full">Delete account</Button>
      </div>
    </div>
  );
};

export default Settings;
