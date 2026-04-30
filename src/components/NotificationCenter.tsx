import { Bell, ShoppingBag, CreditCard, Truck, CheckCircle2, XCircle, Wallet, Flame, Package, Gift, Trophy, Image as ImageIcon, User, AlertTriangle, Zap, Check } from "lucide-react";
import { useNotifications, Notification, NotificationType } from "@/store/useNotifications";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case "account": return <User className="size-4 text-blue-500" />;
    case "order": return <ShoppingBag className="size-4 text-orange-500" />;
    case "payment": return <CreditCard className="size-4 text-emerald-500" />;
    case "sale": return <Flame className="size-4 text-red-500" />;
    case "stock": return <Package className="size-4 text-amber-500" />;
    case "promo": return <Gift className="size-4 text-purple-500" />;
    case "loyalty": return <Trophy className="size-4 text-gold" />;
    case "search": return <ImageIcon className="size-4 text-teal-500" />;
    case "admin_alert": return <AlertTriangle className="size-4 text-destructive" />;
    default: return <Bell className="size-4 text-muted-foreground" />;
  }
};

export const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const count = unreadCount();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="size-5" />
          {count > 0 && (
            <span className="absolute top-1.5 right-1.5 size-4 bg-destructive text-white text-[10px] font-bold rounded-full grid place-items-center ring-2 ring-background">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 rounded-2xl p-0 shadow-2xl overflow-hidden">
        <div className="p-4 bg-muted/30 flex items-center justify-between">
          <DropdownMenuLabel className="font-display text-base font-bold">Notifications</DropdownMenuLabel>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider" onClick={markAllAsRead}>Mark all read</Button>
            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider text-destructive hover:text-destructive" onClick={clearAll}>Clear</Button>
          </div>
        </div>
        <DropdownMenuSeparator className="m-0" />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="size-12 rounded-full bg-muted grid place-items-center mx-auto mb-3">
                <Bell className="size-6 text-muted-foreground opacity-50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">All caught up! No new notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  to={n.link || "#"}
                  className={cn(
                    "flex gap-4 p-4 transition-colors hover:bg-muted/50",
                    !n.isRead && "bg-primary/5"
                  )}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    !n.isRead ? "bg-background border-2 border-primary/20" : "bg-muted"
                  )}>
                    <NotificationIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-sm font-bold truncate", !n.isRead ? "text-foreground" : "text-foreground/70")}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">
                        {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    {!n.isRead && (
                      <div className="size-1.5 rounded-full bg-primary mt-2" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-muted-foreground" asChild>
                <Link to="/account/notifications">View all history</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
