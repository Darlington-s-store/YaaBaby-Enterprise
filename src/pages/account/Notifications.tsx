import { useState } from "react";
import { Bell, Package, Tag, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const groups = [
  { icon: Package, title: "Order updates", desc: "Status changes, shipping, delivery", defaults: { email: true, sms: true, push: true } },
  { icon: Tag, title: "Promotions & deals", desc: "Flash sales, drops, exclusive offers", defaults: { email: true, sms: false, push: true } },
  { icon: Mail, title: "Newsletter", desc: "Weekly edit, brand stories", defaults: { email: true, sms: false, push: false } },
  { icon: Bell, title: "Account alerts", desc: "Sign-ins, security, password changes", defaults: { email: true, sms: true, push: false } },
];

const Notifications = () => {
  const [state, setState] = useState(groups.map((g) => g.defaults));
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Notifications</h2>
      <div className="bg-card border rounded-2xl divide-y">
        {groups.map((g, i) => (
          <div key={g.title} className="p-5 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex gap-4 flex-1 min-w-[220px]">
              <div className="size-10 rounded-xl bg-primary/10 grid place-items-center"><g.icon className="size-5 text-primary" /></div>
              <div>
                <div className="font-semibold">{g.title}</div>
                <div className="text-sm text-muted-foreground">{g.desc}</div>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              {(["email", "sms", "push"] as const).map((ch) => (
                <label key={ch} className="flex items-center gap-2 capitalize">
                  <Switch checked={state[i][ch]} onCheckedChange={(v) => { const next = [...state]; next[i] = { ...next[i], [ch]: v }; setState(next); }} />
                  {ch}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
