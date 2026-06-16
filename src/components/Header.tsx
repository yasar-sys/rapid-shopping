import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, Search, Menu, Zap, User as UserIcon, Package, LogOut, ShieldCheck, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import logoAsset from "@/assets/logo.jpg.asset.json";

export function Header() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

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
          <img
            src={logoAsset.url}
            alt="Rapid Shopping logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover shadow-[var(--shadow-soft)]"
          />
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

        <button onClick={toggle} aria-label="Toggle theme" className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-primary/10 transition">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {user ? (
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-primary/10 transition" aria-label="Account">
              <UserIcon className="h-5 w-5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-[var(--shadow-card)] z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border text-xs text-muted-foreground truncate">{user.email}</div>
                  <Link to="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted"><UserIcon className="h-4 w-4" /> My account</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted"><Package className="h-4 w-4" /> My orders</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted text-secondary font-medium"><ShieldCheck className="h-4 w-4" /> Admin panel</Link>}
                  <button onClick={async () => { await signOut(); setMenuOpen(false); navigate({ to: "/" }); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted text-destructive border-t border-border"><LogOut className="h-4 w-4" /> Sign out</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/auth" className="hidden sm:inline-flex h-10 px-4 items-center rounded-full text-sm font-medium bg-foreground text-background hover:opacity-90 transition">Sign in</Link>
        )}

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