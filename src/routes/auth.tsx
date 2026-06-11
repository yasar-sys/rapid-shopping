import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Rapid Shopping" },
      { name: "description", content: "Sign in or create your Rapid Shopping account to track orders, save addresses, and check out faster." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/account" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name }, emailRedirectTo: window.location.origin + "/account" },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to verify.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        router.invalidate();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/account" });
    if (res.error) toast.error(res.error.message);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-3xl font-bold text-center">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
      <p className="text-center text-sm text-muted-foreground mt-2">
        {mode === "signin" ? "Sign in to track orders & check out faster" : "Join Rapid Shopping in seconds"}
      </p>

      <button
        onClick={google}
        className="mt-8 w-full h-11 rounded-full border border-border bg-card font-medium hover:bg-muted transition flex items-center justify-center gap-3"
      >
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px bg-border flex-1" /> OR <div className="h-px bg-border flex-1" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className="w-full h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
        )}
        <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="Email" className="w-full h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} type="password" placeholder="Password (min 6)" className="w-full h-11 px-3 rounded-md border border-border outline-none focus:border-primary" />
        <button type="submit" disabled={busy} className="w-full h-11 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--shadow-soft)] disabled:opacity-50">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="text-center mt-5 text-sm">
        {mode === "signin" ? (
          <button onClick={() => setMode("signup")} className="text-primary hover:underline">New here? Create an account</button>
        ) : (
          <button onClick={() => setMode("signin")} className="text-primary hover:underline">Already have an account? Sign in</button>
        )}
      </div>
      <div className="text-center mt-2">
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Continue browsing</Link>
      </div>
    </div>
  );
}