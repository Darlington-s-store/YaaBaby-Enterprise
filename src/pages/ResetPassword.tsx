import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useOtp, useUsers } from "@/store/useStore";
import { AuthShell } from "@/components/AuthShell";
import authImg from "@/assets/auth-side.jpg";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const verify = useOtp((s) => s.verify);
  const clear = useOtp((s) => s.clear);
  const issue = useOtp((s) => s.issue);
  const setPasswordByEmail = useUsers((s) => s.setPasswordByEmail);

  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    if (!verify("password-reset", email, code)) return toast.error("That code is invalid or expired");
    setSubmitting(true);
    setTimeout(() => {
      const ok = setPasswordByEmail(email, password);
      setSubmitting(false);
      if (!ok) return toast.error("No account found for that email");
      clear("password-reset", email);
      toast.success("Password reset. Please sign in with your new password.");
      navigate("/login");
    }, 400);
  };

  const onResend = () => {
    if (!email) return toast.error("Enter your email first");
    const c = issue("password-reset", email);
    toast.success("New code sent", { description: `Demo code: ${c}`, duration: 12000 });
  };

  return (
    <AuthShell
      side="user"
      image={authImg}
      imageEyebrow="Account recovery"
      imageTitle="Set a new password."
      imageSubtitle="Enter the 6-digit code we sent and choose a strong new password for your account."
    >
      <div className="space-y-6">
        <div className="size-12 rounded-2xl bg-emerald-gold grid place-items-center text-primary-foreground"><ShieldCheck className="size-6" /></div>
        <div>
          <h1 className="font-display text-3xl font-bold mb-1.5">Reset password</h1>
          <p className="text-sm text-muted-foreground">Enter the code we sent to your email and your new password.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" /></div>
          <div>
            <Label>6-digit code</Label>
            <div className="mt-1.5">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button type="button" onClick={onResend} className="text-xs text-primary font-semibold mt-2">Resend code</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>New password</Label><Input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" /></div>
            <div><Label>Confirm</Label><Input required type="password" minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5 h-11" /></div>
          </div>
          <Button type="submit" size="lg" disabled={submitting} className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">
            {submitting ? "Updating…" : "Set new password"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          <Link to="/login" className="text-primary font-semibold">Back to sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default ResetPassword;
