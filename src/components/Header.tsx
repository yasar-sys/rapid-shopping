import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, Search, Menu, Zap } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";

export function Header() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const path = useRouterState({ select: (s) => s.location.pathname });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } as never });
  };

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        path === to ? "text-primary" : "text-foreground/80"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      {/* Top promo bar */}
      <div className="bg-secondary text-secondary-foreground text-xs">
        <div className="container mx-auto px-4 h-8 flex items-center justify-between">
          <span className="hidden sm:inline">Free delivery in Dhaka on orders above ৳2,000</span>
          <span className="flex items-center gap-1.5 text-[var(--color-accent)] font-medium">
            <Zap className="h-3.5 w-3.5" /> Flash Sale live now
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center text-primary-foreground font-bold shadow-[var(--shadow-soft)]">
            R
          </div>
          <div className="leading-tight">
            <div className="font-bold text-base text-foreground">Rapid<span className="text-primary">Shopping</span></div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">Faster than your craving</div>
          </div>
        </Link>

        <form onSubmit={submit} className="hidden md:flex flex-1 max-w-xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands or product ID (e.g. RS-ELEC-1001)"
              className="w-full h-10 pl-10 pr-4 rounded-full bg-muted border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition"
            />
          </div>
        </form>

        <nav className="hidden lg:flex items-center gap-6">
          {navLink("/", "Home")}
          {navLink("/category/electronics", "Electronics")}
          {navLink("/category/gadgets", "Gadgets")}
          {navLink("/category/cookery", "Kitchen")}
        </nav>

        <Link
          to="/cart"
          className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-primary/10 transition"
          aria-label="Cart"
        >
          <ShoppingCart className="h-5 w-5 text-foreground" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-accent text-accent-foreground text-[11px] font-bold grid place-items-center">
              {count}
            </span>
          )}
        </Link>

        <button className="md:hidden h-10 w-10 grid place-items-center rounded-full bg-muted" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile search */}
      <form onSubmit={submit} className="md:hidden container mx-auto px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-muted outline-none text-sm"
          />
        </div>
      </form>
    </header>
  );
}