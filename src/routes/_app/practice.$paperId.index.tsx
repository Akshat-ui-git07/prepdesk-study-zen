import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, ListChecks, Play, Sparkles } from "lucide-react";
import { normalizeQuestions, suggestedSeconds, formatTime } from "@/lib/practice";

export const Route = createFileRoute("/_app/practice/$paperId/")({
  component: PaperPreStart,
});

type Paper = {
  id: string;
  title: string;
  subject_id: string;
  questions_json: unknown;
};

function PaperPreStart() {
  const { paperId } = Route.useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [subjectName, setSubjectName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("practice_papers")
        .select("id, title, subject_id, questions_json")
        .eq("id", paperId)
        .maybeSingle();
      setPaper((data ?? null) as Paper | null);
      if (data?.subject_id) {
        const { data: s } = await supabase.from("subjects").select("name").eq("id", data.subject_id).maybeSingle();
        setSubjectName(s?.name ?? null);
      }
    })();
  }, [paperId]);

  const questions = paper ? normalizeQuestions(paper.questions_json) : [];
  const seconds = suggestedSeconds(questions.length);

  return (
    <main className="px-5 pt-8 pb-6 animate-[fade-in_0.4s_ease-out]">
      <Link to="/practice" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="h-3.5 w-3.5" /> Practice
      </Link>

      {paper === null ? (
        <>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-64 mt-2" />
          <Skeleton className="h-48 w-full mt-6 rounded-3xl" />
        </>
      ) : (
        <>
          <header className="mb-6">
            {subjectName && (
              <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold">{subjectName}</p>
            )}
            <h1 className="text-2xl font-bold tracking-tight mt-1">{paper.title}</h1>
          </header>

          <div className="rounded-3xl bg-gradient-to-br from-[oklch(0.55_0.22_240)] to-[oklch(0.42_0.20_265)] p-6 shadow-elevated text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <p className="text-[10px] uppercase tracking-[0.15em] font-semibold opacity-90">Ready when you are</p>
            </div>
            <p className="font-display text-3xl font-bold mt-3">{questions.length} {questions.length === 1 ? "question" : "questions"}</p>
            <p className="text-sm opacity-90 mt-1">Suggested time {formatTime(seconds)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Stat icon={ListChecks} label="Questions" value={String(questions.length)} />
            <Stat icon={Clock} label="Time limit" value={formatTime(seconds)} />
          </div>

          <div className="mt-6 rounded-2xl border border-border/60 bg-surface p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Before you begin</p>
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>• Timer starts as soon as you tap Start</li>
              <li>• Use the palette to jump between questions</li>
              <li>• Mark questions for review and come back later</li>
              <li>• Submit anytime — auto-submit when timer ends</li>
            </ul>
          </div>

          <Button
            disabled={questions.length === 0}
            onClick={() => navigate({ to: "/practice/$paperId/attempt", params: { paperId } })}
            className="mt-6 w-full h-14 rounded-2xl gradient-primary text-base font-semibold shadow-glow"
          >
            <Play className="h-5 w-5" /> Start paper
          </Button>
          {questions.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-2">This paper has no questions yet.</p>
          )}
        </>
      )}
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border/60 p-4 shadow-card">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-[10px] uppercase tracking-wider font-semibold">{label}</p>
      </div>
      <p className="font-display text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
