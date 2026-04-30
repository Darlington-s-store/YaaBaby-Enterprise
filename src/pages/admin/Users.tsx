import { useState } from "react";
import { Plus, ShieldCheck, Trash2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers, type AdminRole } from "@/store/useStore";
import { useAuth } from "@/store/useCart";
import { StatusPill } from "./Overview";
import { toast } from "sonner";

const Users = () => {
  const me = useAuth((s) => s.user)!;
  const users = useUsers((s) => s.users);
  const { register, setStatus, setRole, remove } = useUsers();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setNewRole] = useState<AdminRole>("Admin");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Users & roles</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage all accounts on the platform — customers and administrators.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full"><Plus className="size-4 mr-2" />New user</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create user</DialogTitle></DialogHeader>
            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault();
              const created = register({ name, email, password, role });
              if (!created) return toast.error("That email is already registered");
              toast.success(`${role !== "Customer" ? "Admin" : "Customer"} created`);
              setOpen(false); setName(""); setEmail(""); setPassword("");
            }}>
              <div><Label>Full name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Temporary password</Label><Input required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <div>
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setNewRole(v as AdminRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter><Button type="submit" className="rounded-full">Create</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
              <tr>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Joined</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex gap-3 items-center">
                      <div className={`size-10 rounded-full grid place-items-center text-primary-foreground font-bold ${u.role !== "Customer" ? "bg-emerald-gold" : "bg-primary"}`}>
                        {u.role !== "Customer" ? <ShieldCheck className="size-4" /> : u.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{u.name} {u.id === me.id && <span className="text-xs text-muted-foreground">(you)</span>}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Select value={u.role} onValueChange={(v) => { setRole(u.id, v as AdminRole); toast.success("Role updated"); }} disabled={u.id === me.id}>
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Customer">Customer</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3"><StatusPill status={u.status} /></td>
                  <td className="p-3 text-muted-foreground">{u.createdAt}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {u.id !== me.id && (
                        <>
                          <Button size="sm" variant="outline" className="rounded-full text-xs h-7" onClick={() => { setStatus(u.id, u.status === "blocked" ? "active" : "blocked"); toast.success(u.status === "blocked" ? "Unblocked" : "Blocked"); }}>
                            {u.status === "blocked" ? "Unblock" : "Block"}
                          </Button>
                          <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => { if (confirm(`Delete ${u.name}?`)) { remove(u.id); toast.success("User deleted"); } }}><Trash2 className="size-3.5" /></Button>
                        </>
                      )}
                    </div>
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

export default Users;
