import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
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
  const { user, loading } = useAuth();
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState("cod");
  const [form, setForm] = useState({ name: "", phone: "", email: "", street: "", city: "", district: "" });

  useEffect(() => {
    if (user?.email) setForm((f) => ({ ...f, email: f.email || user.email! }));
  }, [user]);

  useEffect(() => {
    if (!loading && !user && items.length > 0) {
      toast.info("Please sign in to place your order");
      navigate({ to: "/auth" });
    }
  }, [loading, user, items.length, navigate]);

  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 80;
  const total = subtotal + shipping;

  if (items.length === 0 && !placedId) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link to="/" className="text-primary underline">Continue shopping</Link>
      </div>
    );
  }

  if (placedId) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="mx-auto h-16 w-16 rounded-full bg-[color:var(--color-success)]/15 grid place-items-center">
          <CheckCircle2 className="h-9 w-9 text-[color:var(--color-success)]" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Order placed!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks for shopping with Rapid Shopping. Track your delivery in real time below.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/order/$id" params={{ id: placedId }} className="inline-flex h-11 px-6 items-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold">Track order</Link>
          <Link to="/" className="inline-flex h-11 px-6 items-center rounded-full border border-border font-semibold">Keep shopping</Link>
        </div>
      </div>
    );
  }

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const orderNumber = `RS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const { data: order, error } = await supabase.from("orders").insert({
        order_number: orderNumber,
        user_id: user.id,
        email: form.email,
        phone: form.phone,
        shipping_address: { full_name: form.name, phone: form.phone, street: form.street, city: form.city, district: form.district },
        subtotal,
        shipping_fee: shipping,
        total,
        payment_method: pay,
        payment_status: "unpaid",
        status: "pending",
      }).select("id").single();
      if (error || !order) throw error ?? new Error("Failed");

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.productId,
          product_name: i.name,
          image: i.image,
          unit_price: i.price,
          quantity: i.qty,
          line_total: i.price * i.qty,
        }))
      );
      if (itemsErr) throw itemsErr;

      toast.success("Order placed!");
      clear();
      setPlacedId(order.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <form onSubmit={place} className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
              <input required type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary sm:col-span-2" />
              <input required placeholder="Street address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary sm:col-span-2" />
              <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
              <input required placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
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
                <label key={id} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${pay === id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"} ${id !== "cod" ? "opacity-60" : ""}`}>
                  <input type="radio" name="pay" value={id} checked={pay === id} disabled={id !== "cod"} onChange={() => setPay(id)} className="mt-1 accent-[var(--color-primary)]" />
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
          <button type="submit" disabled={busy} className="mt-5 w-full h-12 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--shadow-soft)] disabled:opacity-50">
            {busy ? "Placing…" : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}