import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Trophy, RotateCcw, ChevronLeft, Home, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeQuestions, formatTime, type NormalizedQuestion } from "@/lib/practice";

export const Route = createFileRoute("/_app/practice/$paperId/results/$attemptId")({
  component: ResultsPage,
});

type Attempt = {
  id: string;
  score: number;
  total: number;
  percentage: number;
  time_taken_seconds: number;
  submitted_at: string;
  breakdown_json: Array<{
    id: number;
    correct: boolean;
    user: string | number | null;
    expected: string | number | null;
    explanation: string | null;
  }>;
};

type Paper = { id: string; title: string; questions_json: unknown };

function ResultsPage() {
  const { paperId, attemptId } = Route.useParams();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [questions, setQuestions] = useState<NormalizedQuestion[]>([]);

  useEffect(() => {
    (async () => {
      const [aRes, pRes] = await Promise.all([
        supabase.from("practice_attempts").select("*").eq("id", attemptId).maybeSingle(),
        supabase.from("practice_papers").select("id, title, questions_json").eq("id", paperId).maybeSingle(),
      ]);
      setAttempt((aRes.data ?? null) as Attempt | null);
      const p = (pRes.data ?? null) as Paper | null;
      setPaper(p);
      if (p) setQuestions(normalizeQuestions(p.questions_json));
    })();
  }, [attemptId, paperId]);

  if (attempt === null || paper === null) {
    return (
      <main className="px-5 pt-10 pb-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  const pct = attempt.percentage;
  const tone =
    pct >= 80
      ? { label: "Excellent", grad: "from-[oklch(0.70_0.18_155)] to-[oklch(0.55_0.20_180)]" }
      : pct >= 60
      ? { label: "Good work", grad: "from-[oklch(0.60_0.20_240)] to-[oklch(0.45_0.22_265)]" }
      : pct >= 40
      ? { label: "Keep going", grad: "from-[oklch(0.70_0.18_50)] to-[oklch(0.60_0.20_25)]" }
      : { label: "Tough one", grad: "from-[oklch(0.55_0.22_15)] to-[oklch(0.45_0.20_350)]" };

  return (
    <main className="px-5 pt-8 pb-6 animate-[fade-in_0.4s_ease-out]">
      <Link to="/practice" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="h-3.5 w-3.5" /> Practice
      </Link>

      <header className="mb-5">
        <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold">Results</p>
        <h1 className="text-xl font-bold tracking-tight mt-1">{paper.title}</h1>
      </header>

      {/* Score card */}
      <section className={cn("rounded-3xl bg-gradient-to-br p-6 shadow-elevated text-white", tone.grad)}>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <p className="text-[10px] uppercase tracking-[0.15em] font-semibold opacity-90">{tone.label}</p>
        </div>
        <div className="mt-3 flex items-end gap-2">
          <p className="font-display text-6xl font-bold leading-none tabular-nums">{pct}</p>
          <p className="text-2xl font-bold opacity-80 mb-1">%</p>
        </div>
        <p className="text-sm opacity-90 mt-2">
          {attempt.score} / {attempt.total} marks
        </p>
        <div className="mt-4 h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full bg-white" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <Stat icon={Check} label="Correct" value={String(attempt.breakdown_json.filter((b) => b.correct).length)} accent="text-success" />
        <Stat icon={X} label="Wrong" value={String(attempt.breakdown_json.filter((b) => !b.correct).length)} accent="text-destructive" />
        <Stat icon={Clock} label="Time" value={formatTime(attempt.time_taken_seconds)} />
      </div>

      {/* Per-question breakdown */}
      <section className="mt-7">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Question breakdown</h2>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const b = attempt.breakdown_json.find((x) => x.id === q.id);
            const correct = b?.correct ?? false;
            return (
              <article
                key={q.id}
                className={cn(
                  "rounded-2xl border p-4 shadow-card",
                  correct ? "bg-success/5 border-success/30" : "bg-destructive/5 border-destructive/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-8 w-8 shrink-0 rounded-lg grid place-items-center text-xs font-bold font-display",
                    correct ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                  )}>
                    {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Question {i + 1}
                    </p>
                    <p className="text-sm font-medium mt-0.5 leading-snug">{q.prompt}</p>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <Row label="Your answer" value={renderAnswer(q, b?.user)} tone={correct ? "ok" : "bad"} />
                      {!correct && (
                        <Row label="Correct answer" value={renderAnswer(q, b?.expected)} tone="ok" />
                      )}
                    </div>

                    {b?.explanation && (
                      <div className="mt-3 rounded-xl bg-surface border border-border/60 p-3 flex gap-2">
                        <Lightbulb className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{b.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 mt-7">
        <Button asChild variant="outline" className="flex-1 h-12 rounded-2xl">
          <Link to="/home"><Home className="h-4 w-4" /> Home</Link>
        </Button>
        <Button asChild className="flex-1 h-12 rounded-2xl gradient-primary">
          <Link to="/practice/$paperId" params={{ paperId }}><RotateCcw className="h-4 w-4" /> Retake</Link>
        </Button>
      </div>
    </main>
  );
}

function renderAnswer(q: NormalizedQuestion, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  if (q.type === "mcq" && typeof value === "number") {
    return `${String.fromCharCode(65 + value)}. ${q.options[value] ?? ""}`;
  }
  return String(value);
}

function Row({ label, value, tone }: { label: string; value: string; tone: "ok" | "bad" }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className={cn("font-medium", tone === "ok" ? "text-success" : "text-destructive")}>{value}</span>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: typeof Clock; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border/60 p-3 shadow-card">
      <Icon className={cn("h-3.5 w-3.5", accent ?? "text-muted-foreground")} />
      <p className="font-display text-lg font-bold mt-1 tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
    </div>
  );
}
