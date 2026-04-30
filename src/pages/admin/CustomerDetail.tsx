import { useMemo } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, 
  ShoppingBag, UserMinus, UserCheck, 
  Trash2, Edit, ExternalLink, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsers, useOrders, useAddresses } from "@/store/useStore";
import { formatGHS } from "@/lib/format";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const customer = useUsers((s) => s.users.find((u) => u.id === id));
  const allOrders = useOrders((s) => s.orders);
  const allAddresses = useAddresses((s) => s.addresses);
  
  const orders = useMemo(() => allOrders.filter((o) => o.userId === id), [allOrders, id]);
  const addresses = useMemo(() => allAddresses.filter((a) => a.userId === id), [allAddresses, id]);
  const { setStatus, remove } = useUsers();

  if (!customer) {
    return (
      <div className="p-10 text-center bg-card border rounded-2xl">
        <p className="text-muted-foreground mb-4">Customer not found.</p>
        <Button onClick={() => navigate("/admin/customers")}>Back to Customers</Button>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const onToggleStatus = () => {
    const next = customer.status === "active" ? "blocked" : "active";
    setStatus(customer.id, next);
    toast.success(`Customer ${next === "blocked" ? "blocked" : "unblocked"}`);
  };

  const onDelete = () => {
    if (confirm("Are you sure? This will permanently delete the customer account and cannot be undone.")) {
      remove(customer.id);
      toast.success("Customer deleted");
      navigate("/admin/customers");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <RouterLink to="/admin/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to customers
        </RouterLink>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <RouterLink to={`/admin/customers/${customer.id}/edit`}><Edit className="size-4 mr-2" />Edit Profile</RouterLink>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full text-destructive hover:bg-destructive/10" onClick={onDelete}>
            <Trash2 className="size-4 mr-2" />Delete
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-card border rounded-3xl p-6 lg:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative">
            <div className="size-24 rounded-3xl bg-emerald-gold grid place-items-center text-primary-foreground text-3xl font-bold overflow-hidden shadow-xl">
              {customer.avatar ? (
                <img src={customer.avatar} alt={customer.name} className="size-full object-cover" />
              ) : (
                customer.name[0]?.toUpperCase()
              )}
            </div>
            <div className={`absolute -bottom-2 -right-2 size-6 rounded-full border-4 border-card ${customer.status === "active" ? "bg-success" : "bg-destructive"}`} />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-3xl font-bold">{customer.name}</h1>
                <Badge className={`rounded-full px-3 py-1 uppercase tracking-wider text-[10px] ${customer.status === "active" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                  {customer.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">Customer ID: {customer.id}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-muted grid place-items-center"><Mail className="size-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                  <p className="font-semibold">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-muted grid place-items-center"><Phone className="size-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
                  <p className="font-semibold">{customer.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-muted grid place-items-center"><Calendar className="size-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Joined</p>
                  <p className="font-semibold">{customer.createdAt || "Apr 2026"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            <Button className="w-full rounded-full" onClick={onToggleStatus}>
              {customer.status === "active" ? (
                <><UserMinus className="size-4 mr-2" />Block Account</>
              ) : (
                <><UserCheck className="size-4 mr-2" />Unblock Account</>
              )}
            </Button>
            <Button variant="outline" className="w-full rounded-full" asChild>
              <a href={`mailto:${customer.email}`}><Mail className="size-4 mr-2" />Message</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-3xl p-6">
            <h3 className="font-display text-lg font-bold mb-4">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 grid place-items-center text-primary"><ShoppingBag className="size-5" /></div>
                  <span className="text-sm font-medium">Total Orders</span>
                </div>
                <span className="text-lg font-bold">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gold/10 grid place-items-center text-gold"><ShoppingBag className="size-5" /></div>
                  <span className="text-sm font-medium">Total Spent</span>
                </div>
                <span className="text-lg font-bold text-gradient-gold">{formatGHS(totalSpent)}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-6">
            <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><MapPin className="size-5" /> Addresses</h3>
            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No addresses saved yet.</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((a) => (
                  <div key={a.id} className="p-4 rounded-2xl border bg-muted/10 relative">
                    {a.isDefault && <Badge className="absolute top-2 right-2 text-[8px] px-1.5 h-4">Default</Badge>}
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{a.label}</p>
                    <p className="text-sm font-semibold mb-0.5">{a.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.line1}, {a.city}, {a.region}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-3xl overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Recent Orders</h3>
              <Button variant="ghost" size="sm" asChild className="rounded-full">
                <RouterLink to="/admin/orders">View all <ExternalLink className="size-3 ml-1.5" /></RouterLink>
              </Button>
            </div>
            <div className="flex-1">
              {orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <Package className="size-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">This customer hasn't placed any orders yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      <tr>
                        <th className="text-left p-4">Order ID</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-right p-4">Total</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-mono font-medium">{o.id}</td>
                          <td className="p-4 text-muted-foreground">{o.date}</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              o.status === 'Delivered' ? 'bg-success/15 text-success' :
                              o.status === 'Cancelled' ? 'bg-destructive/15 text-destructive' :
                              'bg-primary/15 text-primary'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4 text-right font-bold">{formatGHS(o.total)}</td>
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="icon" className="size-8 rounded-full" asChild>
                              <RouterLink to={`/admin/orders/${o.id}`}><ExternalLink className="size-4" /></RouterLink>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
