import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Check your email for the reset link");
  };

  return (
    <main className="min-h-screen px-6 pt-8 pb-16 max-w-md mx-auto">
      <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
      <div className="mt-6 mb-8 flex flex-col items-start gap-4">
        <Logo />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
          <p className="text-sm text-muted-foreground mt-1">We'll email you a secure link to choose a new one.</p>
        </div>
      </div>

      {sent ? (
        <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
          If an account exists for <span className="text-foreground font-medium">{email}</span>, a reset link is on its way. Check your inbox (and spam folder).
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.com"
              autoComplete="email"
              required
              className="w-full h-12 rounded-xl bg-surface border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send reset link
          </button>
        </form>
      )}
    </main>
  );
}
