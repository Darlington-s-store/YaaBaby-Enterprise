import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Settings, User as UserIcon, Bell, ChevronDown, Search } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useAuth } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type DashNav = { to: string; label: string; icon: LucideIcon; badge?: string | number; end?: boolean };

type Props = {
  variant: "admin" | "account";
  brandLabel: string;
  nav: DashNav[];
  profilePath: string;
  settingsPath: string;
  searchPlaceholder?: string;
  children: ReactNode;
};

export const DashboardShell = ({ variant, brandLabel, nav, profilePath, settingsPath, searchPlaceholder, children }: Props) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const onSignOut = () => {
    signOut();
    navigate(variant === "admin" ? "/admin/login" : "/");
  };

  const initials = user?.name?.slice(0, 1).toUpperCase() ?? "Y";

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r bg-card">
        <div className="px-5 py-5 border-b">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="size-9 rounded-xl bg-emerald-gold grid place-items-center text-primary-foreground font-black">Y</span>
            <span>YAA <span className="text-gradient-gold">BABY</span></span>
          </Link>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-2 font-semibold">{brandLabel}</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm-elegant"
                    : "hover:bg-muted text-foreground/75",
                )
              }
            >
              <n.icon className="size-4 shrink-0" />
              <span className="flex-1 truncate">{n.label}</span>
              {n.badge !== undefined && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/25 text-accent-foreground">{n.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to storefront</Link>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b">
          <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-16">
            <div className="lg:hidden font-display font-bold">{brandLabel}</div>
            <div className="relative hidden md:flex flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder={searchPlaceholder ?? "Search…"} className="pl-10 h-10 rounded-full bg-muted/60 border-transparent" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="size-5" />
                <span className="absolute top-2 right-2 size-2 rounded-full bg-accent" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-muted transition-colors">
                    <span className="size-8 rounded-full bg-emerald-gold grid place-items-center text-primary-foreground font-bold text-sm">{initials}</span>
                    <span className="text-sm font-semibold hidden sm:inline">{user?.name ?? "Guest"}</span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-semibold">{user?.name}</div>
                    <div className="text-xs text-muted-foreground font-normal truncate">{user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={profilePath} className="cursor-pointer"><UserIcon className="size-4 mr-2" /> My profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={settingsPath} className="cursor-pointer"><Settings className="size-4 mr-2" /> Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="size-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* mobile nav */}
          <div className="lg:hidden border-t overflow-x-auto">
            <div className="flex gap-1 px-3 py-2">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted",
                    )
                  }
                >
                  <n.icon className="size-3.5" /> {n.label}
                </NavLink>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-w-0">{children}</main>
      </div>
    </div>
  );
};
