import { useState } from "react";
import { Search, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminCustomers } from "@/data/dashboardMock";
import { formatGHS } from "@/lib/format";

const Customers = () => {
  const [q, setQ] = useState("");
  const filtered = adminCustomers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Customers <span className="text-muted-foreground">({adminCustomers.length})</span></h2>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="pl-10 h-10 rounded-full bg-muted/60 border-transparent" />
      </div>

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
                    <div className="flex gap-3 items-center">
                      <div className="size-10 rounded-full bg-emerald-gold grid place-items-center text-primary-foreground font-bold">{c.name[0]}</div>
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{c.joined}</td>
                  <td className="p-3 text-right font-semibold">{c.orders}</td>
                  <td className="p-3 text-right font-semibold">{formatGHS(c.spent)}</td>
                  <td className="p-3">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${c.status === "VIP" ? "bg-accent/20 text-accent-foreground" : "bg-success/15 text-success"}`}>{c.status}</span>
                  </td>
                  <td className="p-3 text-right">
                    <Button size="icon" variant="ghost" className="size-8" asChild>
                      <a href={`mailto:${c.email}`}><Mail className="size-4" /></a>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
