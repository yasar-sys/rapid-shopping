import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Link } from "@tanstack/react-router";

interface Review { id: string; rating: number; title: string | null; body: string | null; user_id: string; created_at: string }

export function Reviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [list, setList] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("reviews").select("*").eq("product_id", productId).order("created_at", { ascending: false });
    setList((data ?? []) as Review[]);
  };
  useEffect(() => { load(); }, [productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("reviews").upsert({ product_id: productId, user_id: user.id, rating, title, body }, { onConflict: "product_id,user_id" });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Review posted"); setTitle(""); setBody(""); load(); }
  };

  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Reviews ({list.length})</h2>
        {list.length > 0 && (
          <div className="flex items-center gap-1"><Star className="h-5 w-5 fill-accent text-accent" /><span className="font-semibold">{avg.toFixed(1)}</span><span className="text-sm text-muted-foreground">average</span></div>
        )}
      </div>

      {user ? (
        <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 mb-6 space-y-3">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className={`h-6 w-6 ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline (optional)" className="w-full h-10 px-3 rounded-md border border-border" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your thoughts…" className="w-full p-3 rounded-md border border-border min-h-[80px]" />
          <button disabled={busy} className="h-10 px-5 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold disabled:opacity-50">{busy ? "Posting…" : "Post review"}</button>
        </form>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-5 mb-6 text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to leave a review.
        </div>
      )}

      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
              ))}
              <span className="text-xs text-muted-foreground ml-2">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            {r.title && <div className="font-semibold text-sm">{r.title}</div>}
            {r.body && <p className="text-sm text-muted-foreground mt-1">{r.body}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}