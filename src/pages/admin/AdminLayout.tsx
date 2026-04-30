import { Navigate, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Tag, 
  BarChart3, Boxes, MessageSquare, ShieldCheck, 
  Plus, User as UserIcon, Settings, PlusCircle, UserPlus, CreditCard, Truck 
} from "lucide-react";
import { useAuth } from "@/store/useCart";
import { DashboardShell } from "@/components/DashboardShell";
import { useOrders, useReviews } from "@/store/useStore";

const AdminLayout = () => {
  const user = useAuth((s) => s.user);
  const location = useLocation();
  const allOrders = useOrders((s) => s.orders);
  const allReviews = useReviews((s) => s.reviews);
  const pendingOrders = allOrders.filter((o) => o.status === "Pending").length;
  const pendingReviews = allReviews.filter((r) => r.status === "pending").length;

  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (user.role === "Customer") return <Navigate to="/" replace />;

  const canManageAdmins = user.role === "Super Admin" || user.permissions?.can_manage_users;

  const nav = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag, badge: pendingOrders || undefined },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/inventory", label: "Inventory", icon: Boxes },
    { to: "/admin/categories", label: "Categories", icon: Tag },
    { to: "/admin/reviews", label: "Reviews", icon: MessageSquare, badge: pendingReviews || undefined },
    { to: "/admin/customers", label: "Customers", icon: Users },
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/admin/shipping", label: "Shipping", icon: Truck },
    ...(canManageAdmins ? [{ to: "/admin/management", label: "Admin Management", icon: ShieldCheck }] : []),
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/profile", label: "Profile", icon: UserIcon },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <DashboardShell
      variant="admin"
      brandLabel="Admin"
      nav={nav}
      profilePath="/admin/profile"
      settingsPath="/admin/settings"
      searchPlaceholder="Search orders, products, customers…"
    >
      <Outlet />
    </DashboardShell>
  );
};

export default AdminLayout;
