import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useOtp, useUsers } from "@/store/useStore";
import { useAuth } from "@/store/useCart";
import { AuthShell } from "@/components/AuthShell";
import authImg from "@/assets/auth-side.jpg";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionUser = useAuth((s) => s.user);
  const verify = useOtp((s) => s.verify);
  const issue = useOtp((s) => s.issue);
  const clear = useOtp((s) => s.clear);
  const updateUser = useUsers((s) => s.update);
  const allUsers = useUsers((s) => s.users);

  const initial = (location.state as { email?: string; phone?: string } | null) ?? {};
  const [email, setEmail] = useState(initial.email ?? sessionUser?.email ?? "");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verify("email", email, code)) return toast.error("That code is invalid or expired");
    setSubmitting(true);
    setTimeout(() => {
      const u = allUsers.find((x) => x.email.toLowerCase() === email.toLowerCase());
      if (u) updateUser(u.id, { emailVerified: true });
      clear("email", email);
      setSubmitting(false);
      toast.success("Email verified");
      // If a phone was provided on signup, route to phone verify; else to account
      if (initial.phone) navigate("/verify-phone", { state: { phone: initial.phone } });
      else navigate(sessionUser ? "/account" : "/login");
    }, 350);
  };

  const onResend = () => {
    if (!email) return toast.error("Enter your email first");
    const c = issue("email", email);
    toast.success("New code sent", { description: `Demo code: ${c}`, duration: 12000 });
  };

  return (
    <AuthShell
      side="user"
      image={authImg}
      imageEyebrow="One last step"
      imageTitle="Verify your email."
      imageSubtitle="We sent a 6-digit code to your inbox. Enter it below to activate your account."
    >
      <div className="space-y-6">
        <div className="size-12 rounded-2xl bg-emerald-gold grid place-items-center text-primary-foreground"><Mail className="size-6" /></div>
        <div>
          <h1 className="font-display text-3xl font-bold mb-1.5">Verify your email</h1>
          <p className="text-sm text-muted-foreground">Enter the 6-digit code we sent to <strong>{email || "your inbox"}</strong>.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" /></div>
          <div>
            <Label>Verification code</Label>
            <div className="mt-1.5">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>{[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
              </InputOTP>
            </div>
            <button type="button" onClick={onResend} className="text-xs text-primary font-semibold mt-2">Resend code</button>
          </div>
          <Button type="submit" size="lg" disabled={submitting} className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">
            {submitting ? "Verifying…" : "Verify email"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          <Link to={sessionUser ? "/account" : "/login"} className="text-primary font-semibold">Skip for now →</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default VerifyEmail;
