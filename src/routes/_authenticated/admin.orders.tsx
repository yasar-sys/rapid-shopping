import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "Admin · Orders" }, { name: "robots", content: "noindex" }] }),
  component: AdminOrders,
});

const STATUSES = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"] as const;

interface Row { id: string; order_number: string; email: string; status: string; payment_status: string; total: number; created_at: string }

function AdminOrders() {
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const { data } = await supabase.from("orders").select("id, order_number, email, status, payment_status, total, created_at").order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("order_events").insert({ order_id: id, status, message: `Status changed to ${status}` });
    toast.success("Updated");
    load();
  };

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left">
          <tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="p-3 font-mono text-xs">{r.order_number}</td>
              <td className="p-3">{r.email}</td>
              <td className="p-3 font-medium">{formatBDT(r.total)}</td>
              <td className="p-3 capitalize">{r.payment_status}</td>
              <td className="p-3">
                <select value={r.status} onChange={(e) => update(r.id, e.target.value)} className="h-9 px-2 rounded border border-border bg-card">
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </td>
              <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}