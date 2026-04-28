import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Props = {
  side: "user" | "admin";
  image: string;
  imageEyebrow: string;
  imageTitle: string;
  imageSubtitle: string;
  children: ReactNode;
};

export const AuthShell = ({ side, image, imageEyebrow, imageTitle, imageSubtitle, children }: Props) => (
  <div className="min-h-screen grid lg:grid-cols-2 bg-background">
    {/* LEFT — visual */}
    <div className="relative hidden lg:block overflow-hidden">
      <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/85 via-primary/50 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-between p-10 text-primary-foreground">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold w-fit">
          <span className="size-9 rounded-xl bg-gold grid place-items-center text-accent-foreground font-black">Y</span>
          YAA <span className="text-gradient-gold">BABY</span>
        </Link>
        <div className="max-w-sm space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold">{imageEyebrow}</p>
          <h2 className="font-display text-4xl font-bold leading-tight">{imageTitle}</h2>
          <p className="text-primary-foreground/80 leading-relaxed">{imageSubtitle}</p>
        </div>
        <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} YAA BABY ENT. — Curated. Authenticated. Delivered.</p>
      </div>
    </div>

    {/* RIGHT — form */}
    <div className="flex flex-col">
      <header className="container-x flex items-center justify-between py-5 border-b">
        <Link to={side === "admin" ? "/admin/login" : "/"} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
          <ArrowLeft className="size-4" /> Back to {side === "admin" ? "admin" : "store"}
        </Link>
        <Link to="/" className="lg:hidden font-display font-bold">YAA BABY</Link>
        <Link to={side === "admin" ? "/login" : "/admin/login"} className="text-xs font-semibold text-primary hover:underline">
          {side === "admin" ? "Customer login" : "Admin login →"}
        </Link>
      </header>
      <div className="flex-1 grid place-items-center px-6 py-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  </div>
);
