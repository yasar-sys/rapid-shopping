import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { productsQuery } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  loaderDeps: ({ search }) => ({ q: search.q ?? "" }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
  head: () => ({
    meta: [
      { title: "Search — Rapid Shopping" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQuery());
  const term = q.toLowerCase().trim();
  const results = term
    ? products.filter((p) =>
        [p.name, p.brand, p.product_id, p.category_slug, ...(p.tags ?? [])]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(term)),
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Search results</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {term ? <>Showing {results.length} results for <span className="text-foreground font-medium">"{q}"</span></> : "Type something in the search bar above."}
      </p>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {term && results.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">No products matched your search.</div>
      )}
    </div>
  );
}