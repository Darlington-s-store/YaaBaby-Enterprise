import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyPhone from "./pages/VerifyPhone";
import AdminLogin from "./pages/AdminLogin";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import AccountLayout from "./pages/account/AccountLayout";
import AccountOverview from "./pages/account/Overview";
import AccountOrders from "./pages/account/Orders";
import AccountOrderDetail from "./pages/account/OrderDetail";
import AccountWishlist from "./pages/account/Wishlist";
import AccountAddresses from "./pages/account/Addresses";
import AccountPayment from "./pages/account/Payment";
import AccountNotifications from "./pages/account/Notifications";
import AccountSettings from "./pages/account/Settings";
import AccountReviews from "./pages/account/MyReviews";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/Overview";
import AdminOrders from "./pages/admin/Orders";
import AdminOrderDetail from "./pages/admin/OrderDetail";
import AdminProducts from "./pages/admin/Products";
import AdminProductEditor from "./pages/admin/ProductEditor";
import AdminInventory from "./pages/admin/Inventory";
import AdminCategories from "./pages/admin/Categories";
import AdminCustomers from "./pages/admin/Customers";
import AdminUsers from "./pages/admin/Users";
import AdminReviews from "./pages/admin/Reviews";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";
import AdminProfile from "./pages/admin/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* Storefront with header/footer */}
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/about" element={<About />} />
          </Route>

          {/* Account dashboard (own shell) */}
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<AccountOverview />} />
            <Route path="orders" element={<AccountOrders />} />
            <Route path="orders/:id" element={<AccountOrderDetail />} />
            <Route path="wishlist" element={<AccountWishlist />} />
            <Route path="addresses" element={<AccountAddresses />} />
            <Route path="reviews" element={<AccountReviews />} />
            <Route path="payment" element={<AccountPayment />} />
            <Route path="notifications" element={<AccountNotifications />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>

          {/* Admin dashboard (own shell) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductEditor />} />
            <Route path="products/:id" element={<AdminProductEditor />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Auth pages — full screen */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
