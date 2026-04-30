import { Construction, Clock, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-gold rounded-full blur opacity-25 animate-pulse" />
          <div className="relative bg-white p-6 rounded-full shadow-xl">
            <Construction className="size-16 text-primary animate-bounce" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-slate-900">
            Under <span className="text-primary">Maintenance</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-lg mx-auto leading-relaxed">
            We're currently polishing some things to give you a better experience. 
            Don't worry, we'll be back online in a heartbeat!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
          <div className="bg-white/60 backdrop-blur-md border border-white p-4 rounded-2xl flex items-center gap-4 text-left">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Estimated Restored</p>
              <p className="font-semibold text-slate-900">Usually within 2 hours</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-white p-4 rounded-2xl flex items-center gap-4 text-left">
            <div className="size-10 rounded-full bg-emerald-gold/10 flex items-center justify-center text-emerald-gold-darker">
              <Mail className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Need Help?</p>
              <p className="font-semibold text-slate-900 leading-none">support@yaababy.gh</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button variant="outline" className="rounded-full px-8" asChild>
            <a href="mailto:support@yaababy.gh">Email Support</a>
          </Button>
          <Button className="rounded-full px-8 group">
            <Phone className="size-4 mr-2 group-hover:rotate-12 transition-transform" />
            Call Help Desk
          </Button>
        </div>

        <p className="text-sm text-slate-400 font-medium pt-12">
          &copy; {new Date().getFullYear()} Yaa Baby Enterprise. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
