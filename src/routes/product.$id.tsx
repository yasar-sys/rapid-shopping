import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, Heart, Share2, ShieldCheck, Truck, Star, Plus, Minus } from "lucide-react";
import { discountPct, effectivePrice, productByIdQuery, productsQuery, resolveImage } from "@/lib/products";
import { formatBDT } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(productByIdQuery(params.id));
    if (!p) throw notFound();
    await context.queryClient.ensureQueryData(productsQuery());
    return { p };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.p;
    if (!p) return { meta: [{ title: "Product — Rapid Shopping" }] };
    const price = effectivePrice(p);
    return {
      meta: [
        { title: `${p.name} — Rapid Shopping` },
        { name: "description", content: (p.description ?? p.name).slice(0, 155) },
        { property: "og:title", content: p.name },
        { property: "og:description", content: (p.description ?? "").slice(0, 200) },
        { property: "og:type", content: "product" },
        { property: "product:price:amount", content: String(price) },
        { property: "product:price:currency", content: "BDT" },
      ],
      links: [{ rel: "canonical", href: `/product/${p.product_id.toLowerCase()}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          sku: p.product_id,
          brand: { "@type": "Brand", name: p.brand },
          description: p.description,
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: "BDT",
            availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.rating,
            reviewCount: p.reviews_count,
          },
        }),
      }],
    };
  },
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link to="/" className="text-primary underline">Back home</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-20 text-center text-destructive">{error.message}</div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: p } = useSuspenseQuery(productByIdQuery(id));
  const { data: all } = useSuspenseQuery(productsQuery());
  const cart = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  if (!p) return null;

  const price = effectivePrice(p);
  const off = discountPct(p);
  const img = resolveImage(p.images[0] ?? "");
  const related = all.filter((x) => x.category_slug === p.category_slug && x.id !== p.id).slice(0, 4);

  const handleAdd = () => {
    cart.add({ productId: p.product_id, name: p.name, image: img, price }, qty);
  };
  const buyNow = () => {
    handleAdd();
    navigate({ to: "/checkout" });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/category/$slug" params={{ slug: p.category_slug }} className="hover:text-primary capitalize">
          {p.category_slug}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium line-clamp-1">{p.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square rounded-2xl bg-muted overflow-hidden border border-border">
            <img src={img} alt={p.name} width={800} height={800} className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <div className="text-xs text-primary font-semibold uppercase tracking-wider">{p.brand}</div>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold text-foreground">{p.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-medium">{p.rating?.toFixed(1)}</span>
              <span className="text-muted-foreground">({p.reviews_count} reviews)</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">SKU: {p.product_id}</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">{formatBDT(price)}</span>
            {p.discount_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatBDT(p.price)}</span>
                <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive text-xs font-bold">-{off}%</span>
              </>
            )}
          </div>
          <div className="mt-1 text-sm">
            {p.stock > 0 ? (
              <span className="text-[color:var(--color-success)] font-medium">● In stock ({p.stock} available)</span>
            ) : (
              <span className="text-destructive font-medium">● Out of stock</span>
            )}
          </div>

          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">{p.description}</p>

          {p.specs && Object.keys(p.specs).length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Key Specs</div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                {Object.entries(p.specs).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="text-muted-foreground">{k}:</dt>
                    <dd className="font-medium text-foreground">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-border overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11 grid place-items-center hover:bg-muted" aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="h-11 w-11 grid place-items-center hover:bg-muted" aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button className="h-11 w-11 grid place-items-center rounded-full border border-border hover:border-primary hover:text-primary" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </button>
            <button className="h-11 w-11 grid place-items-center rounded-full border border-border hover:border-primary hover:text-primary" aria-label="Share">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleAdd}
              disabled={p.stock === 0}
              className="h-12 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary/5 disabled:opacity-50 transition"
            >
              Add to Cart
            </button>
            <button
              onClick={buyNow}
              disabled={p.stock === 0}
              className="h-12 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--shadow-soft)] disabled:opacity-50 hover:scale-[1.01] transition"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-lg border border-border p-3">
              <Truck className="h-4 w-4 text-primary" />
              <span>Fast delivery 1–3 days</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border p-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>{p.warranty ?? "Official warranty"}</span>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((rp) => <ProductCard key={rp.id} p={rp} />)}
          </div>
        </section>
      )}
    </div>
  );
}