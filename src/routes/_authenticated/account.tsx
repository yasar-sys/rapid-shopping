import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, MapPin, Package, User as UserIcon, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "My Account — Rapid Shopping" }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      setName(data?.display_name ?? "");
      setPhone(data?.phone ?? "");
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: name, phone });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  const doSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold">My Account</h1>
      <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/account" className="rounded-xl border border-primary bg-primary/5 p-4 flex items-center gap-3">
          <UserIcon className="h-5 w-5 text-primary" /><span className="font-medium">Profile</span>
        </Link>
        <Link to="/orders" className="rounded-xl border border-border p-4 flex items-center gap-3 hover:border-primary transition">
          <Package className="h-5 w-5 text-primary" /><span className="font-medium">My Orders</span>
        </Link>
        <div className="rounded-xl border border-border p-4 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" /><span className="font-medium">Addresses</span>
        </div>
        {isAdmin && (
          <Link to="/admin" className="rounded-xl border border-accent bg-accent/10 p-4 flex items-center gap-3 hover:bg-accent/20 transition">
            <ShieldCheck className="h-5 w-5 text-secondary" /><span className="font-medium">Admin Panel</span>
          </Link>
        )}
      </div>

      <form onSubmit={save} className="mt-8 rounded-xl border border-border bg-card p-6 max-w-md space-y-3">
        <h2 className="font-semibold text-lg">Profile</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
        <button disabled={saving} className="h-11 px-5 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold disabled:opacity-50">
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>

      <button onClick={doSignOut} className="mt-8 inline-flex items-center gap-2 text-sm text-destructive hover:underline">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}