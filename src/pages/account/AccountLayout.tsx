import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Package, Heart, MapPin, CreditCard, Bell, LayoutDashboard, MessageSquare } from "lucide-react";
import { useAuth } from "@/store/useCart";
import { DashboardShell } from "@/components/DashboardShell";
import { useOrders, useWishlist } from "@/store/useStore";

const AccountLayout = () => {
  const user = useAuth((s) => s.user);
  const location = useLocation();
  const myOrders = useOrders((s) => (user ? s.orders.filter((o) => o.userId === user.id) : []));
  const wishlistCount = useWishlist((s) => s.ids.length);

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;

  const nav = [
    { to: "/account", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/account/orders", label: "My orders", icon: Package, badge: myOrders.length || undefined },
    { to: "/account/wishlist", label: "Wishlist", icon: Heart, badge: wishlistCount || undefined },
    { to: "/account/addresses", label: "Addresses", icon: MapPin },
    { to: "/account/reviews", label: "My reviews", icon: MessageSquare },
    { to: "/account/payment", label: "Payment methods", icon: CreditCard },
    { to: "/account/notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <DashboardShell
      variant="account"
      brandLabel="My account"
      nav={nav}
      profilePath="/account/settings"
      settingsPath="/account/settings"
      searchPlaceholder="Search orders, products…"
    >
      <Outlet />
    </DashboardShell>
  );
};

export default AccountLayout;
