import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, MailCheck, Check, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/signup")({
  component: Signup,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name too short").max(60),
  section: z.enum(["A", "B", "C", "D"]),
  invite_code: z.string().trim().min(4).max(50),
  email: z.string().trim().email().max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

function Signup() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", section: "A", invite_code: "", email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);

    // Validate invite code
    const { data: invite } = await supabase
      .from("invite_codes")
      .select("id, used_by")
      .eq("code", parsed.data.invite_code)
      .maybeSingle();

    if (!invite) {
      toast.error("Invalid invite code");
      setLoading(false);
      return;
    }
    if (invite.used_by) {
      toast.error("This invite code has already been used");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: {
          name: parsed.data.name,
          section: parsed.data.section,
          invite_code: parsed.data.invite_code,
        },
      },
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session) {
      // Auto-confirmed: session is active, go to app
      toast.success("Welcome to Prepdesk!");
      nav({ to: "/home" });
    } else {
      // Email confirmation required
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen px-6 pt-8 pb-16 max-w-md mx-auto flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mb-6">
          <MailCheck className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Account created!</h1>
        <p className="text-muted-foreground text-sm max-w-xs mb-8">
          Check your email to confirm your account, then come back and sign in.
        </p>
        <Link
          to="/login"
          className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow active:scale-[0.98] transition-all flex items-center justify-center"
        >
          Go to Sign In
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 pt-8 pb-16 max-w-md mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="mt-6 mb-8 flex flex-col items-start gap-4">
        <Logo />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">Use the invite code from your school.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 animate-[fade-in_0.4s_ease-out]">
        <Field label="Full name">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            className={inputClass}
          />
        </Field>

        <Field label="Class section">
          <div className="grid grid-cols-4 gap-2">
            {(["A", "B", "C", "D"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, section: s })}
                className={`h-12 rounded-xl border font-semibold transition-all ${
                  form.section === s
                    ? "gradient-primary border-transparent text-primary-foreground shadow-glow"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Invite code">
          <input
            value={form.invite_code}
            onChange={(e) => setForm({ ...form, invite_code: e.target.value.toUpperCase() })}
            placeholder="PREP-2025-XXXX"
            className={`${inputClass} font-mono tracking-wider`}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@school.com"
            className={inputClass}
            autoComplete="email"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
            className={inputClass}
            autoComplete="new-password"
          />
        </Field>
        <PasswordRequirements password={form.password} />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </form>
    </main>
  );
}

const inputClass =
  "w-full h-12 rounded-xl bg-surface border border-border px-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

/* ─── Password helper components ─── */

type Req = { label: string; met: boolean };

function PasswordRequirements({ password }: { password: string }) {
  const reqs: Req[] = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a letter", met: /[A-Za-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
  ];

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Za-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { label: "Weak", color: "bg-destructive", width: "w-[30%]" };
    if (score <= 4) return { label: "Okay", color: "bg-warning", width: "w-[65%]" };
    return { label: "Strong", color: "bg-success", width: "w-full" };
  }, [password]);

  return (
    <div className="space-y-3 animate-[fade-in_0.3s_ease-out]">
      {/* requirement pills */}
      <div className="flex flex-wrap gap-2">
        {reqs.map((r) => (
          <span
            key={r.label}
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors ${
              r.met
                ? "border-success/30 text-success bg-success/10"
                : "border-border text-muted-foreground bg-surface"
            }`}
          >
            {r.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {r.label}
          </span>
        ))}
      </div>

      {/* strength bar */}
      {password.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Strength</span>
            <span
              className={`font-semibold ${
                strength.label === "Weak"
                  ? "text-destructive"
                  : strength.label === "Okay"
                    ? "text-warning"
                    : "text-success"
              }`}
            >
              {strength.label}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${strength.color} ${strength.width}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
