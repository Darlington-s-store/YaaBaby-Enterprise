import { useState, useEffect, useMemo } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, Camera, Edit, Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsers } from "@/store/useStore";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { COUNTRY_DATA } from "@/data/countries";
import { cn } from "@/lib/utils";

const CustomerEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, update } = useUsers();
  const customer = users.find((u) => u.id === id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryId, setCountryId] = useState("ghana");
  const [region, setRegion] = useState("");
  const [avatar, setAvatar] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone || "");
      // Map old GH/NG codes to new IDs if necessary, or just use IDs
      const mappedId = customer.country?.toLowerCase() === "gh" ? "ghana" : 
                       customer.country?.toLowerCase() === "ng" ? "nigeria" : 
                       customer.country || "ghana";
      setCountryId(mappedId);
      setRegion(customer.region || "");
      setAvatar(customer.avatar);
    }
  }, [customer]);

  const selectedCountry = useMemo(() => 
    COUNTRY_DATA.find((c) => c.id === countryId) || COUNTRY_DATA[0], 
  [countryId]);

  const regions = selectedCountry.states;

  if (!customer) {
    return (
      <div className="p-10 text-center bg-card border rounded-2xl">
        <p className="text-muted-foreground mb-4">Customer not found.</p>
        <Button onClick={() => navigate("/admin/customers")}>Back to Customers</Button>
      </div>
    );
  }

  const onAvatar = (file?: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2MB");
    const reader = new FileReader();
    reader.onload = () => setAvatar(typeof reader.result === "string" ? reader.result : undefined);
    reader.readAsDataURL(file);
  };

  const onCountryChange = (id: string) => {
    setCountryId(id);
    setRegion("");
    setOpen(false);
    
    const c = COUNTRY_DATA.find(x => x.id === id);
    if (c && (!phone || phone.startsWith("+"))) {
      setPhone(c.dialCode);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    update(customer.id, {
      name, email, phone, country: countryId, region, avatar
    });
    setSubmitting(false);
    toast.success("Customer profile updated");
    navigate(`/admin/customers/${customer.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <RouterLink to={`/admin/customers/${customer.id}`} className="size-10 rounded-full border bg-card grid place-items-center hover:bg-muted transition-colors">
          <ArrowLeft className="size-4" />
        </RouterLink>
        <div>
          <h2 className="font-display text-2xl font-bold">Edit Customer Profile</h2>
          <p className="text-sm text-muted-foreground">Modify personal details and account settings for {customer.name}.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Left: Avatar & Primary Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-3xl p-6 lg:p-8 flex flex-col items-center text-center">
            <h3 className="font-display text-lg font-bold mb-6 self-start">Profile Image</h3>
            <div className="relative group">
              <button
                type="button"
                onClick={() => document.getElementById("avatar-input")?.click()}
                className="size-32 rounded-3xl bg-muted border-2 border-dashed grid place-items-center overflow-hidden hover:bg-muted/70 transition-all"
              >
                {avatar ? (
                  <img src={avatar} alt="Preview" className="size-full object-cover group-hover:opacity-50 transition-opacity" />
                ) : (
                  <Camera className="size-10 text-muted-foreground" />
                )}
                <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <Edit className="size-8 text-white" />
                </div>
              </button>
              <input 
                id="avatar-input" 
                type="file" 
                accept="image/*" 
                hidden 
                onChange={(e) => onAvatar(e.target.files?.[0])} 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Upload a high-resolution photo. <br />
              Max size: 2MB.
            </p>
          </div>

          <div className="bg-card border rounded-3xl p-6 lg:p-8 space-y-4">
            <h3 className="font-display text-lg font-bold">Quick Actions</h3>
            <div className="grid gap-2">
              <Button type="submit" disabled={submitting} className="w-full rounded-full h-11">
                {submitting ? "Saving…" : <><Save className="size-4 mr-2" />Save Changes</>}
              </Button>
              <Button type="button" variant="outline" className="w-full rounded-full h-11" onClick={() => navigate(`/admin/customers/${customer.id}`)}>
                Discard Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Detailed Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-3xl p-6 lg:p-8">
            <h3 className="font-display text-lg font-bold mb-6">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Full Name</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Email Address</Label>
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-xl bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all" placeholder="+233..." />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-6 lg:p-8">
            <h3 className="font-display text-lg font-bold mb-6">Location Details</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Country</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full h-12 rounded-xl bg-muted/20 border-muted-foreground/10 focus:bg-background justify-between font-normal"
                    >
                      {selectedCountry ? (
                        <span className="flex items-center gap-2">
                          <span>{selectedCountry.name}</span>
                        </span>
                      ) : (
                        "Select country..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl overflow-hidden shadow-2xl border-primary/10">
                    <Command>
                      <CommandInput placeholder="Search country..." className="h-12" />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {COUNTRY_DATA.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.name}
                              onSelect={() => onCountryChange(c.id)}
                              className="h-11 px-4 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-primary",
                                  countryId === c.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="flex-1">{c.name}</span>
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{c.dialCode}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Region / State</Label>
                <Select value={region || undefined} onValueChange={setRegion}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((s) => (
                      <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerEditor;
