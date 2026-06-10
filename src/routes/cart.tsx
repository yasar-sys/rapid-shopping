import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Rapid Shopping" },
      { name: "description", content: "Review the items in your cart and proceed to checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal, count, clear } = useCart();
  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 80;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-muted grid place-items-center text-muted-foreground">
          <ShoppingBag className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-1 text-muted-foreground text-sm">Discover the latest tech & home essentials.</p>
        <Link to="/" className="mt-6 inline-flex h-11 px-6 items-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground">Your Cart</h1>
      <p className="text-sm text-muted-foreground mt-1">{count} {count === 1 ? "item" : "items"}</p>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((i) => (
            <div key={i.productId} className="flex gap-4 rounded-xl border border-border bg-card p-4">
              <Link to="/product/$id" params={{ id: i.productId.toLowerCase() }} className="shrink-0">
                <img src={i.image} alt={i.name} width={96} height={96} className="h-24 w-24 rounded-lg object-cover bg-muted" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to="/product/$id" params={{ id: i.productId.toLowerCase() }} className="font-medium text-foreground hover:text-primary line-clamp-2">
                  {i.name}
                </Link>
                <div className="text-xs text-muted-foreground mt-1">{i.productId}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-border overflow-hidden">
                    <button onClick={() => setQty(i.productId, i.qty - 1)} className="h-9 w-9 grid place-items-center hover:bg-muted" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{i.qty}</span>
                    <button onClick={() => setQty(i.productId, i.qty + 1)} className="h-9 w-9 grid place-items-center hover:bg-muted" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">{formatBDT(i.qty * i.price)}</span>
                    <button onClick={() => remove(i.productId)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive">Clear cart</button>
        </div>

        <aside className="rounded-xl border border-border bg-card p-6 h-fit sticky top-24 shadow-[var(--shadow-card)]">
          <h2 className="font-semibold text-lg">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatBDT(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">{shipping === 0 ? "Free" : formatBDT(shipping)}</span></div>
          </div>
          <div className="my-4 border-t border-border" />
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatBDT(total)}</span></div>
          <Link to="/checkout" className="mt-5 flex h-12 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--shadow-soft)]">
            Proceed to Checkout
          </Link>
          <Link to="/" className="mt-3 block text-center text-sm text-primary hover:underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}