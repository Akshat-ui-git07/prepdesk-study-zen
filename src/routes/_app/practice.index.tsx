import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { Atom, FlaskConical, Sigma, ChevronRight, ClipboardList, History } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/practice/")({
  component: PracticeIndex,
});

type Subject = { id: string; name: string };
type Paper = {
  id: string;
  title: string;
  subject_id: string;
  questions_json: unknown;
};
type Attempt = { id: string; paper_id: string; percentage: number; submitted_at: string };

const ICONS: Record<string, { icon: typeof Atom; gradient: string }> = {
  physics: { icon: Atom, gradient: "from-[oklch(0.65_0.20_240)] to-[oklch(0.55_0.22_265)]" },
  chemistry: { icon: FlaskConical, gradient: "from-[oklch(0.68_0.18_155)] to-[oklch(0.58_0.20_180)]" },
  mathematics: { icon: Sigma, gradient: "from-[oklch(0.70_0.18_50)] to-[oklch(0.60_0.20_25)]" },
};

function iconFor(name: string) {
  return ICONS[name.toLowerCase()] ?? { icon: ClipboardList, gradient: "from-primary to-primary/70" };
}

function PracticeIndex() {
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [sRes, pRes, aRes] = await Promise.all([
        supabase.from("subjects").select("id, name").order("name"),
        supabase.from("practice_papers").select("id, title, subject_id, questions_json").order("created_at", { ascending: false }),
        user
          ? supabase
              .from("practice_attempts")
              .select("id, paper_id, percentage, submitted_at")
              .order("submitted_at", { ascending: false })
              .limit(20)
          : Promise.resolve({ data: [] as Attempt[] }),
      ]);
      setSubjects((sRes.data ?? []) as Subject[]);
      setPapers((pRes.data ?? []) as Paper[]);
      setAttempts((aRes.data ?? []) as Attempt[]);
    })();
  }, []);

  const loading = subjects === null || papers === null;

  return (
    <main className="px-5 pt-10 pb-6 animate-[fade-in_0.4s_ease-out]">
      <header className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight">Practice</h1>
        <p className="text-sm text-muted-foreground mt-1">Timed papers across PCM. Track your score.</p>
      </header>

      {attempts && attempts.length > 0 && (
        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent attempts</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
            {attempts.slice(0, 6).map((a) => {
              const paper = papers?.find((p) => p.id === a.paper_id);
              return (
                <Link
                  key={a.id}
                  to="/practice/$paperId/results/$attemptId"
                  params={{ paperId: a.paper_id, attemptId: a.id }}
                  className="shrink-0 rounded-2xl bg-surface border border-border/60 p-3 w-44 shadow-card hover:border-primary/40 transition-all"
                >
                  <p className="text-xs text-muted-foreground truncate">{paper?.title ?? "Paper"}</p>
                  <p className="text-xl font-bold font-display mt-1">{a.percentage}%</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(a.submitted_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {loading ? (
        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-32 mb-3" />
              <div className="space-y-2.5">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : papers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center">
          <div className="h-12 w-12 mx-auto rounded-2xl gradient-primary shadow-glow grid place-items-center text-primary-foreground">
            <ClipboardList className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-medium">No practice papers yet</p>
          <p className="text-xs text-muted-foreground mt-1">Check back soon — new papers drop weekly.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {subjects!.map((subject) => {
            const list = papers!.filter((p) => p.subject_id === subject.id);
            const { icon: Icon, gradient } = iconFor(subject.name);
            return (
              <section key={subject.id}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("h-7 w-7 rounded-lg grid place-items-center bg-gradient-to-br text-white", gradient)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {subject.name}
                  </h2>
                  {list.length > 0 && (
                    <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-surface border border-border/60 rounded-full px-2 py-0.5">
                      {list.length}
                    </span>
                  )}
                </div>
                {list.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                    <p className="text-xs text-muted-foreground">No {subject.name} papers yet</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {list.map((p) => {
                      const count = Array.isArray(p.questions_json) ? p.questions_json.length : 0;
                      return (
                        <Link
                          key={p.id}
                          to="/practice/$paperId"
                          params={{ paperId: p.id }}
                          className="block rounded-2xl bg-surface border border-border/60 p-4 hover:border-primary/40 hover:bg-surface-elevated transition-all active:scale-[0.99] shadow-card"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("h-11 w-11 rounded-xl grid place-items-center bg-gradient-to-br text-white shadow-glow", gradient)}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{p.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {count} {count === 1 ? "question" : "questions"}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
