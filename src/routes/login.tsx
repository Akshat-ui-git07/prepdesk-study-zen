import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    nav({ to: "/home" });
  };

  return (
    <main className="min-h-screen px-6 pt-8 pb-16 max-w-md mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="mt-6 mb-8 flex flex-col items-start gap-4">
        <Logo />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue learning.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 animate-[fade-in_0.4s_ease-out]">
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.com"
            autoComplete="email"
            className="w-full h-12 rounded-xl bg-surface border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            className="w-full h-12 rounded-xl bg-surface border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <div className="text-right -mt-2">
          <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
