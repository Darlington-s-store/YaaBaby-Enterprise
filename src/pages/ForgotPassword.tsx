import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUsers, useOtp } from "@/store/useStore";
import { AuthShell } from "@/components/AuthShell";
import authImg from "@/assets/auth-side.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const issue = useOtp((s) => s.issue);
  const exists = useUsers((s) => s.exists);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      // Always show generic success to avoid account enumeration, but still send OTP if account exists
      if (exists(email)) {
        const code = issue("password-reset", email);
        toast.success(`Reset code sent to ${email}`, { description: `Demo code: ${code}`, duration: 12000 });
      } else {
        toast.success(`If an account exists for ${email}, a reset code has been sent.`);
      }
      setSubmitting(false);
      navigate("/reset-password", { state: { email } });
    }, 600);
  };

  return (
    <AuthShell
      side="user"
      image={authImg}
      imageEyebrow="Account recovery"
      imageTitle="Forgot your password?"
      imageSubtitle="Enter the email linked to your account and we'll send you a 6-digit code to reset it."
    >
      <div className="space-y-6">
        <div className="size-12 rounded-2xl bg-emerald-gold grid place-items-center text-primary-foreground"><Mail className="size-6" /></div>
        <div>
          <h1 className="font-display text-3xl font-bold mb-1.5">Reset your password</h1>
          <p className="text-sm text-muted-foreground">We'll email a one-time code that's valid for 15 minutes.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" placeholder="you@email.com" /></div>
          <Button type="submit" size="lg" disabled={submitting} className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">
            {submitting ? "Sending…" : "Send reset code"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Remembered it? <Link to="/login" className="text-primary font-semibold">Back to sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default ForgotPassword;
