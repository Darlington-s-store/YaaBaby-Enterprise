import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrders, type OrderStatus } from "@/store/useStore";
import { formatGHS } from "@/lib/format";
import { StatusPill } from "./Overview";
import { toast } from "sonner";

const OrderDetail = () => {
  const { id } = useParams();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const setStatus = useOrders((s) => s.setStatus);

  if (!order)
    return (
      <div className="bg-card border rounded-2xl p-10 text-center max-w-2xl">
        <p className="text-muted-foreground mb-4">Order not found.</p>
        <Link to="/admin/orders" className="text-primary font-semibold">Back to orders</Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to orders
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full"><Printer className="size-4 mr-2" />Print</Button>
          <Button size="sm" className="rounded-full" onClick={() => { setStatus(order.id, "Refunded"); toast.success("Refund initiated"); }}>Refund</Button>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6 lg:p-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-display text-2xl font-bold">{order.id}</h2>
              <StatusPill status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">Placed {order.date} · Paid via {order.payment}</p>
          </div>
          <div className="w-48">
            <Select value={order.status} onValueChange={(v) => { setStatus(order.id, v as OrderStatus); toast.success(`Status updated to ${v}`); }}>
              <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["Pending", "Paid", "Shipped", "Delivered", "Cancelled", "Refunded"] as OrderStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold mb-4">Items ({order.items.length})</h3>
          <div className="space-y-4">
            {order.items.map((it) => (
              <div key={it.productId + (it.variant ?? "")} className="flex gap-4 items-center">
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
            <h3 className="font-display text-lg font-bold mb-3">Customer</h3>
            <div className="space-y-2 text-sm">
              <div className="font-semibold">{order.customer.name}</div>
              <a href={`mailto:${order.customer.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Mail className="size-4" />{order.customer.email}</a>
              <a href={`tel:${order.customer.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Phone className="size-4" />{order.customer.phone}</a>
            </div>
          </div>
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2"><MapPin className="size-4" /> Shipping</h3>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <div className="text-foreground font-medium">{order.shippingAddress.name}</div>
              {order.shippingAddress.line1}<br />{order.shippingAddress.city}, {order.shippingAddress.region}<br />{order.shippingAddress.phone}
            </div>
            {order.tracking && <div className="mt-3 text-xs">Tracking: <strong>{order.tracking}</strong></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
