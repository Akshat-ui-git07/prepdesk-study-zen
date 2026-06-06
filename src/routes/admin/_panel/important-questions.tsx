import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { useSubjects, useChapters } from "@/components/admin/useSubjectChapterOptions";

export const Route = createFileRoute("/admin/_panel/important-questions")({
  component: ImpQPage,
});

function ImpQPage() {
  const { opts: subjectOpts, map: subjectMap } = useSubjects();
  const { opts: chapterOpts, map: chapterMap } = useChapters();
  return (
    <ResourceManager
      table="important_questions"
      title="Important questions"
      orderBy={{ column: "created_at", ascending: false }}
      fields={[
        { name: "subject_id", label: "Subject", type: "select", required: true, options: subjectOpts },
        { name: "chapter_id", label: "Chapter", type: "select", required: true, options: chapterOpts },
        { name: "question", label: "Question", type: "textarea", required: true },
        { name: "answer", label: "Answer", type: "textarea", required: true },
        {
          name: "difficulty", label: "Difficulty", type: "select", required: true, defaultValue: "medium",
          options: [
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ],
        },
      ]}
      columns={[
        { key: "question", label: "Question", render: (r) => <div className="max-w-md line-clamp-2">{r.question}</div> },
        { key: "subject_id", label: "Subject", render: (r) => subjectMap[r.subject_id] ?? "—" },
        { key: "chapter_id", label: "Chapter", render: (r) => chapterMap[r.chapter_id] ?? "—" },
        { key: "difficulty", label: "Difficulty", render: (r) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-surface-elevated border border-border/60">
            {r.difficulty}
          </span>
        ) },
      ]}
    />
  );
}
