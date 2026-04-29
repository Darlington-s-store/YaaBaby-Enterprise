import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useOtp, useUsers } from "@/store/useStore";
import { useAuth } from "@/store/useCart";
import { AuthShell } from "@/components/AuthShell";
import authImg from "@/assets/auth-side.jpg";

const VerifyPhone = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionUser = useAuth((s) => s.user);
  const allUsers = useUsers((s) => s.users);
  const updateUser = useUsers((s) => s.update);
  const verify = useOtp((s) => s.verify);
  const issue = useOtp((s) => s.issue);
  const clear = useOtp((s) => s.clear);

  const initial = (location.state as { phone?: string } | null) ?? {};
  const [phone, setPhone] = useState(
    initial.phone ?? (sessionUser ? allUsers.find((u) => u.id === sessionUser.id)?.phone ?? "" : ""),
  );
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(Boolean(initial.phone));
  const [submitting, setSubmitting] = useState(false);

  const sendCode = () => {
    if (!phone) return toast.error("Enter a phone number first");
    const c = issue("phone", phone);
    setSent(true);
    toast.success(`Code sent to ${phone}`, { description: `Demo code: ${c}`, duration: 12000 });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verify("phone", phone, code)) return toast.error("That code is invalid or expired");
    setSubmitting(true);
    setTimeout(() => {
      if (sessionUser) updateUser(sessionUser.id, { phone, phoneVerified: true });
      clear("phone", phone);
      setSubmitting(false);
      toast.success("Phone verified");
      navigate(sessionUser ? "/account" : "/login");
    }, 350);
  };

  return (
    <AuthShell
      side="user"
      image={authImg}
      imageEyebrow="Two-step security"
      imageTitle="Verify your phone."
      imageSubtitle="We use SMS verification to secure orders, deliveries, and password recovery."
    >
      <div className="space-y-6">
        <div className="size-12 rounded-2xl bg-emerald-gold grid place-items-center text-primary-foreground"><Phone className="size-6" /></div>
        <div>
          <h1 className="font-display text-3xl font-bold mb-1.5">Verify your phone</h1>
          <p className="text-sm text-muted-foreground">Add your mobile number — we'll text you a 6-digit code.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Phone</Label>
              <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 h-11" placeholder="+233 24 000 0000" />
            </div>
            <Button type="button" onClick={sendCode} className="self-end rounded-full h-11 px-5">{sent ? "Resend" : "Send code"}</Button>
          </div>
          <div>
            <Label>Verification code</Label>
            <div className="mt-1.5">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>{[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <Button type="submit" size="lg" disabled={submitting || !sent} className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">
            {submitting ? "Verifying…" : "Verify phone"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          <Link to={sessionUser ? "/account" : "/login"} className="text-primary font-semibold">Skip for now →</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default VerifyPhone;
