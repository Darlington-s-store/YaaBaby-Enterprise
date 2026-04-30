import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, Menu, X, Heart, Camera } from "lucide-react";
import { useNotifications } from "@/store/useNotifications";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart, useAuth } from "@/store/useCart";
import { categories } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "./NotificationCenter";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/shop" },
  { label: "Deals", href: "/shop?sale=true" },
  { label: "About", href: "/about" },
];

export const Header = () => {
  const count = useCart((s) => s.count());
  const user = useAuth((s) => s.user);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Promo bar */}
      <div className="bg-primary text-primary-foreground text-xs sm:text-sm">
        <div className="container-x mx-auto max-w-7xl flex items-center justify-between py-2.5">
          <span className="hidden sm:inline opacity-80">🇬🇭 Free delivery on orders above GH₵500</span>
          <div className="flex items-center gap-4 mx-auto sm:mx-0">
            <span className="font-medium tracking-wide">⚡ Flash sale — up to 40% off</span>
          </div>
          <span className="hidden md:inline opacity-80">Trusted by 50,000+ customers</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 glass border-b">
        <div className="container-x mx-auto max-w-7xl flex items-center gap-4 h-16 lg:h-20">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 font-display text-xl lg:text-2xl font-bold tracking-tight">
            <span className="size-9 rounded-xl bg-gradient-emerald-gold grid place-items-center text-accent-foreground font-black">Y</span>
            <span className="hidden sm:inline">YAA <span className="text-gradient-gold">BABY</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 ml-8">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className={cn(
                  "text-sm font-medium relative py-2 transition-colors hover:text-primary",
                  location.pathname === l.href ? "text-primary" : "text-foreground/70",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2 ml-4 mr-4">
            {!user ? (
              <>
                <Button variant="ghost" size="sm" asChild className="rounded-full">
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="rounded-full bg-primary hover:bg-primary/90">
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" asChild className="rounded-full gap-2">
                <Link to={user.role !== "Customer" ? "/admin" : "/account"}>
                  <div className="size-6 rounded-full bg-emerald-gold grid place-items-center text-[10px] font-bold text-primary-foreground">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
                </Link>
              </Button>
            )}
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search products, brands, categories…"
                className="pl-11 pr-11 h-11 rounded-full bg-muted/60 border-transparent focus-visible:bg-background"
              />
              <button 
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => {
                  useNotifications.getState().addNotification({
                    type: "search",
                    title: "Image Uploaded 📸",
                    message: "Customer uploaded an image for visual search.",
                    link: "/admin/analytics"
                  });
                  useNotifications.getState().addNotification({
                    type: "admin_alert",
                    title: "New Image Search 📸",
                    message: "A new visual search request has been uploaded.",
                    link: "/admin/analytics"
                  });
                }}
              >
                <Camera className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
              <Link to="/account"><Heart className="size-5" /></Link>
            </Button>
            <NotificationCenter />
            <Button variant="ghost" size="icon" asChild>
              <Link to={user ? (user.role !== "Customer" ? "/admin" : "/account") : "/login"}>
                <User className="size-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingBag className="size-5" />
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 size-5 grid place-items-center rounded-full bg-gold text-accent-foreground text-[10px] font-bold"
                  >{count}</motion.span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {searchOpen && (
          <div className="md:hidden container-x pb-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search…" className="pl-11 h-11 rounded-full bg-muted" />
            </div>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-background p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-xl font-bold">YAA BABY</span>
                <button onClick={() => setMobileOpen(false)}><X className="size-5" /></button>
              </div>
              <nav className="space-y-1 mb-8">
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 px-3 rounded-lg hover:bg-muted text-base font-medium"
                  >{l.label}</Link>
                ))}
                {!user ? (
                  <div className="grid grid-cols-2 gap-2 p-3 pt-4">
                    <Button variant="outline" asChild className="rounded-full" onClick={() => setMobileOpen(false)}>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild className="rounded-full" onClick={() => setMobileOpen(false)}>
                      <Link to="/register">Sign up</Link>
                    </Button>
                  </div>
                ) : (
                  <Link
                    to={user.role !== "Customer" ? "/admin" : "/account"}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted text-base font-medium text-primary"
                  >
                    <User className="size-5" />
                    Dashboard
                  </Link>
                )}
              </nav>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-3">Categories</div>
              <div className="space-y-1">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/shop?cat=${c.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted text-sm"
                  ><span>{c.icon}</span>{c.name}</Link>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
