import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  normalizeQuestions,
  suggestedSeconds,
  formatTime,
  scoreAttempt,
  type AnswerMap,
  type NormalizedQuestion,
} from "@/lib/practice";

export const Route = createFileRoute("/_app/practice/$paperId/attempt")({
  component: AttemptPage,
});

type Paper = { id: string; title: string; questions_json: unknown };

function AttemptPage() {
  const { paperId } = Route.useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [questions, setQuestions] = useState<NormalizedQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const totalTimeRef = useRef<number>(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("practice_papers")
        .select("id, title, questions_json")
        .eq("id", paperId)
        .maybeSingle();
      const p = (data ?? null) as Paper | null;
      setPaper(p);
      if (p) {
        const qs = normalizeQuestions(p.questions_json);
        setQuestions(qs);
        const init: AnswerMap = {};
        qs.forEach((q) => (init[q.id] = { value: null, marked: false }));
        setAnswers(init);
        const secs = suggestedSeconds(qs.length);
        totalTimeRef.current = secs;
        setTimeLeft(secs);
        startedAtRef.current = Date.now();
      }
    })();
  }, [paperId]);

  // Timer
  useEffect(() => {
    if (!paper || questions.length === 0) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          void handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper, questions.length]);

  const current = questions[index];
  const progress = useMemo(() => {
    const answered = Object.values(answers).filter((a) => a.value !== null && a.value !== "").length;
    return { answered, total: questions.length };
  }, [answers, questions.length]);

  function setAnswer(value: string | number | null) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: { ...prev[current.id], value } }));
  }

  function toggleMark() {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: { ...prev[current.id], marked: !prev[current.id]?.marked } }));
  }

  async function handleSubmit(auto = false) {
    if (submitting) return;
    setSubmitting(true);
    const result = scoreAttempt(questions, answers);
    const timeTaken = Math.min(totalTimeRef.current, Math.round((Date.now() - startedAtRef.current) / 1000));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const { data, error } = await supabase
      .from("practice_attempts")
      .insert({
        user_id: user.id,
        paper_id: paperId,
        score: result.score,
        total: result.total,
        percentage: result.percentage,
        time_taken_seconds: timeTaken,
        answers_json: answers as never,
        breakdown_json: result.breakdown as never,
      })
      .select("id")
      .single();
    if (error || !data) {
      setSubmitting(false);
      return;
    }
    navigate({
      to: "/practice/$paperId/results/$attemptId",
      params: { paperId, attemptId: data.id },
      replace: true,
      search: auto ? { auto: 1 } : undefined,
    });
  }

  if (paper === null) {
    return (
      <main className="px-5 pt-10 pb-6">
        <Skeleton className="h-10 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full mt-4 rounded-3xl" />
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="px-5 pt-10 pb-6">
        <p className="text-sm text-muted-foreground text-center">This paper has no questions.</p>
      </main>
    );
  }

  const isLow = timeLeft <= 60;

  return (
    <main className="px-5 pt-6 pb-32 animate-[fade-in_0.4s_ease-out]">
      {/* Sticky header: timer + progress */}
      <div className="sticky top-0 z-30 -mx-5 px-5 py-3 bg-background/85 backdrop-blur-lg border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl font-display font-bold text-sm tabular-nums",
            isLow ? "bg-destructive/15 text-destructive animate-pulse" : "bg-primary/15 text-primary"
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <span>Q{index + 1} / {questions.length}</span>
              <span>{progress.answered} answered</span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full gradient-primary transition-all"
                style={{ width: `${(progress.answered / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirmOpen(true)}
            className="rounded-xl"
          >
            <Send className="h-3.5 w-3.5" /> Submit
          </Button>
        </div>
      </div>

      {/* Question card */}
      <article className="mt-5 rounded-3xl bg-surface border border-border/60 p-5 shadow-elevated">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold">
            Question {index + 1}{current.marks > 1 ? ` · ${current.marks} marks` : ""}
          </p>
          <button
            onClick={toggleMark}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
              answers[current.id]?.marked
                ? "bg-warning/20 text-warning"
                : "text-muted-foreground hover:bg-surface-elevated"
            )}
          >
            <Flag className="h-3 w-3" fill={answers[current.id]?.marked ? "currentColor" : "none"} />
            {answers[current.id]?.marked ? "Marked" : "Mark for review"}
          </button>
        </div>
        <h2 className="font-display text-lg font-semibold mt-3 leading-snug">{current.prompt}</h2>

        <div className="mt-5 space-y-2.5">
          {current.type === "mcq" ? (
            current.options.map((opt, i) => {
              const selected = answers[current.id]?.value === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswer(i)}
                  className={cn(
                    "w-full text-left rounded-2xl border p-4 flex items-center gap-3 transition-all active:scale-[0.99]",
                    selected
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border/60 bg-surface-elevated hover:border-primary/40"
                  )}
                >
                  <div className={cn(
                    "h-7 w-7 shrink-0 rounded-lg grid place-items-center text-xs font-bold font-display",
                    selected ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
                  )}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-sm">{opt}</span>
                </button>
              );
            })
          ) : (
            <Input
              value={(answers[current.id]?.value as string) ?? ""}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="h-12 rounded-xl bg-surface-elevated"
            />
          )}
        </div>
      </article>

      {/* Prev/Next */}
      <div className="flex items-center gap-3 mt-5">
        <Button
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="flex-1 h-12 rounded-2xl"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button
          disabled={index === questions.length - 1}
          onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          className="flex-1 h-12 rounded-2xl gradient-primary"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Palette */}
      <section className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question palette</p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <Legend className="bg-primary" label="Answered" />
            <Legend className="bg-warning" label="Marked" />
            <Legend className="bg-surface border border-border" label="Unseen" />
          </div>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const answered = a?.value !== null && a?.value !== "";
            const marked = a?.marked;
            const isCurrent = i === index;
            return (
              <button
                key={q.id}
                onClick={() => setIndex(i)}
                className={cn(
                  "aspect-square rounded-lg text-xs font-bold font-display transition-all relative",
                  isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  marked
                    ? "bg-warning/25 text-warning"
                    : answered
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface border border-border/60 text-muted-foreground hover:border-primary/40"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit paper?</AlertDialogTitle>
            <AlertDialogDescription>
              You've answered {progress.answered} of {progress.total} questions.
              {progress.answered < progress.total && " Unanswered questions will be marked wrong."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep going</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="rounded-xl gradient-primary"
            >
              {submitting ? "Submitting..." : "Submit now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("h-2.5 w-2.5 rounded-sm", className)} />
      {label}
    </span>
  );
}
