import { useAuth } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const user = useAuth((s) => s.user)!;
  const updateProfile = useAuth((s) => s.updateProfile);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="font-display text-2xl font-bold">Admin profile</h2>

      <div className="bg-card border rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="size-20 rounded-full bg-emerald-gold grid place-items-center text-primary-foreground">
            <ShieldCheck className="size-9" />
          </div>
          <div>
            <div className="font-display text-xl font-bold">{name}</div>
            <div className="text-sm text-muted-foreground">{email}</div>
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-accent/20 text-accent-foreground">Administrator</span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); updateProfile({ name, email }); toast.success("Profile updated"); }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
          </div>
          <Button className="rounded-full">Save changes</Button>
        </form>
      </div>

      <form className="bg-card border rounded-2xl p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Password changed"); }}>
        <h3 className="font-display text-lg font-bold">Change password</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><Label>Current</Label><Input type="password" /></div>
          <div><Label>New</Label><Input type="password" /></div>
          <div><Label>Confirm</Label><Input type="password" /></div>
        </div>
        <Button className="rounded-full">Update password</Button>
      </form>
    </div>
  );
};

export default Profile;
