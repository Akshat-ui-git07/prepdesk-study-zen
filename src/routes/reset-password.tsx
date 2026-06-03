import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You're signed in.");
    nav({ to: "/home" });
  };

  return (
    <main className="min-h-screen px-6 pt-16 pb-16 max-w-md mx-auto">
      <Logo />
      <h1 className="mt-8 text-3xl font-bold tracking-tight">Choose a new password</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {ready ? "Pick something memorable but strong." : "Verifying your reset link…"}
      </p>

      <form onSubmit={submit} className="space-y-4 mt-8">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
          className="w-full h-12 rounded-xl bg-surface border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
          className="w-full h-12 rounded-xl bg-surface border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || !ready}
          className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </button>
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline font-medium">Back to sign in</Link>
        </p>
      </form>
    </main>
  );
}
