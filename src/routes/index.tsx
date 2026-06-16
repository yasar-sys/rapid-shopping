import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, Smartphone, Laptop, Watch, Headphones, Gamepad2, BatteryCharging, ChefHat, Blend, Truck, ShieldCheck, Headset } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { categoriesQuery, productsQuery, effectivePrice } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rapid Shopping — Electronics, Gadgets & Kitchen in Bangladesh" },
      { name: "description", content: "Shop top smartphones, laptops, smartwatches, gaming gear and kitchen appliances. Fast nationwide delivery, secure payments, genuine warranty." },
      { property: "og:title", content: "Rapid Shopping" },
      { property: "og:description", content: "Premium electronics and home essentials delivered fast across Bangladesh." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(productsQuery()),
    context.queryClient.ensureQueryData(categoriesQuery()),
  ]),
  component: Index,
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone, Laptop, Watch, Headphones, Gamepad2, BatteryCharging, ChefHat, Blend,
};

function Index() {
  const { data: products } = useSuspenseQuery(productsQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());

  const featuredAll = products.filter((p) => p.is_featured);
  const featured = featuredAll.length ? featuredAll : products;
  const flash = products.filter((p) => p.is_flash_sale);
  const newArrivals = products.filter((p) => p.is_new);
  const allCats = categories;

  // Rotating product spotlight inside the hero "window"
  const rotatePool = products.slice(0, 12);
  const [spotIdx, setSpotIdx] = useState(0);
  useEffect(() => {
    if (rotatePool.length < 2) return;
    const t = setInterval(() => setSpotIdx((i) => (i + 1) % rotatePool.length), 2200);
    return () => clearInterval(t);
  }, [rotatePool.length]);
  const spot = rotatePool[spotIdx];

  // Flash sale live countdown — ends today at midnight local
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const endOfDay = (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); })();
  const diff = Math.max(0, endOfDay - now);
  const hh = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
  const mm = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
  const ss = String(Math.floor((diff % 60_000) / 1000)).padStart(2, "0");

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_70%_50%,oklch(0.85_0.17_87/0.4),transparent_60%)]" />
        <div className="relative container mx-auto px-4 py-14 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Flash Sale ends tonight
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Premium tech &<br />
              kitchen gear,<br />
              <span className="text-accent">delivered rapid.</span>
            </h1>
            <p className="mt-5 text-white/80 text-base md:text-lg max-w-md">
              Genuine products from the brands you love. Same-day dispatch in Dhaka, 1-3 day nationwide delivery.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/category/electronics"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-semibold shadow-[var(--shadow-soft)] hover:scale-[1.02] transition"
              >
                Shop Electronics <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/category/cookery"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur border border-white/30 text-white font-semibold hover:bg-white/20 transition"
              >
                Kitchen Deals
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md text-white/90">
              <div><div className="text-2xl font-bold">100+</div><div className="text-xs text-white/60">Products</div></div>
              <div><div className="text-2xl font-bold">64</div><div className="text-xs text-white/60">Districts</div></div>
              <div><div className="text-2xl font-bold">4.8★</div><div className="text-xs text-white/60">Avg. Rating</div></div>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImg}
              alt="Premium electronics floating arrangement"
              width={1600}
              height={900}
              className="w-full h-auto rounded-2xl shadow-[var(--shadow-elevated)]"
            />
            {spot && (
              <Link
                to="/product/$id"
                params={{ id: spot.product_id }}
                className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:w-72 rounded-2xl bg-background/95 backdrop-blur border border-white/40 p-3 shadow-[var(--shadow-elevated)] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
                key={spot.id}
              >
                <img src={spot.images?.[0]} alt={spot.name} className="h-14 w-14 rounded-lg object-cover bg-muted shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-accent font-bold">Trending now</div>
                  <div className="text-sm font-semibold text-foreground line-clamp-1">{spot.name}</div>
                  <div className="text-sm font-bold text-primary">{formatBDT(effectivePrice(spot))}</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-border bg-muted/50">
        <div className="container mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            [Truck, "Fast Delivery", "1–3 days nationwide"],
            [ShieldCheck, "Genuine Products", "Official warranty"],
            [Headset, "24/7 Support", "Talk to a human"],
            [ShieldCheck, "Cash on Delivery", "Pay when you receive"],
          ].map(([Icon, t, s]) => {
            const I = Icon as React.ComponentType<{ className?: string }>;
            return (
              <div key={t as string} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center text-primary">
                  <I className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{t as string}</div>
                  <div className="text-xs text-muted-foreground">{s as string}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Shop by Category</h2>
            <p className="text-sm text-muted-foreground mt-1">Find what you need in seconds.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {allCats.map((c) => {
            const Icon = iconMap[c.icon ?? ""] ?? Smartphone;
            return (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group rounded-xl border border-border bg-card p-4 text-center hover:border-primary hover:shadow-[var(--shadow-card)] transition-all"
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-primary-foreground mb-2 group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-xs font-medium text-foreground">{c.name}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FLASH SALE */}
      {flash.length > 0 && (
        <section className="container mx-auto px-4 pb-14">
          <div className="rounded-2xl bg-secondary text-secondary-foreground p-6 md:p-8 shadow-[var(--shadow-elevated)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-accent text-xs font-bold uppercase tracking-widest">⚡ Flash Sale</div>
                <h2 className="text-2xl md:text-3xl font-bold mt-1">Up to 30% off — today only</h2>
              </div>
              <div className="hidden sm:flex gap-2 text-center">
                {[hh, mm, ss].map((v, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 min-w-[52px]">
                    <div className="font-bold text-lg">{v}</div>
                    <div className="text-[10px] text-secondary-foreground/60 uppercase">{["hr","min","sec"][i]}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flash.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED */}
      <section className="container mx-auto px-4 pb-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Products</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="container mx-auto px-4 pb-20">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">New Arrivals</h2>
            <Link to="/products" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
