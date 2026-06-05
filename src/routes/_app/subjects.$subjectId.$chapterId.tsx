import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import {
  ChevronLeft,
  FileText,
  Sigma,
  HelpCircle,
  ClipboardList,
  FileType2,
  ExternalLink,
  Bookmark,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/subjects/$subjectId/$chapterId")({
  component: ChapterDetail,
});

type Chapter = { id: string; number: number; name: string; subject_id: string };
type FileItem = { id: string; file_url: string; title?: string | null };
type ImpQ = { id: string; question: string; difficulty: "easy" | "medium" | "hard" };

async function openFile(urlOrPath: string) {
  if (typeof window === "undefined" || !urlOrPath) return;
  let target = urlOrPath;
  // If it's not a full URL, treat it as a path inside the 'content' storage bucket
  if (!/^https?:\/\//i.test(urlOrPath)) {
    // Strip optional "content/" prefix if a path was stored that way
    const path = urlOrPath.replace(/^\/+/, "").replace(/^content\//, "");
    const { data, error } = await supabase.storage
      .from("content")
      .createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) {
      console.error("Failed to create signed URL", error);
      return;
    }
    target = data.signedUrl;
  }
  window.open(target, "_blank", "noopener,noreferrer");
}

function ChapterDetail() {
  const { subjectId, chapterId } = Route.useParams();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subjectName, setSubjectName] = useState<string | null>(null);
  const [notes, setNotes] = useState<FileItem[] | null>(null);
  const [sheets, setSheets] = useState<FileItem[] | null>(null);
  const [impQs, setImpQs] = useState<ImpQ[] | null>(null);
  const [worksheets, setWorksheets] = useState<FileItem[] | null>(null);
  const [onePagers, setOnePagers] = useState<FileItem[] | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const { data: ch } = await supabase
        .from("chapters")
        .select("id, number, name, subject_id")
        .eq("id", chapterId)
        .maybeSingle();
      setChapter(ch ?? null);

      if (ch?.subject_id) {
        const { data: s } = await supabase.from("subjects").select("name").eq("id", ch.subject_id).maybeSingle();
        setSubjectName(s?.name ?? null);
      }

      const [nRes, fRes, iRes, wRes, oRes, bRes] = await Promise.all([
        supabase.from("notes").select("id, title, file_url").eq("chapter_id", chapterId).order("created_at", { ascending: false }),
        supabase.from("formula_sheets").select("id, file_url").eq("chapter_id", chapterId).order("created_at", { ascending: false }),
        supabase.from("important_questions").select("id, question, difficulty").eq("chapter_id", chapterId).order("created_at", { ascending: false }),
        supabase.from("worksheets").select("id, file_url").eq("chapter_id", chapterId).order("created_at", { ascending: false }),
        supabase.from("one_pagers").select("id, file_url").eq("chapter_id", chapterId).order("created_at", { ascending: false }),
        user ? supabase.from("bookmarks").select("question_id").eq("user_id", user.id) : Promise.resolve({ data: [] as any }),
      ]);

      setNotes((nRes.data ?? []) as FileItem[]);
      setSheets((fRes.data ?? []) as FileItem[]);
      setImpQs((iRes.data ?? []) as ImpQ[]);
      setWorksheets((wRes.data ?? []) as FileItem[]);
      setOnePagers((oRes.data ?? []) as FileItem[]);
      setBookmarks(new Set(((bRes.data ?? []) as any[]).map((b) => b.question_id)));
    })();
  }, [chapterId]);

  const toggleBookmark = useCallback(
    async (qId: string) => {
      if (!userId) return;
      const wasBookmarked = bookmarks.has(qId);
      const next = new Set(bookmarks);
      if (wasBookmarked) next.delete(qId);
      else next.add(qId);
      setBookmarks(next);
      if (wasBookmarked) {
        await supabase.from("bookmarks").delete().eq("user_id", userId).eq("question_id", qId);
      } else {
        await supabase.from("bookmarks").insert({ user_id: userId, question_id: qId });
      }
    },
    [bookmarks, userId],
  );

  return (
    <main className="px-5 pt-8 pb-6 animate-[fade-in_0.4s_ease-out]">
      <Link
        to="/subjects/$subjectId"
        params={{ subjectId }}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> {subjectName ?? "Chapters"}
      </Link>

      <header className="mb-7">
        {chapter === null ? (
          <>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-64 mt-2" />
          </>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold">
              Chapter {chapter.number}
            </p>
            <h1 className="text-2xl font-bold tracking-tight mt-1">{chapter.name}</h1>
          </>
        )}
      </header>

      <div className="space-y-8">
        <Section
          icon={FileText}
          title="Notes"
          items={notes}
          empty="No notes uploaded yet for this chapter"
          render={(n) => (
            <FileCard
              key={n.id}
              title={n.title || "Notes"}
              hint="PDF · Tap to open"
              onClick={() => openFile(n.file_url)}
            />
          )}
        />

        <Section
          icon={Sigma}
          title="Formula Sheets"
          items={sheets}
          empty="No formula sheets uploaded yet for this chapter"
          render={(f) => (
            <FileCard
              key={f.id}
              title="Formula sheet"
              hint="Quick reference"
              onClick={() => openFile(f.file_url)}
            />
          )}
        />

        <Section
          icon={HelpCircle}
          title="Important Questions"
          items={impQs}
          empty="No important questions added yet for this chapter"
          render={(q) => (
            <QuestionCard
              key={q.id}
              question={q}
              bookmarked={bookmarks.has(q.id)}
              onToggle={() => toggleBookmark(q.id)}
              canBookmark={!!userId}
            />
          )}
        />

        <Section
          icon={ClipboardList}
          title="Worksheets"
          items={worksheets}
          empty="No worksheets uploaded yet for this chapter"
          render={(w) => (
            <FileCard
              key={w.id}
              title="Worksheet"
              hint="Practice set · Tap to open"
              onClick={() => openFile(w.file_url)}
            />
          )}
        />

        <Section
          icon={FileType2}
          title="One-Pagers"
          items={onePagers}
          empty="No one-pagers uploaded yet for this chapter"
          render={(o) => (
            <FileCard
              key={o.id}
              title="One-pager"
              hint="Revision summary"
              onClick={() => openFile(o.file_url)}
            />
          )}
        />
      </div>
    </main>
  );
}

function Section<T>({
  icon: Icon,
  title,
  items,
  empty,
  render,
}: {
  icon: LucideIcon;
  title: string;
  items: T[] | null;
  empty: string;
  render: (item: T) => React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg grid place-items-center bg-primary/15 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        {items && items.length > 0 && (
          <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-surface border border-border/60 rounded-full px-2 py-0.5">
            {items.length}
          </span>
        )}
      </div>

      {items === null ? (
        <div className="space-y-2.5">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">{empty}</p>
        </div>
      ) : (
        <div className="space-y-2.5">{items.map(render)}</div>
      )}
    </section>
  );
}

function FileCard({
  title,
  hint,
  onClick,
}: {
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-surface border border-border/60 p-4 flex items-center gap-3 hover:border-primary/40 hover:bg-surface-elevated transition-all active:scale-[0.99] shadow-card"
    >
      <div className="h-10 w-10 rounded-xl grid place-items-center bg-primary/15 text-primary">
        <FileText className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

const DIFFICULTY_STYLES: Record<ImpQ["difficulty"], string> = {
  easy: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  hard: "bg-destructive/15 text-destructive border-destructive/30",
};

function QuestionCard({
  question,
  bookmarked,
  onToggle,
  canBookmark,
}: {
  question: ImpQ;
  bookmarked: boolean;
  onToggle: () => void;
  canBookmark: boolean;
}) {
  const diff = question.difficulty?.toLowerCase() as ImpQ["difficulty"];
  return (
    <div className="rounded-2xl bg-surface border border-border/60 p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border",
            DIFFICULTY_STYLES[diff] ?? DIFFICULTY_STYLES.medium,
          )}
        >
          {diff ?? "medium"}
        </span>
        <button
          onClick={onToggle}
          disabled={!canBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}
          className={cn(
            "h-8 w-8 grid place-items-center rounded-lg transition-all",
            bookmarked
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
            !canBookmark && "opacity-50",
          )}
        >
          <Bookmark
            className="h-4 w-4"
            strokeWidth={2}
            fill={bookmarked ? "currentColor" : "none"}
          />
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{question.question}</p>
    </div>
  );
}
