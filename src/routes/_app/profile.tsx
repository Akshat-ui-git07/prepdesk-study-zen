import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { ChevronRight, History, LogOut, Shield } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  component: Profile,
});

type Attempt = {
  id: string;
  paper_id: string;
  score: number;
  total: number;
  percentage: number;
  submitted_at: string;
};

type PaperLite = { id: string; title: string };

function Profile() {
  const nav = useNavigate();
  const [profile, setProfile] = useState<{ name: string; section: string; invite_code_used: string | null } | null>(null);
  const [email, setEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [papers, setPapers] = useState<Record<string, PaperLite>>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const [{ data }, { data: roles }, { data: att }] = await Promise.all([
        supabase.from("profiles").select("name, section, invite_code_used").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase
          .from("practice_attempts")
          .select("id, paper_id, score, total, percentage, submitted_at")
          .eq("user_id", user.id)
          .order("submitted_at", { ascending: false })
          .limit(20),
      ]);
      setProfile(data);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      const list = (att ?? []) as Attempt[];
      setAttempts(list);
      const ids = Array.from(new Set(list.map((a) => a.paper_id)));
      if (ids.length) {
        const { data: ps } = await supabase.from("practice_papers").select("id, title").in("id", ids);
        const map: Record<string, PaperLite> = {};
        (ps ?? []).forEach((p) => (map[p.id] = p as PaperLite));
        setPapers(map);
      }
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    nav({ to: "/" });
  };

  return (
    <main className="px-5 pt-10 pb-6 animate-[fade-in_0.4s_ease-out]">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      <div className="mt-6 rounded-3xl bg-surface border border-border/60 p-6 text-center shadow-card">
        <div className="h-20 w-20 mx-auto rounded-full gradient-primary grid place-items-center text-primary-foreground text-2xl font-bold shadow-glow">
          {profile?.name?.[0]?.toUpperCase() ?? "·"}
        </div>
        {profile ? (
          <>
            <p className="mt-4 text-lg font-semibold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">
              Class 11 · Section {profile.section}
            </div>
          </>
        ) : (
          <>
            <Skeleton className="h-5 w-32 mx-auto mt-4" />
            <Skeleton className="h-4 w-48 mx-auto mt-2" />
          </>
        )}
      </div>

      {profile?.invite_code_used && (
        <div className="mt-4 rounded-2xl bg-surface border border-border/60 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Invite code</p>
            <p className="text-sm font-mono mt-0.5">{profile.invite_code_used}</p>
          </div>
        </div>
      )}

      {/* Past attempts */}
      <section className="mt-7">
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Past attempts</h2>
        </div>
        {attempts === null ? (
          <div className="space-y-2.5">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : attempts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="text-xs text-muted-foreground">No attempts yet — start a practice paper to track scores.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {attempts.map((a) => {
              const title = papers[a.paper_id]?.title ?? "Practice paper";
              const tone =
                a.percentage >= 80 ? "text-success" : a.percentage >= 50 ? "text-primary" : "text-destructive";
              return (
                <li key={a.id}>
                  <Link
                    to="/practice/$paperId/results/$attemptId"
                    params={{ paperId: a.paper_id, attemptId: a.id }}
                    className="flex items-center gap-3 rounded-2xl bg-surface border border-border/60 p-4 hover:border-primary/40 hover:bg-surface-elevated transition-all shadow-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {a.score}/{a.total} ·{" "}
                        {new Date(a.submitted_at).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <p className={`font-display text-xl font-bold tabular-nums ${tone}`}>{a.percentage}%</p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {isAdmin && (
        <Link
          to="/admin/dashboard"
          className="mt-6 w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-glow active:scale-[0.99] transition-all"
        >
          <Shield className="h-4 w-4" /> Open admin panel
        </Link>
      )}

      <button
        onClick={signOut}
        className="mt-4 w-full h-12 rounded-2xl bg-surface border border-border text-destructive font-medium flex items-center justify-center gap-2 hover:bg-surface-elevated transition-all"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </main>
  );
}
