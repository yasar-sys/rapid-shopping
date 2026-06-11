import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBDT } from "@/lib/format";

interface OrderRow {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My Orders — Rapid Shopping" }, { name: "robots", content: "noindex" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("orders").select("id, order_number, total, status, payment_status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setOrders((data ?? []) as OrderRow[]); setLoading(false); });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold">My Orders</h1>
      {loading ? (
        <div className="mt-8 text-muted-foreground">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="mt-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="mt-3 text-muted-foreground">No orders yet</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Start shopping →</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <Link key={o.id} to="/order/$id" params={{ id: o.id }} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary transition">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{o.order_number}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                o.status === "delivered" ? "bg-[color:var(--color-success)]/15 text-[color:var(--color-success)]" :
                o.status === "cancelled" ? "bg-destructive/15 text-destructive" :
                "bg-primary/10 text-primary"
              }`}>{o.status}</span>
              <div className="font-bold">{formatBDT(o.total)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}