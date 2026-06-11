import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Admin · Products" }, { name: "robots", content: "noindex" }] }),
  component: AdminProducts,
});

interface Row {
  id: string; product_id: string; name: string; slug: string; brand: string | null;
  category_slug: string; price: number; discount_price: number | null; stock: number;
  images: string[]; description: string | null; is_featured: boolean | null; is_new: boolean | null; is_flash_sale: boolean | null;
}

const blank = (): Partial<Row> => ({
  product_id: "", name: "", slug: "", brand: "", category_slug: "electronics",
  price: 0, discount_price: null, stock: 1, images: [], description: "",
  is_featured: false, is_new: true, is_flash_sale: false,
});

function AdminProducts() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [imagesText, setImagesText] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (r?: Row) => {
    const v = r ?? blank();
    setEditing(v);
    setImagesText((v.images ?? []).join("\n"));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const payload = {
      ...editing,
      slug: editing.slug || (editing.name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      images: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
      price: Number(editing.price ?? 0),
      discount_price: editing.discount_price ? Number(editing.discount_price) : null,
      stock: Number(editing.stock ?? 0),
    } as Row;
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  };

  const filtered = rows.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.product_id.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="h-10 px-3 rounded-md border border-border outline-none focus:border-primary flex-1 min-w-[200px]" />
        <button onClick={() => startEdit()} className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold">
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{r.product_id}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3 capitalize">{r.category_slug}</td>
                <td className="p-3">{formatBDT(r.discount_price ?? r.price)}</td>
                <td className="p-3">{r.stock}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(r)} className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(r.id)} className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-auto" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl w-full max-w-2xl p-6 space-y-3 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing.id ? "Edit product" : "New product"}</h2>
              <button type="button" onClick={() => setEditing(null)} className="h-8 w-8 grid place-items-center rounded hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required placeholder="Product ID (e.g. RS-ELEC-1099)" value={editing.product_id ?? ""} onChange={(e) => setEditing({ ...editing, product_id: e.target.value })} className="h-10 px-3 rounded-md border border-border" />
              <input placeholder="Brand" value={editing.brand ?? ""} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} className="h-10 px-3 rounded-md border border-border" />
              <input required placeholder="Name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="h-10 px-3 rounded-md border border-border sm:col-span-2" />
              <input placeholder="Slug (auto if empty)" value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="h-10 px-3 rounded-md border border-border" />
              <select value={editing.category_slug ?? "electronics"} onChange={(e) => setEditing({ ...editing, category_slug: e.target.value })} className="h-10 px-3 rounded-md border border-border">
                <option value="electronics">Electronics</option>
                <option value="gadgets">Gadgets</option>
                <option value="appliances">Home Appliances</option>
                <option value="cookery">Kitchen & Cookery</option>
              </select>
              <input required type="number" min={0} step="0.01" placeholder="Price (BDT)" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="h-10 px-3 rounded-md border border-border" />
              <input type="number" min={0} step="0.01" placeholder="Discount price (optional)" value={editing.discount_price ?? ""} onChange={(e) => setEditing({ ...editing, discount_price: e.target.value ? Number(e.target.value) : null })} className="h-10 px-3 rounded-md border border-border" />
              <input required type="number" min={0} placeholder="Stock" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className="h-10 px-3 rounded-md border border-border" />
            </div>
            <textarea placeholder="Description" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full p-3 rounded-md border border-border min-h-[100px]" />
            <textarea placeholder="Image URLs (one per line)" value={imagesText} onChange={(e) => setImagesText(e.target.value)} className="w-full p-3 rounded-md border border-border min-h-[80px] font-mono text-xs" />
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Featured</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.is_new} onChange={(e) => setEditing({ ...editing, is_new: e.target.checked })} /> New</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.is_flash_sale} onChange={(e) => setEditing({ ...editing, is_flash_sale: e.target.checked })} /> Flash sale</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="h-10 px-4 rounded-full border border-border">Cancel</button>
              <button type="submit" className="h-10 px-5 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}