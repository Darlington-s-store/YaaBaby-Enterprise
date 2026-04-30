import { useState, useMemo } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Search, Mail, Users as UsersIcon, Plus, MoreHorizontal, UserMinus, UserCheck, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUsers, useOrders } from "@/store/useStore";
import { formatGHS } from "@/lib/format";
import { toast } from "sonner";

const Customers = () => {
  const navigate = useNavigate();
  const rawUsers = useUsers((s) => s.users);
  const allUsers = useMemo(() => rawUsers.filter((u) => u.role === "Customer"), [rawUsers]);
  const orders = useOrders((s) => s.orders);
  const { register, setStatus, remove, update } = useUsers();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const filtered = useMemo(() => {
    return allUsers.filter((u) => 
      u.name.toLowerCase().includes(q.toLowerCase()) || 
      u.email.toLowerCase().includes(q.toLowerCase())
    ).map((u) => {
      const userOrders = orders.filter((o) => o.userId === u.id);
      const spent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      return {
        ...u,
        ordersCount: userOrders.length,
        spent,
        status: u.status || "active",
        displayDate: u.createdAt || "Apr 2026"
      };
    });
  }, [allUsers, orders, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Customers <span className="text-muted-foreground text-base font-normal">({allUsers.length})</span></h2>
          <p className="text-sm text-muted-foreground mt-1">View and manage your registered customer base.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full"><Plus className="size-4 mr-2" />New customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create customer</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const created = register({ name, email, password, role: "Customer" });
              if (!created) return toast.error("That email is already registered");
              toast.success("Customer account created");
              setOpen(false); setName(""); setEmail(""); setPassword("");
            }}>
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email address</Label>
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" className="rounded-full w-full sm:w-auto">Create customer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="pl-10 h-10 rounded-full bg-muted/60 border-transparent" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border rounded-2xl p-16 text-center">
          <UsersIcon className="size-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg font-bold mb-1">{allUsers.length === 0 ? "No customers yet" : "No customers match your search"}</h3>
          <p className="text-sm text-muted-foreground">{allUsers.length === 0 ? "Customers who sign up on the storefront will appear here." : ""}</p>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                <tr>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Joined</th>
                  <th className="text-right p-4">Orders</th>
                  <th className="text-right p-4">Spent</th>
                  <th className="text-left p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex gap-3 items-center group cursor-pointer" onClick={() => navigate(`/admin/customers/${c.id}`)}>
                        <div className="size-10 rounded-full bg-emerald-gold grid place-items-center text-primary-foreground font-bold shrink-0">{c.name[0]?.toUpperCase()}</div>
                        <div className="min-w-0">
                          <div className="font-semibold group-hover:text-primary transition-colors truncate">{c.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{c.displayDate}</td>
                    <td className="p-3 text-right font-semibold">{c.ordersCount}</td>
                    <td className="p-3 text-right font-semibold">{formatGHS(c.spent)}</td>
                    <td className="p-3">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${c.status === "blocked" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>{c.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="size-8 rounded-full">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <RouterLink to={`/admin/customers/${c.id}`} className="cursor-pointer">
                              <UsersIcon className="size-4 mr-2" /> View Profile
                            </RouterLink>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <RouterLink to={`/admin/customers/${c.id}/edit`} className="cursor-pointer">
                              <Edit className="size-4 mr-2" /> Edit Details
                            </RouterLink>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${c.email}`} className="cursor-pointer">
                              <Mail className="size-4 mr-2" /> Send Email
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const newStatus = c.status === "active" ? "blocked" : "active";
                            setStatus(c.id, newStatus);
                            toast.success(`Customer ${newStatus === "blocked" ? "blocked" : "unblocked"}`);
                          }}>
                            {c.status === "active" ? (
                              <><UserMinus className="size-4 mr-2" /> Block Customer</>
                            ) : (
                              <><UserCheck className="size-4 mr-2" /> Unblock Customer</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this customer? This cannot be undone.")) {
                                remove(c.id);
                                toast.success("Customer deleted");
                              }
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-4 mr-2" /> Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
