import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Hammer, Clock, MessageCircle, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const Maintenance = () => {
  // Prevent scrolling on maintenance page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-6 overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] right-[-10%] size-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] size-[400px] bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary/10 text-primary mb-2">
          <Hammer className="size-10 animate-bounce" />
        </div>
        
        <div className="space-y-4">
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
            We're polishing <br />
            <span className="text-primary">something new.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            YaaBaby is currently undergoing scheduled maintenance to improve your shopping experience. We'll be back shortly!
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm flex flex-col items-center text-center space-y-2">
            <Clock className="size-6 text-primary" />
            <div className="font-bold">Estimated time</div>
            <div className="text-sm text-muted-foreground">Approx. 2 hours</div>
          </div>
          <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm flex flex-col items-center text-center space-y-2">
            <MessageCircle className="size-6 text-primary" />
            <div className="font-bold">Need help?</div>
            <div className="text-sm text-muted-foreground">Contact support via WhatsApp</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button variant="outline" className="rounded-full h-12 px-8 font-semibold" asChild>
            <a href="https://wa.me/233542737373" target="_blank" rel="noreferrer">
              Message Support
            </a>
          </Button>
          <Button className="rounded-full h-12 px-8 font-semibold gap-2" asChild>
            <a href="https://instagram.com/yaababy.gh" target="_blank" rel="noreferrer">
              <Instagram className="size-5" />
              Follow Updates
            </a>
          </Button>
        </div>

        <div className="pt-12 border-t max-w-xs mx-auto">
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest font-semibold">Administrator access</p>
          <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary" asChild>
            <Link to="/login">Sign in to Dashboard</Link>
          </Button>
        </div>
      </div>
      
      {/* Floating Elements for visual depth */}
      <div className="absolute top-1/4 left-10 size-4 bg-primary/20 rounded-full animate-ping" />
      <div className="absolute bottom-1/4 right-10 size-6 bg-primary/30 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
    </div>
  );
};

export default Maintenance;
