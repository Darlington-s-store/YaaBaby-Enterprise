import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/store/useCart";
import { toast } from "sonner";

const Login = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/account"} replace />;

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
    toast.success("Welcome back!");
    navigate(email.includes("admin") ? "/admin" : "/account");
  };
  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(name, email, password);
    toast.success("Account created");
    navigate("/account");
  };

  return (
    <div className="container-x mx-auto max-w-md py-16 lg:py-24">
      <div className="text-center mb-10">
        <Link to="/" className="font-display text-2xl font-bold inline-block">
          YAA <span className="text-gradient-gold">BABY</span>
        </Link>
      </div>
      <div className="bg-card border rounded-3xl p-8 shadow-card">
        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 mb-6 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={onSignIn} className="space-y-4">
              <div><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" /></div>
              <div><Label>Password</Label><Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" /></div>
              <Button type="submit" size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">Sign in</Button>
              <p className="text-[11px] text-center text-muted-foreground">Tip: use an email with "admin" to access the admin dashboard</p>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={onSignUp} className="space-y-4">
              <div><Label>Full name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-11" /></div>
              <div><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" /></div>
              <div><Label>Password</Label><Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" /></div>
              <Button type="submit" size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">Create account</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
