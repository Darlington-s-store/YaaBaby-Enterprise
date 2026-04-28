import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/store/useCart";
import { AuthShell } from "@/components/AuthShell";
import authImg from "@/assets/auth-side.jpg";
import { toast } from "sonner";

const Login = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/account";
  const [tab, setTab] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : redirectTo} replace />;

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const r = await signIn(email, password);
    setSubmitting(false);
    if (!r.ok) return toast.error(r.error ?? "Sign in failed");
    toast.success("Welcome back!");
    navigate(redirectTo);
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const r = await signUp(name, email, password);
    setSubmitting(false);
    if (!r.ok) return toast.error(r.error ?? "Sign up failed");
    toast.success("Account created — welcome!");
    navigate("/account");
  };

  return (
    <AuthShell
      side="user"
      image={authImg}
      imageEyebrow="Members club"
      imageTitle="Join the YAA BABY edit."
      imageSubtitle="Save your favourites, track every order, and unlock 10% off your first purchase. Curated for Ghana, delivered with love."
    >
      <div className="space-y-7">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1.5">{tab === "signin" ? "Welcome back" : "Create your account"}</h1>
          <p className="text-sm text-muted-foreground">
            {tab === "signin" ? "Sign in to access your dashboard." : "You need an account to shop and access your dashboard."}
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="signup">Sign up</TabsTrigger>
            <TabsTrigger value="signin">Sign in</TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            <form onSubmit={onSignUp} className="space-y-4">
              <div><Label>Full name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-11" placeholder="Yaa Mensah" /></div>
              <div><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" placeholder="you@email.com" /></div>
              <div><Label>Password</Label><Input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" placeholder="At least 6 characters" /></div>
              <Button disabled={submitting} type="submit" size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">
                {submitting ? "Creating…" : "Create account"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("signin")} className="text-primary font-semibold">Sign in</button>
              </p>
            </form>
          </TabsContent>

          <TabsContent value="signin">
            <form onSubmit={onSignIn} className="space-y-4">
              <div><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" placeholder="you@email.com" /></div>
              <div><Label>Password</Label><Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" /></div>
              <Button disabled={submitting} type="submit" size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                New here?{" "}
                <button type="button" onClick={() => setTab("signup")} className="text-primary font-semibold">Create an account</button>
              </p>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-[11px] text-center text-muted-foreground">
          Are you an admin? <Link to="/admin/login" className="text-primary font-semibold">Use the admin login</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default Login;
