import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center font-bold">R</div>
            <span className="font-bold text-lg">Rapid Shopping</span>
          </div>
          <p className="text-sm text-secondary-foreground/70">
            Electronics, gadgets and kitchen essentials delivered fast across Bangladesh.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li><Link to="/category/electronics" className="hover:text-accent">Electronics</Link></li>
            <li><Link to="/category/gadgets" className="hover:text-accent">Gadgets</Link></li>
            <li><Link to="/category/cookery" className="hover:text-accent">Cookery & Kitchen</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Help</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li>Order Tracking</li>
            <li>Returns & Warranty</li>
            <li>Contact Support</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Newsletter</h4>
          <p className="text-sm text-secondary-foreground/70 mb-3">Get exclusive deals straight to your inbox.</p>
          <div className="flex gap-2">
            <input
              placeholder="you@email.com"
              className="flex-1 h-10 px-3 rounded-md bg-white/10 placeholder:text-secondary-foreground/40 text-sm outline-none focus:bg-white/15"
            />
            <button className="h-10 px-4 rounded-md bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition">
              Join
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 text-xs text-secondary-foreground/60 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Rapid Shopping. All rights reserved.</span>
          <span>Secure payments • bKash • Nagad • Card • COD</span>
        </div>
      </div>
    </footer>
  );
}