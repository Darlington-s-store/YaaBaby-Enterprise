import { Navigate, Outlet } from "react-router-dom";
import { Package, Heart, MapPin, CreditCard, Settings, LayoutDashboard, Bell } from "lucide-react";
import { useAuth } from "@/store/useCart";
import { DashboardShell } from "@/components/DashboardShell";
import { myOrders, myWishlist } from "@/data/dashboardMock";

const AccountLayout = () => {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;

  const nav = [
    { to: "/account", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/account/orders", label: "Orders", icon: Package, badge: myOrders.length },
    { to: "/account/wishlist", label: "Wishlist", icon: Heart, badge: myWishlist.length },
    { to: "/account/addresses", label: "Addresses", icon: MapPin },
    { to: "/account/payment", label: "Payment methods", icon: CreditCard },
    { to: "/account/notifications", label: "Notifications", icon: Bell },
    { to: "/account/settings", label: "Settings", icon: Settings },
  ];

  return (
    <DashboardShell eyebrow="My account" title={`Hi, ${user.name} 👋`} nav={nav}>
      <Outlet />
    </DashboardShell>
  );
};

export default AccountLayout;
