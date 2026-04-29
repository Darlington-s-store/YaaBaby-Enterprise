import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/store/useCart";
import { AuthShell } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import authImg from "@/assets/auth-side.jpg";

const Login = () => {
  const { user, signIn, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : redirectTo} replace />;

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const r = await signIn(email, password, remember);
    setSubmitting(false);
    if (!r.ok) return toast.error(r.error ?? "Sign in failed");
    toast.success("Welcome back!");
    navigate(redirectTo);
  };

  const onGoogle = async () => {
    setSubmitting(true);
    const r = await googleSignIn(email || undefined);
    setSubmitting(false);
    if (!r.ok) return toast.error(r.error ?? "Google sign-in failed");
    toast.success("Signed in with Google");
    navigate(redirectTo);
  };

  return (
    <AuthShell
      side="user"
      image={authImg}
      imageEyebrow="Members club"
      imageTitle="Welcome back."
      imageSubtitle="Sign in to track your orders, save favourites, and earn 5% back as store credit."
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1.5">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold">Create one</Link>
          </p>
        </div>

        <GoogleButton onClick={onGoogle} disabled={submitting} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-background px-3 text-muted-foreground">or with email</span></div>
        </div>

        <form onSubmit={onSignIn} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" placeholder="you@email.com" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary font-semibold hover:underline">Forgot password?</Link>
            </div>
            <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground select-none">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} /> Remember me on this device
          </label>
          <Button disabled={submitting} type="submit" size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-[11px] text-center text-muted-foreground">
          Are you an admin? <Link to="/admin/login" className="text-primary font-semibold">Use the admin login</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default Login;
