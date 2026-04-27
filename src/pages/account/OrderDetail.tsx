import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Package, Truck, Home as HomeIcon, Download } from "lucide-react";
import { myOrders } from "@/data/dashboardMock";
import { formatGHS } from "@/lib/format";
import { Button } from "@/components/ui/button";

const steps = [
  { key: "Paid", label: "Order placed", icon: Check },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: HomeIcon },
];

const OrderDetail = () => {
  const { id } = useParams();
  const order = myOrders.find((o) => o.id === id);
  if (!order)
    return (
      <div className="bg-card border rounded-2xl p-10 text-center">
        <p className="text-muted-foreground mb-4">Order not found.</p>
        <Link to="/account/orders" className="text-primary font-semibold">Back to orders</Link>
      </div>
    );

  const order_idx = ["Pending", "Paid", "Shipped", "Delivered"].indexOf(order.status);

  return (
    <div className="space-y-6">
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to orders
      </Link>

      <div className="bg-card border rounded-2xl p-6 lg:p-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">{order.id}</h2>
            <p className="text-sm text-muted-foreground">Placed on {order.date} · Paid via {order.payment}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full"><Download className="size-4 mr-2" />Invoice</Button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          {steps.map((s, i) => {
            const done = order_idx >= ["Pending", "Paid", "Shipped", "Delivered"].indexOf(s.key);
            return (
              <div key={s.key} className="flex flex-col items-center gap-2 text-center">
                <div className={`size-10 rounded-full grid place-items-center ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <s.icon className="size-4" />
                </div>
                <div className="text-xs font-semibold">{s.label}</div>
                {i < steps.length - 1 && <div className="hidden" />}
              </div>
            );
          })}
        </div>
        <div className="relative h-1 bg-muted rounded-full overflow-hidden -mt-7 mx-12 mb-6">
          <div className="h-full bg-primary transition-all" style={{ width: `${Math.max(0, order_idx - 1) / 2 * 100}%` }} />
        </div>

        {order.tracking && (
          <div className="bg-muted/50 rounded-xl p-4 text-sm flex items-center gap-3">
            <Package className="size-4 text-primary" />
            Tracking number: <strong>{order.tracking}</strong>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold mb-4">Items</h3>
          <div className="space-y-4">
            {order.items.map((it) => (
              <div key={it.productId} className="flex gap-4 items-center">
                <img src={it.image} alt="" className="size-16 rounded-xl object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold line-clamp-1">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.variant ?? "Standard"} · Qty {it.quantity}</div>
                </div>
                <div className="font-semibold">{formatGHS(it.price * it.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="border-t mt-6 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatGHS(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shipping === 0 ? "Free" : formatGHS(order.shipping)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatGHS(order.tax)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span>{formatGHS(order.total)}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold mb-3">Shipping address</h3>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <div className="text-foreground font-medium">{order.shippingAddress.name}</div>
              {order.shippingAddress.line1}<br />
              {order.shippingAddress.city}, {order.shippingAddress.region}<br />
              {order.shippingAddress.phone}
            </div>
          </div>
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold mb-3">Need help?</h3>
            <p className="text-sm text-muted-foreground mb-4">Contact our team for returns, refunds or delivery questions.</p>
            <Button variant="outline" className="rounded-full w-full">Contact support</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
