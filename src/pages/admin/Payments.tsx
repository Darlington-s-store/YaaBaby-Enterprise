import { useState, useMemo, useEffect } from "react";
import { 
  CreditCard, ExternalLink, Search, Filter, 
  Download, Plus, CheckCircle2, XCircle, 
  Clock, ArrowUpRight, Wallet, Receipt,
  Building2, Banknote, type LucideIcon
} from "lucide-react";
import { useTransactions, Transaction } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const StatusPill = ({ status }: { status: Transaction["status"] }) => {
  const styles = {
    success: "bg-emerald/10 text-emerald-700 border-emerald/20",
    pending: "bg-gold/10 text-gold-darker border-gold/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    reversed: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const icons = {
    success: <CheckCircle2 className="size-3" />,
    pending: <Clock className="size-3" />,
    failed: <XCircle className="size-3" />,
    reversed: <Clock className="size-3" />,
  };

  return (
    <div className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wider w-fit", styles[status])}>
      {icons[status]}
      {status}
    </div>
  );
};

const SummaryCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: LucideIcon, color: string }) => (
  <div className="bg-card border rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <div className={cn("absolute -right-4 -top-4 size-24 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-500", color)} />
    <div className="flex items-center justify-between">
      <div className={cn("size-10 rounded-xl flex items-center justify-center", color.replace("bg-", "bg-opacity-10 text-").replace(" text-", " text-opacity-100 bg-"))}>
        <Icon className="size-5" />
      </div>
      <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <h4 className="text-2xl font-display font-bold mt-1 tracking-tight">{value}</h4>
    </div>
  </div>
);

const Payments = () => {
  const { transactions, fetch, add, setStatus } = useTransactions();

  useEffect(() => {
    fetch();
  }, [fetch]);

  const [search, setSearch] = useState("");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const successful = transactions.filter(t => t.status === "success");
    const totalRevenue = successful.reduce((acc, curr) => acc + curr.amount, 0);
    const pending = transactions.filter(t => t.status === "pending").reduce((acc, curr) => acc + curr.amount, 0);
    const today = successful.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).reduce((acc, curr) => acc + curr.amount, 0);
    
    return {
      total: `GH₵${totalRevenue.toLocaleString()}`,
      pending: `GH₵${pending.toLocaleString()}`,
      today: `GH₵${today.toLocaleString()}`,
      count: transactions.length
    };
  }, [transactions]);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.reference.toLowerCase().includes(search.toLowerCase()) || t.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = filterChannel === "all" || t.channel === filterChannel;
    return matchesSearch && matchesChannel;
  });

  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    channel: "Bank Transfer",
    status: "pending",
    amount: 0,
    customerName: "",
    customerEmail: "",
    orderId: "",
    reference: ""
  });

  const handleAddOffline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.customerName || !newTx.reference) return toast.error("Please fill all required fields");
    
    add({
      orderId: newTx.orderId || "OFFLINE",
      reference: newTx.reference,
      customerName: newTx.customerName,
      customerEmail: newTx.customerEmail || "",
      amount: Number(newTx.amount),
      channel: newTx.channel as Transaction["channel"],
      status: newTx.status as Transaction["status"],
    });

    toast.success("Offline transaction recorded");
    setIsAddOpen(false);
    setNewTx({ channel: "Bank Transfer", status: "pending", amount: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Payments & Transactions</h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor revenue, reconcile payments, and manage offline records.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (confirm("Are you sure you want to clear all transaction records? This cannot be undone.")) {
                useTransactions.getState().clearAll();
                toast.success("All transaction records cleared");
              }
            }}
          >
            <XCircle className="size-4 mr-2" /> Clear All
          </Button>
          <Button variant="outline" className="rounded-full shadow-sm bg-white" asChild>
            <a href="https://dashboard.paystack.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4 mr-2" /> Paystack Dashboard
            </a>
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-lg shadow-primary/20">
                <Plus className="size-4 mr-2" /> Log Offline Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Record Offline Transaction</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleAddOffline}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Channel</Label>
                    <Select value={newTx.channel} onValueChange={v => setNewTx({...newTx, channel: v as Transaction["channel"]})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Cash on delivery">Cash on delivery</SelectItem>
                        <SelectItem value="MoMo">Direct MoMo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={newTx.status} onValueChange={v => setNewTx({...newTx, status: v as Transaction["status"]})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="pending">Pending Verification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Reference / Receipt #</Label>
                  <Input required placeholder="e.g. BT-902183" value={newTx.reference} onChange={e => setNewTx({...newTx, reference: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Amount (GH₵)</Label>
                    <Input required type="number" step="0.01" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Order ID (Optional)</Label>
                    <Input placeholder="YBE-XXXX" value={newTx.orderId} onChange={e => setNewTx({...newTx, orderId: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Customer Name</Label>
                  <Input required placeholder="Ama Serwaa" value={newTx.customerName} onChange={e => setNewTx({...newTx, customerName: e.target.value})} />
                </div>

                <DialogFooter>
                  <Button type="submit" className="w-full rounded-xl">Save Record</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Revenue" value={stats.total} icon={Wallet} color="bg-primary" />
        <SummaryCard title="Pending Clearing" value={stats.pending} icon={Clock} color="bg-gold" />
        <SummaryCard title="Revenue Today" value={stats.today} icon={ArrowUpRight} color="bg-emerald" />
        <SummaryCard title="Total Volume" value={stats.count.toString()} icon={Receipt} color="bg-blue-500" />
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border focus-within:ring-2 ring-primary/20 transition-all">
            <Search className="size-4 text-muted-foreground" />
            <input 
              placeholder="Search reference or customer..." 
              className="bg-transparent border-none outline-none text-sm w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-40 h-9 rounded-full bg-white"><Filter className="size-3.5 mr-2" /><SelectValue placeholder="All Channels" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="Paystack">Paystack</SelectItem>
                <SelectItem value="MoMo">MoMo</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cash on delivery">Cash on delivery</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="rounded-full h-9"><Download className="size-3.5 mr-2" /> Export</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                <th className="text-left p-4">Reference</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Channel</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-t hover:bg-muted/10 transition-colors">
                  <td className="p-4">
                    <div className="font-mono text-xs font-bold text-primary">{tx.reference}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Order: {tx.orderId}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{tx.customerName}</div>
                    <div className="text-xs text-muted-foreground">{tx.customerEmail}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">GH₵{tx.amount.toFixed(2)}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {tx.channel === "Paystack" && <CreditCard className="size-3.5 text-primary" />}
                      {tx.channel === "Bank Transfer" && <Building2 className="size-3.5 text-emerald-gold-darker" />}
                      {tx.channel === "Cash on delivery" && <Banknote className="size-3.5 text-gold-darker" />}
                      {tx.channel === "MoMo" && <Wallet className="size-3.5 text-blue-500" />}
                      <span className="text-xs font-medium">{tx.channel}</span>
                    </div>
                  </td>
                  <td className="p-4"><StatusPill status={tx.status} /></td>
                  <td className="p-4 text-muted-foreground text-xs">{format(new Date(tx.date), "MMM d, h:mm a")}</td>
                  <td className="p-4 text-right">
                    {tx.status === "pending" && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-emerald-700 hover:text-emerald-700 hover:bg-emerald/10 h-7 rounded-full text-xs font-bold"
                        onClick={() => { setStatus(tx.id, "success"); toast.success("Payment verified"); }}
                      >
                        Verify
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <Receipt className="size-12 mx-auto opacity-10 mb-3" />
                    <p>No transactions found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-lg font-bold">Reconciliation Guidelines</h3>
          <div className="space-y-3">
            {[
              { t: "Automated Verification", d: "Paystack & MoMo transactions are automatically verified. Only log them manually if an API failure occurs.", i: CreditCard },
              { t: "Offline Receipts", d: "Always upload receipt screenshots for Bank Transfers to ensure a proper audit trail.", i: Receipt },
              { t: "MoMo Payouts", d: "The Paystack dashboard handles your MoMo settlements. Reconciliation happens every 24 hours.", i: Building2 }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-transparent hover:border-muted-foreground/10 transition-all">
                <div className="size-8 rounded-lg bg-white border grid place-items-center flex-shrink-0">
                  <item.i className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">{item.t}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-emerald-gold rounded-2xl p-6 text-primary-foreground space-y-6 shadow-xl shadow-primary/20 relative overflow-hidden">
          <CreditCard className="absolute -right-8 -bottom-8 size-48 opacity-10 rotate-12" />
          <div className="relative z-10">
            <h3 className="font-display text-xl font-bold">Paystack Integration</h3>
            <p className="text-sm text-primary-foreground/80 mt-1 max-w-sm">
              Your store is currently connected to Paystack Live. All transactions shown here are synced with your merchant account.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-[10px] uppercase tracking-wider font-bold opacity-60">Status</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-[10px] uppercase tracking-wider font-bold opacity-60">Settlement</p>
                <p className="text-lg font-bold">T + 1 Day</p>
              </div>
            </div>
            <Button className="w-full mt-6 bg-white text-primary hover:bg-slate-100 rounded-xl font-bold h-11" asChild>
              <a href="https://dashboard.paystack.com" target="_blank" rel="noopener noreferrer">
                Access Merchant Console
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
