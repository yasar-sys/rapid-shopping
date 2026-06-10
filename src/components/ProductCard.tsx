import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { discountPct, effectivePrice, resolveImage, type Product } from "@/lib/products";
import { formatBDT } from "@/lib/format";

export function ProductCard({ p }: { p: Product }) {
  const off = discountPct(p);
  return (
    <Link
      to="/product/$id"
      params={{ id: p.product_id.toLowerCase() }}
      className="group block rounded-xl bg-card border border-border overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={resolveImage(p.images[0] ?? "")}
          alt={p.name}
          loading="lazy"
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {off > 0 && (
          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[11px] font-bold px-2 py-0.5 rounded">
            -{off}%
          </span>
        )}
        {p.is_new && (
          <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-[11px] font-bold px-2 py-0.5 rounded">
            NEW
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{p.brand}</div>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {p.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-bold text-foreground">{formatBDT(effectivePrice(p))}</span>
          {p.discount_price && (
            <span className="text-xs text-muted-foreground line-through">{formatBDT(p.price)}</span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="font-medium text-foreground">{p.rating?.toFixed(1)}</span>
          <span>({p.reviews_count})</span>
        </div>
      </div>
    </Link>
  );
}