import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({ meta: [{ title: "Admin · Categories" }, { name: "robots", content: "noindex" }] }),
  component: AdminCategories,
});

interface Cat { id: string; name: string; slug: string; parent_slug: string | null; icon: string | null; sort_order: number }

function AdminCategories() {
  const [rows, setRows] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setRows((data ?? []) as Cat[]);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { error } = await supabase.from("categories").insert({ name, slug: finalSlug });
    if (error) return toast.error(error.message);
    setName(""); setSlug(""); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={add} className="flex gap-2 mb-4 flex-wrap">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="h-10 px-3 rounded-md border border-border flex-1 min-w-[150px]" />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (auto)" className="h-10 px-3 rounded-md border border-border w-40" />
        <button className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold"><Plus className="h-4 w-4" /> Add</button>
      </form>
      <ul className="rounded-xl border border-border divide-y divide-border">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-3">
            <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground font-mono">{c.slug}</div></div>
            <button onClick={() => remove(c.id)} className="h-8 w-8 grid place-items-center rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}