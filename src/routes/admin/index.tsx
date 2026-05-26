import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? "Sign-in failed");
      return;
    }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    const isAdmin = roles?.some((r) => r.role === "admin");
    setLoading(false);
    if (!isAdmin) {
      await supabase.auth.signOut();
      toast.error("This account is not an admin");
      return;
    }
    toast.success("Welcome, admin");
    nav({ to: "/admin/subjects" });
  };

  return (
    <main className="min-h-screen px-6 pt-16 pb-16 max-w-md mx-auto">
      <Logo />
      <div className="mt-12 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-medium">
        <Shield className="h-3.5 w-3.5" /> Admin access
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Admin sign in</h1>
      <p className="text-sm text-muted-foreground mt-1">Restricted area · authorized staff only.</p>

      <form onSubmit={submit} className="space-y-4 mt-8">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@school.com"
          className="w-full h-12 rounded-xl bg-surface border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full h-12 rounded-xl bg-surface border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>
    </main>
  );
}
