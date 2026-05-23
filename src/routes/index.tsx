import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { ArrowRight, BookOpenCheck, Zap, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/home" });
  },
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen flex flex-col px-6 pt-12 pb-10 max-w-md mx-auto">
      <header className="flex items-center justify-between animate-[fade-in_0.5s_ease-out]">
        <Logo />
        <Link
          to="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in
        </Link>
      </header>

      <section className="flex-1 flex flex-col justify-center py-16">
        <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full glass border border-border/60 text-xs text-muted-foreground mb-6 animate-[slide-up_0.6s_ease-out]">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Class 11 CBSE · PCM
        </div>

        <h1 className="text-5xl font-bold tracking-tight leading-[1.05] text-gradient animate-[slide-up_0.7s_ease-out]">
          Study smarter,<br />score higher.
        </h1>

        <p className="mt-5 text-base text-muted-foreground leading-relaxed animate-[slide-up_0.8s_ease-out]">
          Everything you need for Physics, Chemistry, and Math —
          notes, practice papers, past papers, and AI-powered help.
          Built for your school. Built for you.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-3 animate-[slide-up_0.9s_ease-out]">
          {[
            { icon: BookOpenCheck, label: "Notes" },
            { icon: Zap, label: "Practice" },
            { icon: Trophy, label: "Past papers" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass rounded-2xl p-4 border border-border/60 text-center">
              <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-xs font-medium text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="space-y-3 animate-[slide-up_1s_ease-out]">
        <Link
          to="/signup"
          className="group flex items-center justify-center gap-2 w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow transition-all active:scale-[0.98]"
        >
          Get started
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          Invite code required · school students only
        </p>
      </footer>
    </main>
  );
}
