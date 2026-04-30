import { useState, useMemo } from "react";
import { 
  Star, Search, MessageSquare, 
  CheckCircle2, XCircle, Trash2, Flag,
  Reply, MoreVertical, ImageIcon
} from "lucide-react";
import { useReviews, Review } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/useCart";

const StatusBadge = ({ status }: { status: Review["status"] }) => {
  const styles = {
    approved: "bg-emerald/10 text-emerald-700 border-emerald/20",
    pending: "bg-gold/10 text-gold-darker border-gold/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-2", styles[status])}>
      {status}
    </Badge>
  );
};

const AdminReviews = () => {
  const { reviews, setStatus, reply, toggleFlag, remove } = useReviews();
  const admin = useAuth((s) => s.user);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesSearch = r.userName.toLowerCase().includes(search.toLowerCase()) || 
                           r.title.toLowerCase().includes(search.toLowerCase()) ||
                           r.body.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "all" || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reviews, search, filterStatus]);

  const handleReply = () => {
    if (!replyReviewId || !replyText.trim() || !admin) return;
    reply(replyReviewId, replyText, admin.name);
    toast.success("Reply posted successfully");
    setReplyReviewId(null);
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Reviews & Ratings</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage customer feedback, moderate content, and build trust.</p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border w-full max-w-sm">
            <Search className="size-4 text-muted-foreground" />
            <input 
              placeholder="Search reviewer or content..." 
              className="bg-transparent border-none outline-none text-sm flex-1"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-full overflow-hidden">
              {["all", "pending", "approved", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold capitalize transition-all",
                    filterStatus === s ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y">
          {filteredReviews.map((r) => (
            <div key={r.id} className={cn("p-6 hover:bg-muted/5 transition-all group", r.flagged && "bg-destructive/5")}>
              <div className="flex gap-6">
                <div className="flex-shrink-0 text-center space-y-2">
                  <div className="size-12 rounded-2xl bg-emerald-gold grid place-items-center text-primary-foreground font-bold text-lg shadow-sm">
                    {r.userName[0]?.toUpperCase()}
                  </div>
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="text-sm font-bold">{r.rating}</span>
                    <Star className="size-3 fill-gold text-gold" />
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold">{r.userName}</h4>
                        <StatusBadge status={r.status} />
                        {r.flagged && <Badge variant="destructive" className="text-[9px] h-4">Flagged</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {format(new Date(r.createdAt), "MMM d, yyyy · h:mm a")} · Product ID: {r.productId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {r.status === "pending" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-full h-8 px-3 text-emerald-700 border-emerald/20 hover:bg-emerald/5"
                            onClick={() => { setStatus(r.id, "approved"); toast.success("Review approved"); }}
                          >
                            <CheckCircle2 className="size-3.5 mr-1.5" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-full h-8 px-3 text-destructive border-destructive/20 hover:bg-destructive/5"
                            onClick={() => { setStatus(r.id, "rejected"); toast.error("Review rejected"); }}
                          >
                            <XCircle className="size-3.5 mr-1.5" /> Reject
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => setReplyReviewId(r.id)}>
                            <Reply className="size-4 mr-2" /> Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFlag(r.id)} className="text-gold-darker">
                            <Flag className="size-4 mr-2" /> {r.flagged ? "Unflag" : "Flag as Inappropriate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => remove(r.id)} className="text-destructive">
                            <Trash2 className="size-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-bold text-sm leading-tight">{r.title}</p>
                    <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">{r.body}</p>
                  </div>

                  {r.images && r.images.length > 0 && (
                    <div className="flex gap-2 py-2">
                      {r.images.map((img, idx) => (
                        <div key={idx} className="relative size-16 rounded-xl overflow-hidden border group/img">
                          <img src={img} alt="Review" className="size-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity grid place-items-center">
                            <ImageIcon className="size-4 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {r.reply && (
                    <div className="mt-4 p-4 rounded-2xl bg-muted/40 border border-muted-foreground/10 relative">
                      <div className="absolute -top-2 left-6 px-2 bg-background text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                        <MessageSquare className="size-3" /> Official Reply
                      </div>
                      <p className="text-sm text-foreground/70 italic">"{r.reply.text}"</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-bold text-primary">{r.reply.adminName} (Admin)</span>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(r.reply.date), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="p-20 text-center text-muted-foreground">
              <MessageSquare className="size-12 mx-auto opacity-10 mb-4" />
              <p className="font-medium">No reviews found matching your filters.</p>
              <Button variant="link" onClick={() => { setSearch(""); setFilterStatus("all"); }}>Clear all filters</Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!replyReviewId} onOpenChange={(o) => !o && setReplyReviewId(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="size-5 text-primary" /> Reply to Review
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-muted/30 border text-xs text-muted-foreground italic">
              {reviews.find(r => r.id === replyReviewId)?.body}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold">Your Response</p>
              <Textarea 
                placeholder="Type your official reply here..." 
                className="min-h-[120px] rounded-2xl"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyReviewId(null)} className="rounded-full">Cancel</Button>
            <Button onClick={handleReply} className="rounded-full px-8">Post Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
