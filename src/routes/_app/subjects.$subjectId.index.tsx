import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_app/subjects/$subjectId/")({
  component: ChaptersList,
});

type Chapter = { id: string; number: number; name: string };

function ChaptersList() {
  const { subjectId } = Route.useParams();
  const [subjectName, setSubjectName] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[] | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: c }] = await Promise.all([
        supabase.from("subjects").select("name").eq("id", subjectId).maybeSingle(),
        supabase
          .from("chapters")
          .select("id, number, name")
          .eq("subject_id", subjectId)
          .order("number", { ascending: true }),
      ]);
      setSubjectName(s?.name ?? "Subject");
      setChapters(c ?? []);
    })();
  }, [subjectId]);

  return (
    <main className="px-5 pt-8 pb-6 animate-[fade-in_0.4s_ease-out]">
      <Link
        to="/subjects"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Subjects
      </Link>

      <header className="mb-6">
        {subjectName === null ? (
          <Skeleton className="h-7 w-40" />
        ) : (
          <h1 className="text-2xl font-bold tracking-tight">{subjectName}</h1>
        )}
        <p className="text-sm text-muted-foreground mt-1">All chapters in order.</p>
      </header>

      <ul className="space-y-2.5">
        {chapters === null
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))
          : chapters.length === 0
          ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <BookOpen className="h-6 w-6 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium mt-3">No chapters yet</p>
              <p className="text-xs text-muted-foreground mt-1">Content is on its way.</p>
            </div>
          )
          : chapters.map((ch) => (
              <li key={ch.id}>
                <Link
                  to="/subjects/$subjectId/$chapterId"
                  params={{ subjectId, chapterId: ch.id }}
                  className="w-full text-left rounded-2xl bg-surface border border-border/60 p-4 flex items-center gap-3 hover:border-primary/40 hover:bg-surface-elevated transition-all active:scale-[0.99]"
                >
                  <div className="h-11 w-11 rounded-xl grid place-items-center bg-primary/15 text-primary font-bold tabular-nums" style={{ fontFamily: "Sora" }}>
                    {ch.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Chapter {ch.number}
                    </p>
                    <p className="text-sm font-medium truncate">{ch.name}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
      </ul>
    </main>
  );
}
