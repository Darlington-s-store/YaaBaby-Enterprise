import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Payment = () => (
  <div className="space-y-6 max-w-6xl">
    <h2 className="font-display text-2xl font-bold">Payment methods</h2>

    <div className="bg-card border rounded-2xl p-12 text-center">
      <div className="size-14 rounded-2xl bg-primary/10 grid place-items-center mx-auto mb-4">
        <CreditCard className="size-7 text-primary" />
      </div>
      <h3 className="font-display text-lg font-bold mb-1">No saved payment methods</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        We use Paystack (cards & MoMo) at checkout. Your payment details are never stored on our servers.
      </p>
      <Button asChild className="rounded-full"><Link to="/shop">Browse products</Link></Button>
    </div>

    <div className="bg-muted/50 rounded-2xl p-5 text-sm text-muted-foreground">
      🔒 Your payment information is encrypted and processed securely via Paystack and MTN Mobile Money. We never store full card details.
    </div>
  </div>
);

export default Payment;
