import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { categoriesQuery, productsQuery } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQuery()),
      context.queryClient.ensureQueryData(categoriesQuery()),
    ]).then(([products, cats]) => {
      const cat = cats.find((c) => c.slug === params.slug);
      if (!cat) throw notFound();
      return { cat };
    }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.cat.name ?? "Category"} — Rapid Shopping` },
      { name: "description", content: `Shop ${loaderData?.cat.name ?? ""} at the best prices in Bangladesh.` },
      { property: "og:title", content: `${loaderData?.cat.name ?? "Category"} — Rapid Shopping` },
      { property: "og:description", content: `Shop ${loaderData?.cat.name ?? ""} at Rapid Shopping.` },
    ],
    links: [{ rel: "canonical", href: `/category/${loaderData?.cat.slug}` }],
  }),
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Category not found</h1>
      <Link to="/" className="text-primary underline">Back home</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-20 text-center text-destructive">{error.message}</div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: products } = useSuspenseQuery(productsQuery());
  const { data: cats } = useSuspenseQuery(categoriesQuery());

  const cat = cats.find((c) => c.slug === slug)!;
  const children = cats.filter((c) => c.parent_slug === slug);
  const list = products.filter(
    (p) => p.category_slug === slug || p.subcategory_slug === slug,
  );
  const parent = cat.parent_slug ? cats.find((c) => c.slug === cat.parent_slug) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" />
        {parent && (
          <>
            <Link to="/category/$slug" params={{ slug: parent.slug }} className="hover:text-primary">{parent.name}</Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground font-medium">{cat.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-foreground">{cat.name}</h1>
      <p className="text-sm text-muted-foreground mt-1">{list.length} products available</p>

      {children.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {children.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="px-4 py-1.5 rounded-full text-sm bg-muted hover:bg-primary hover:text-primary-foreground transition"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {list.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">No products yet in this category.</div>
      )}
    </div>
  );
}