import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Package, ShoppingBag, Tags } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/account" });
  },
  head: () => ({ meta: [{ title: "Admin — Rapid Shopping" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav: Array<[string, string, typeof LayoutGrid]> = [
    ["/admin", "Overview", LayoutGrid],
    ["/admin/products", "Products", Package],
    ["/admin/orders", "Orders", ShoppingBag],
    ["/admin/categories", "Categories", Tags],
  ];
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link to="/" className="text-sm text-primary hover:underline">View storefront →</Link>
      </div>
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2 border-b border-border">
        {nav.map(([to, label, Icon]) => {
          const active = path === to || (to !== "/admin" && path.startsWith(to));
          return (
            <Link key={to} to={to} className={`inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm font-medium whitespace-nowrap transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          );
        })}
      </div>
      {path === "/admin" ? <AdminOverview /> : <Outlet />}
    </div>
  );
}

import { useEffect, useState } from "react";
function AdminOverview() {
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0, revenue: 0 });
  useEffect(() => {
    const load = async () => {
      const [{ count: products }, { count: orders }, { count: pending }, { data: paid }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("total").eq("payment_status", "paid"),
      ]);
      const revenue = (paid ?? []).reduce((s, r) => s + Number(r.total), 0);
      setStats({ products: products ?? 0, orders: orders ?? 0, pending: pending ?? 0, revenue });
    };
    load();
  }, []);
  const cards = [
    ["Products", stats.products, "bg-primary/10 text-primary"],
    ["Total orders", stats.orders, "bg-accent/15 text-secondary"],
    ["Pending", stats.pending, "bg-destructive/10 text-destructive"],
    ["Revenue (paid)", `৳${stats.revenue.toLocaleString()}`, "bg-[color:var(--color-success)]/15 text-[color:var(--color-success)]"],
  ] as const;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(([label, value, cls]) => (
        <div key={label} className="rounded-xl border border-border bg-card p-5">
          <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</div>
          <div className="mt-3 text-3xl font-bold">{value}</div>
        </div>
      ))}
    </div>
  );
}