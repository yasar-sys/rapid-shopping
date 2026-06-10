import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Rapid Shopping" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);
  const [pay, setPay] = useState("cod");

  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 80;
  const total = subtotal + shipping;

  if (items.length === 0 && !placed) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link to="/" className="text-primary underline">Continue shopping</Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="mx-auto h-16 w-16 rounded-full bg-[color:var(--color-success)]/15 grid place-items-center">
          <CheckCircle2 className="h-9 w-9 text-[color:var(--color-success)]" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Order placed!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks for shopping with Rapid Shopping. Once we wire up payments and accounts, you'll see live tracking right here.
        </p>
        <button onClick={() => navigate({ to: "/" })} className="mt-6 inline-flex h-11 px-6 items-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold">
          Back to home
        </button>
      </div>
    );
  }

  const place = (e: React.FormEvent) => {
    e.preventDefault();
    clear();
    setPlaced(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <form onSubmit={place} className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required placeholder="Full name" className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
              <input required type="tel" placeholder="Phone" className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
              <input required type="email" placeholder="Email" className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary sm:col-span-2" />
              <input required placeholder="Street address" className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary sm:col-span-2" />
              <input required placeholder="City" className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
              <input required placeholder="District" className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <div className="space-y-2">
              {[
                ["cod", "Cash on Delivery", "Pay when you receive your order"],
                ["card", "Card (Stripe)", "Coming soon — secure card payments"],
                ["bkash", "bKash", "Coming soon"],
                ["nagad", "Nagad", "Coming soon"],
              ].map(([id, t, s]) => (
                <label key={id} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${pay === id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  <input type="radio" name="pay" value={id} checked={pay === id} onChange={() => setPay(id)} className="mt-1 accent-[var(--color-primary)]" />
                  <div>
                    <div className="font-medium text-foreground text-sm">{t}</div>
                    <div className="text-xs text-muted-foreground">{s}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="rounded-xl border border-border bg-card p-6 h-fit sticky top-24 shadow-[var(--shadow-card)]">
          <h2 className="font-semibold text-lg">Order Summary</h2>
          <div className="mt-4 space-y-3 max-h-64 overflow-auto">
            {items.map((i) => (
              <div key={i.productId} className="flex gap-3 text-sm">
                <img src={i.image} alt={i.name} width={48} height={48} className="h-12 w-12 rounded-md object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium line-clamp-1">{i.name}</div>
                  <div className="text-xs text-muted-foreground">Qty {i.qty}</div>
                </div>
                <div className="font-medium">{formatBDT(i.qty * i.price)}</div>
              </div>
            ))}
          </div>
          <div className="my-4 border-t border-border" />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBDT(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatBDT(shipping)}</span></div>
          </div>
          <div className="mt-3 pt-3 border-t border-border flex justify-between text-lg font-bold"><span>Total</span><span>{formatBDT(total)}</span></div>
          <button type="submit" className="mt-5 w-full h-12 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--shadow-soft)]">
            Place Order
          </button>
        </aside>
      </form>
    </div>
  );
}