import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { useSubjects } from "@/components/admin/useSubjectChapterOptions";

export const Route = createFileRoute("/admin/_panel/practice-papers")({
  component: PracticePapersPage,
});

function PracticePapersPage() {
  const { opts, map } = useSubjects();
  return (
    <ResourceManager
      table="practice_papers"
      title="Practice papers"
      description="Questions are stored as JSON. Example: [{ &quot;q&quot;: &quot;...&quot;, &quot;marks&quot;: 4 }]"
      orderBy={{ column: "created_at", ascending: false }}
      fields={[
        { name: "subject_id", label: "Subject", type: "select", required: true, options: opts },
        { name: "title", label: "Title", type: "text", required: true },
        { name: "questions_json", label: "Questions (JSON array)", type: "json", required: true, placeholder: '[\n  { "q": "Define velocity", "marks": 2 }\n]' },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "subject_id", label: "Subject", render: (r) => map[r.subject_id] ?? "—" },
        { key: "questions_json", label: "Questions", render: (r) => <span className="text-xs text-muted-foreground">{Array.isArray(r.questions_json) ? `${r.questions_json.length} items` : "—"}</span> },
      ]}
    />
  );
}
