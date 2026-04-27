import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useAuth } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DashNav = { to: string; label: string; icon: LucideIcon; badge?: string | number; end?: boolean };

type Props = {
  eyebrow: string;
  title: string;
  nav: DashNav[];
  children: ReactNode;
};

export const DashboardShell = ({ eyebrow, title, nav, children }: Props) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container-x mx-auto max-w-7xl py-8 lg:py-12">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">{eyebrow}</p>
          <h1 className="font-display text-3xl lg:text-5xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-muted-foreground hidden sm:inline">Signed in as <strong className="text-foreground">{user.name}</strong></span>}
          <Button variant="outline" className="rounded-full" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="size-4 mr-2" /> Sign out
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="bg-card border rounded-2xl p-2 lg:p-3 shadow-sm-elegant">
            <nav className="space-y-0.5">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive ? "bg-primary text-primary-foreground shadow-sm-elegant" : "hover:bg-muted text-foreground/80",
                    )
                  }
                >
                  <n.icon className="size-4" />
                  <span className="flex-1">{n.label}</span>
                  {n.badge !== undefined && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">{n.badge}</span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
};
