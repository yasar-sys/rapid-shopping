import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, User as UserIcon, Phone, MapPin, MessageSquare, Hourglass } from "lucide-react";
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
  const { user } = useAuth();
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pay] = useState("cod");
  const [delivery, setDelivery] = useState<"outside" | "inside">("inside");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  useEffect(() => {
    if (user?.email) setForm((f) => ({ ...f, email: f.email || user.email! }));
  }, [user]);

  // Offer countdown — 15 minutes from page load
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const shipping = delivery === "inside" ? 65 : 110;
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
          Thanks for shopping with Rapid Shopping. We will call you on the number you provided to confirm.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          {user && <Link to="/order/$id" params={{ id: placedId }} className="inline-flex h-11 px-6 items-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold">Track order</Link>}
          <Link to="/" className="inline-flex h-11 px-6 items-center rounded-full border border-border font-semibold">Keep shopping</Link>
        </div>
      </div>
    );
  }

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const guestEmail = form.email?.trim() || `guest+${form.phone.replace(/\D/g, "")}@rapidshopping.shop`;
      const orderNumber = `RS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const { data: order, error } = await supabase.from("orders").insert({
        order_number: orderNumber,
        user_id: user?.id ?? null,
        email: guestEmail,
        phone: form.phone,
        shipping_address: { full_name: form.name, phone: form.phone, address: form.address, delivery_zone: delivery },
        notes: form.notes || null,
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
    <div className="container mx-auto px-4 py-6 max-w-xl">
      <h1 className="text-2xl font-bold text-center text-primary">Place Your Order</h1>
      <p className="text-center text-xs text-muted-foreground mt-1">No account needed — just fill the form below.</p>

      <form onSubmit={place} className="mt-6 space-y-3">
        {/* Contact */}
        <Field icon={<UserIcon className="h-4 w-4" />}>
          <input required placeholder="Your name / আপনার নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-transparent outline-none text-sm" />
        </Field>
        <Field icon={<Phone className="h-4 w-4" />}>
          <input required type="tel" placeholder="Phone number / ফোন নাম্বার" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-transparent outline-none text-sm" />
        </Field>
        <Field icon={<MapPin className="h-4 w-4" />}>
          <input required placeholder="House/flat, road, area, upazila, district" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-transparent outline-none text-sm" />
        </Field>

        {/* Items preview */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-3">
          {items.map((i) => (
            <div key={i.productId} className="flex items-center gap-3">
              <img src={i.image} alt={i.name} className="h-14 w-14 rounded-lg object-cover bg-muted" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-primary line-clamp-2">{i.name}</div>
                <div className="text-xs text-muted-foreground">Qty {i.qty}</div>
              </div>
              <div className="text-sm font-bold text-primary">{formatBDT(i.qty * i.price)}</div>
            </div>
          ))}
        </div>

        {/* Delivery selection */}
        <div className="text-sm font-semibold text-primary pt-2">Select delivery charge…</div>
        <div className="space-y-2">
          <DeliveryOption checked={delivery === "outside"} onSelect={() => setDelivery("outside")} label="Outside Dhaka City / ঢাকা সিটির বাইরে" price={110} />
          <DeliveryOption checked={delivery === "inside"} onSelect={() => setDelivery("inside")} label="Inside Dhaka City / ঢাকা সিটির মধ্যে" price={65} />
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm space-y-1.5">
          <Row label="Subtotal" value={formatBDT(subtotal)} />
          <Row label="Delivery Charge" value={formatBDT(shipping)} />
          <div className="border-t border-primary/20 my-1" />
          <Row label="Total" value={formatBDT(total)} bold />
        </div>

        <Field icon={<MessageSquare className="h-4 w-4" />}>
          <input placeholder="Any note for us? (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-transparent outline-none text-sm" />
        </Field>

        {/* Urgency */}
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-destructive text-xs font-medium">
            <Hourglass className="h-4 w-4" /> Hurry! The offer ends soon
          </div>
          <div className="text-2xl font-bold text-destructive mt-1 tabular-nums">{mm}:{ss}</div>
        </div>

        <button type="submit" disabled={busy} className="w-full h-12 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--shadow-soft)] disabled:opacity-50">
          {busy ? "Placing…" : `Confirm Order — ${formatBDT(total)}`}
        </button>
        <p className="text-[11px] text-center text-muted-foreground">Cash on delivery. We'll call to confirm before shipping.</p>
      </form>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 h-12">
      <span className="h-8 w-8 rounded-full bg-primary/15 text-primary grid place-items-center shrink-0">{icon}</span>
      {children}
    </div>
  );
}

function DeliveryOption({ checked, onSelect, label, price }: { checked: boolean; onSelect: () => void; label: string; price: number }) {
  return (
    <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${checked ? "border-primary bg-primary/10" : "border-primary/30 bg-primary/5 hover:border-primary"}`}>
      <span className={`h-5 w-5 rounded-full border-2 grid place-items-center ${checked ? "border-primary" : "border-primary/40"}`}>
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
      <input type="radio" name="delivery" checked={checked} onChange={onSelect} className="sr-only" />
      <span className="flex-1 text-sm font-medium text-primary">{label}</span>
      <span className="text-sm font-bold text-primary">{price}Tk</span>
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold text-primary" : "text-primary/80"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}