import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { productsQuery, categoriesQuery } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "All Products — Rapid Shopping" },
      { name: "description", content: "Browse every product available on Rapid Shopping — kitchen gadgets, electronics and home essentials with cash on delivery across Bangladesh." },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(productsQuery()),
    context.queryClient.ensureQueryData(categoriesQuery()),
  ]),
  component: AllProducts,
});

function AllProducts() {
  const { data: products } = useSuspenseQuery(productsQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const [cat, setCat] = useState<string>("");
  const filtered = cat ? products.filter((p) => p.category_slug === cat || p.subcategory_slug === cat) : products;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} item{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCat("")} className={`px-3 h-9 rounded-full text-xs font-medium border transition ${cat === "" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>All</button>
          {categories.map((c) => (
            <button key={c.slug} onClick={() => setCat(c.slug)} className={`px-3 h-9 rounded-full text-xs font-medium border transition ${cat === c.slug ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>{c.name}</button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          No products in this category yet. <Link to="/products" className="text-primary underline">Show all</Link>
        </div>
      )}
    </div>
  );
}