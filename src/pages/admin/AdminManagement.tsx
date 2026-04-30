import { useState, useMemo } from "react";
import { 
  ShieldCheck, ShieldAlert, Shield, UserCog, 
  Plus, History, Trash2, Key, CheckCircle2, 
  XCircle, Clock, Search, Filter, MoreHorizontal,
  ChevronRight, type LucideIcon
} from "lucide-react";
import { format } from "date-fns";
import { useUsers, AdminRole, AdminPermissions } from "@/store/useStore";
import { useAuth } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogTrigger, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const roleIcons: Record<AdminRole, LucideIcon> = {
  "Super Admin": ShieldAlert,
  "Admin": ShieldCheck,
  "Manager": Shield,
  "Support Agent": UserCog,
  "Customer": UserCog, // Should not be here, but for safety
};

const roleColors: Record<AdminRole, string> = {
  "Super Admin": "bg-destructive/10 text-destructive",
  "Admin": "bg-primary/10 text-primary",
  "Manager": "bg-gold/10 text-gold-darker",
  "Support Agent": "bg-emerald/10 text-emerald-700",
  "Customer": "bg-muted text-muted-foreground",
};

const AdminManagement = () => {
  const me = useAuth((s) => s.user)!;
  const { users, register, setRole, remove, logActivity } = useUsers();
  
  const admins = useMemo(() => users.filter(u => u.role !== "Customer"), [users]);
  
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<AdminRole | "all">("all");
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("Admin");

  // Permissions Modal State
  const [permModalUser, setPermModalUser] = useState<string | null>(null);
  const [editingPerms, setEditingPerms] = useState<AdminPermissions | null>(null);

  // Activity Modal State
  const [activityUser, setActivityUser] = useState<string | null>(null);

  const filteredAdmins = admins.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === "all" || a.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const u = register({ name: newName, email: newEmail, password: newPass, role: newRole });
    if (!u) return toast.error("Email already registered");
    
    logActivity(me.id, "Created Admin", `${newName} (${newRole})`);
    toast.success(`${newRole} created successfully`);
    setIsCreateOpen(false);
    setNewName(""); setNewEmail(""); setNewPass(""); setNewRole("Admin");
  };

  const handleUpdatePerms = () => {
    if (!permModalUser || !editingPerms) return;
    const target = admins.find(a => a.id === permModalUser);
    if (!target) return;

    setRole(permModalUser, target.role, editingPerms);
    logActivity(me.id, "Updated Permissions", target.name);
    toast.success("Permissions updated");
    setPermModalUser(null);
  };

  const togglePermission = (key: keyof AdminPermissions) => {
    if (!editingPerms) return;
    setEditingPerms({ ...editingPerms, [key]: !editingPerms[key] });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Admin User Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure administrative access, roles, and granular permission matrices.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full h-11 px-6 shadow-lg shadow-primary/20">
              <Plus className="size-4 mr-2" /> New Administrator
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Administrator</DialogTitle>
              <DialogDescription>Create a new account with administrative privileges.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Ama Serwaa" />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="ama@yaababy.gh" />
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input required minLength={8} type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Assigned Role</Label>
                <Select value={newRole} onValueChange={v => setNewRole(v as AdminRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin (Full Access)</SelectItem>
                    <SelectItem value="Admin">Admin (Standard Access)</SelectItem>
                    <SelectItem value="Manager">Manager (Operations Only)</SelectItem>
                    <SelectItem value="Support Agent">Support Agent (Read Only + Support)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full rounded-full h-11">Create Admin Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…" 
            className="pl-10 h-11 rounded-full bg-card shadow-sm border-transparent focus:border-primary/20" 
          />
        </div>
        <Select value={selectedRole} onValueChange={v => setSelectedRole(v as AdminRole | "all")}>
          <SelectTrigger className="w-[180px] h-11 rounded-full bg-card shadow-sm border-transparent">
            <Filter className="size-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Super Admin">Super Admin</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Support Agent">Support Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Table */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm shadow-emerald/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b text-xs uppercase tracking-widest text-muted-foreground">
                <th className="text-left p-4 font-semibold">Administrator</th>
                <th className="text-left p-4 font-semibold">Role</th>
                <th className="text-left p-4 font-semibold">Access Level</th>
                <th className="text-left p-4 font-semibold">Joined</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAdmins.map((admin) => {
                const RoleIcon = roleIcons[admin.role] || UserCog;
                const isMe = admin.id === me.id;
                
                return (
                  <tr key={admin.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "size-10 rounded-full flex items-center justify-center font-bold text-sm",
                          isMe ? "bg-primary text-primary-foreground" : "bg-emerald-gold text-primary-foreground"
                        )}>
                          {admin.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate flex items-center gap-2">
                            {admin.name}
                            {isMe && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">You</span>}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        roleColors[admin.role]
                      )}>
                        <RoleIcon className="size-3" />
                        {admin.role}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {admin.permissions ? (
                          <>
                            {Object.entries(admin.permissions).filter(([_, v]) => v).slice(0, 3).map(([k]) => (
                              <div key={k} className="size-6 rounded-md bg-muted flex items-center justify-center" title={k.replace(/_/g, ' ')}>
                                <CheckCircle2 className="size-3 text-emerald-500" />
                              </div>
                            ))}
                            {Object.values(admin.permissions).filter(v => v).length > 3 && (
                              <div className="text-[10px] text-muted-foreground self-center ml-1">
                                +{Object.values(admin.permissions).filter(v => v).length - 3} more
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Default Access</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {admin.createdAt}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Manage Access</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setPermModalUser(admin.id);
                            setEditingPerms(admin.permissions || null);
                          }}>
                            <ShieldCheck className="size-4 mr-2" /> Permissions Matrix
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setActivityUser(admin.id)}>
                            <History className="size-4 mr-2" /> View Activity Log
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            disabled={isMe || admin.role === "Super Admin"}
                            onClick={() => {
                              const nextRole = admin.role === "Manager" ? "Admin" : "Manager";
                              setRole(admin.id, nextRole);
                              toast.success(`Role updated to ${nextRole}`);
                            }}
                          >
                            <Key className="size-4 mr-2" /> Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            disabled={isMe || admin.role === "Super Admin"}
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Revoke all access for ${admin.name}? This action is permanent.`)) {
                                remove(admin.id);
                                toast.success("Access revoked");
                              }
                            }}
                          >
                            <Trash2 className="size-4 mr-2" /> Revoke Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Modal */}
      <Dialog open={!!permModalUser} onOpenChange={(open) => !open && setPermModalUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Permissions Matrix
            </DialogTitle>
            <DialogDescription>
              Define granular access controls for {admins.find(a => a.id === permModalUser)?.name}.
            </DialogDescription>
          </DialogHeader>

          {editingPerms ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              {Object.keys(editingPerms).map((k) => (
                <div 
                  key={k} 
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                    editingPerms[k as keyof AdminPermissions] ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card"
                  )}
                  onClick={() => togglePermission(k as keyof AdminPermissions)}
                >
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold capitalize cursor-pointer">{k.replace(/_/g, ' ')}</Label>
                    <p className="text-[10px] text-muted-foreground">Allows performing {k.split('_')[1]} related actions.</p>
                  </div>
                  <Checkbox 
                    checked={editingPerms[k as keyof AdminPermissions]} 
                    onCheckedChange={() => togglePermission(k as keyof AdminPermissions)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
              <Shield className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">This user is currently using role-based defaults.</p>
              <Button variant="link" onClick={() => setEditingPerms({
                can_edit_products: true,
                can_view_analytics: true,
                can_process_refunds: false,
                can_manage_users: false,
                can_manage_inventory: true,
                can_view_logs: true
              })}>Customize Permissions</Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPermModalUser(null)}>Cancel</Button>
            <Button onClick={handleUpdatePerms} className="rounded-full px-8">Save Matrix</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Log Modal */}
      <Dialog open={!!activityUser} onOpenChange={(open) => !open && setActivityUser(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="size-5 text-primary" />
              Activity Audit Log
            </DialogTitle>
            <DialogDescription>
              Detailed security trail for {admins.find(a => a.id === activityUser)?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-3">
            {admins.find(a => a.id === activityUser)?.activities?.length ? (
              admins.find(a => a.id === activityUser)?.activities?.map((act) => (
                <div key={act.id} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-muted-foreground/10 transition-all">
                  <div className="size-10 rounded-full bg-background border flex items-center justify-center shrink-0">
                    <Clock className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground">{act.action}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{format(new Date(act.timestamp), 'MMM d, HH:mm:ss')}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <ChevronRight className="size-3" />
                      {act.target}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-50">
                <History className="size-10 mx-auto mb-3" />
                <p>No activity logs found for this administrator.</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button className="w-full rounded-full" onClick={() => setActivityUser(null)}>Close Audit Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;
