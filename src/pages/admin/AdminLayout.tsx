import { Navigate, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, BarChart3, Settings, Boxes } from "lucide-react";
import { useAuth } from "@/store/useCart";
import { DashboardShell } from "@/components/DashboardShell";
import { orders } from "@/data/dashboardMock";
import { products } from "@/data/catalog";

const AdminLayout = () => {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin")
    return (
      <div className="container-x mx-auto max-w-md py-24 text-center">
        <h1 className="font-display text-2xl font-bold mb-3">Admin access required</h1>
        <p className="text-muted-foreground mb-6">Sign in with an email containing "admin" to view this dashboard.</p>
        <Link to="/login" className="text-primary font-semibold underline">Go to login</Link>
      </div>
    );

  const pending = orders.filter((o) => o.status === "Pending").length;
  const nav = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag, badge: pending || undefined },
    { to: "/admin/products", label: "Products", icon: Package, badge: products.length },
    { to: "/admin/inventory", label: "Inventory", icon: Boxes },
    { to: "/admin/categories", label: "Categories", icon: Tag },
    { to: "/admin/customers", label: "Customers", icon: Users },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <DashboardShell eyebrow="Admin" title="Control center" nav={nav}>
      <Outlet />
    </DashboardShell>
  );
};

export default AdminLayout;
