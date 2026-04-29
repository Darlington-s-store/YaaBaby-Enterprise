import { useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/store/useCart";
import { useOtp } from "@/store/useStore";
import { AuthShell } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import { countries } from "@/data/countries";
import authImg from "@/assets/auth-side.jpg";

const Register = () => {
  const { user, signUp, googleSignIn } = useAuth();
  const issueOtp = useOtp((s) => s.issue);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [country, setCountry] = useState("GH");
  const [region, setRegion] = useState("");
  const [referral, setReferral] = useState("");
  const [avatar, setAvatar] = useState<string>();
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const regions = useMemo(() => countries.find((c) => c.code === country)?.regions ?? [], [country]);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/account"} replace />;

  const onAvatar = (file?: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2MB");
    const reader = new FileReader();
    reader.onload = () => setAvatar(typeof reader.result === "string" ? reader.result : undefined);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords don't match");
    if (!terms) return toast.error("Please accept the Terms to continue");
    setSubmitting(true);
    const r = await signUp(name, email, password, {
      phone, country, region, avatar, referralCode: referral || undefined,
    });
    setSubmitting(false);
    if (!r.ok) return toast.error(r.error ?? "Could not create account");
    // Issue email + (optional) phone OTPs and route to verification
    const emailCode = issueOtp("email", email);
    toast.success(`Account created. Email code: ${emailCode}`, { duration: 9000 });
    if (phone) {
      const phoneCode = issueOtp("phone", phone);
      toast.message(`Phone code (demo): ${phoneCode}`, { duration: 9000 });
    }
    navigate("/verify-email", { state: { email, phone } });
  };

  const onGoogle = async () => {
    setSubmitting(true);
    const r = await googleSignIn(email || undefined);
    setSubmitting(false);
    if (!r.ok) return toast.error(r.error ?? "Google sign-up failed");
    toast.success("Signed in with Google");
    navigate("/account");
  };

  return (
    <AuthShell
      side="user"
      image={authImg}
      imageEyebrow="Join the edit"
      imageTitle="Create your YAA BABY account."
      imageSubtitle="Save addresses, track orders, write reviews and unlock 10% off your first purchase."
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1.5">Create account</h1>
          <p className="text-sm text-muted-foreground">
            Already have one?{" "}
            <Link to="/login" className="text-primary font-semibold">Sign in</Link>
          </p>
        </div>

        <GoogleButton onClick={onGoogle} disabled={submitting} label="Sign up with Google" />

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-background px-3 text-muted-foreground">or with email</span></div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Profile photo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative size-16 rounded-2xl bg-muted border-2 border-dashed grid place-items-center overflow-hidden hover:bg-muted/70"
              aria-label="Upload profile photo"
            >
              {avatar ? <img src={avatar} alt="Profile preview" className="size-full object-cover" /> : <Camera className="size-5 text-muted-foreground" />}
            </button>
            <div>
              <div className="text-sm font-semibold">Profile photo</div>
              <div className="text-xs text-muted-foreground">Optional · JPG/PNG up to 2MB</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onAvatar(e.target.files?.[0])} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Full name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-11" placeholder="Yaa Mensah" /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 h-11" placeholder="+233 24 000 0000" /></div>
          </div>

          <div><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" placeholder="you@email.com" /></div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Country</Label>
              <Select value={country} onValueChange={(v) => { setCountry(v); setRegion(""); }}>
                <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Region</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Choose region" /></SelectTrigger>
                <SelectContent>{regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Password</Label><Input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" /></div>
            <div><Label>Confirm password</Label><Input required type="password" minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5 h-11" /></div>
          </div>

          <div><Label>Referral code <span className="text-muted-foreground font-normal">(optional)</span></Label><Input value={referral} onChange={(e) => setReferral(e.target.value)} className="mt-1.5 h-11" placeholder="YAA-FRIEND" /></div>

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <Checkbox checked={terms} onCheckedChange={(v) => setTerms(Boolean(v))} className="mt-0.5" />
            <span>I agree to the <Link to="/about" className="text-primary font-semibold">Terms</Link> and <Link to="/about" className="text-primary font-semibold">Privacy Policy</Link>.</span>
          </label>

          <Button disabled={submitting} type="submit" size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 font-semibold">
            {submitting ? "Creating…" : "Create account"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
};

export default Register;
