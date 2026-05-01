import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/useCart";
import { AuthShell } from "@/components/AuthShell";
import adminImg from "@/assets/admin-side.jpg";
import { toast } from "sonner";

const AdminLogin = () => {
  const { user, adminSignIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const userRole = user?.role?.toLowerCase();
  const isAdmin = ["admin", "super_admin", "manager"].includes(userRole || "");
  
  if (user && isAdmin) return <Navigate to="/admin" replace />;
  if (user && !isAdmin) return <Navigate to="/account" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const r = await adminSignIn(email, password);
    setSubmitting(false);
    if (!r.ok) return toast.error(r.error ?? "Sign in failed");
    toast.success("Welcome, admin");
    navigate("/admin");
  };

  return (
    <AuthShell
      side="admin"
      image={adminImg}
      imageEyebrow="Restricted access"
      imageTitle="Admin control center."
      imageSubtitle="Manage products, orders, customers, categories, reviews and analytics — all in one beautifully crafted dashboard."
    >
      <div className="space-y-7">
        <div className="space-y-3">
          <div className="size-12 rounded-2xl bg-emerald-gold grid place-items-center text-primary-foreground">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="font-display text-3xl font-bold">Admin sign in</h1>
          <p className="text-sm text-muted-foreground">
            This page is for administrators only. Customers should use the{" "}
            <a href="/login" className="text-primary font-semibold">customer login</a>.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div><Label>Admin email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" placeholder="admin@yaababy.gh" /></div>
          <div><Label>Password</Label><Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" /></div>
          <Button disabled={submitting} type="submit" size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">
            {submitting ? "Signing in…" : "Enter dashboard"}
          </Button>
        </form>

      </div>
    </AuthShell>
  );
};

export default AdminLogin;
