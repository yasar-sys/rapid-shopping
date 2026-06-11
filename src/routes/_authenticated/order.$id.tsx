import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBDT } from "@/lib/format";

const TIMELINE = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"] as const;
const LABEL: Record<string, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const Route = createFileRoute("/_authenticated/order/$id")({
  head: () => ({ meta: [{ title: "Order details — Rapid Shopping" }, { name: "robots", content: "noindex" }] }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  type Order = {
    id: string; order_number: string; status: string; total: number; subtotal: number;
    shipping_fee: number; payment_method: string; payment_status: string;
    shipping_address: { full_name: string; phone: string; street: string; city: string; district: string };
    created_at: string;
  };
  type Item = { id: string; product_name: string; image: string | null; quantity: number; unit_price: number; line_total: number };
  type Event = { id: string; status: string; message: string | null; created_at: string };

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      setOrder(o as Order | null);
      const { data: it } = await supabase.from("order_items").select("*").eq("order_id", id);
      setItems((it ?? []) as Item[]);
      const { data: ev } = await supabase.from("order_events").select("*").eq("order_id", id).order("created_at");
      setEvents((ev ?? []) as Event[]);
    };
    load();

    const ch = supabase.channel(`order-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `id=eq.${id}` }, load)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "order_events", filter: `order_id=eq.${id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  if (!order) return <div className="container mx-auto px-4 py-12">Loading…</div>;

  const currentStep = TIMELINE.indexOf(order.status as typeof TIMELINE[number]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/orders" className="text-sm text-primary hover:underline">← All orders</Link>
      <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
          <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold capitalize">{order.status.replace(/_/g, " ")}</span>
      </div>

      {order.status !== "cancelled" && order.status !== "refunded" && (
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-5">Tracking</h2>
          <div className="flex items-start justify-between gap-2">
            {TIMELINE.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center text-center">
                <div className={`h-10 w-10 rounded-full grid place-items-center ${i <= currentStep ? "bg-[image:var(--gradient-primary)] text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i <= currentStep ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </div>
                <div className={`mt-2 text-[10px] sm:text-xs ${i <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"}`}>{LABEL[step]}</div>
                {i < TIMELINE.length - 1 && (
                  <div className={`absolute h-0.5 ${i < currentStep ? "bg-primary" : "bg-muted"}`} style={{ display: "none" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Package className="h-4 w-4" /> Items ({items.length})</h2>
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3">
                  {i.image && <img src={i.image} alt={i.product_name} className="h-14 w-14 rounded-md object-cover bg-muted" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-1">{i.product_name}</div>
                    <div className="text-xs text-muted-foreground">{i.quantity} × {formatBDT(i.unit_price)}</div>
                  </div>
                  <div className="font-medium">{formatBDT(i.line_total)}</div>
                </div>
              ))}
            </div>
          </div>

          {events.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold mb-3">Updates</h2>
              <ol className="space-y-2 text-sm">
                {events.map((e) => (
                  <li key={e.id} className="flex gap-3">
                    <div className="text-xs text-muted-foreground w-32 shrink-0">{new Date(e.created_at).toLocaleString()}</div>
                    <div><span className="capitalize font-medium">{e.status.replace(/_/g, " ")}</span>{e.message && <span className="text-muted-foreground"> — {e.message}</span>}</div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 text-sm space-y-1.5">
            <h2 className="font-semibold mb-2">Summary</h2>
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shipping_fee === 0 ? "Free" : formatBDT(order.shipping_fee)}</span></div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border mt-2"><span>Total</span><span>{formatBDT(order.total)}</span></div>
            <div className="pt-3 mt-3 border-t border-border text-xs text-muted-foreground">
              Payment: <span className="uppercase font-medium text-foreground">{order.payment_method}</span> — {order.payment_status}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-sm">
            <h2 className="font-semibold mb-2">Ship to</h2>
            <div className="font-medium">{order.shipping_address.full_name}</div>
            <div className="text-muted-foreground">{order.shipping_address.phone}</div>
            <div className="text-muted-foreground mt-1">{order.shipping_address.street}<br />{order.shipping_address.city}, {order.shipping_address.district}</div>
          </div>
        </div>
      </div>
    </div>
  );
}