import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { useSubjects } from "@/components/admin/useSubjectChapterOptions";

export const Route = createFileRoute("/admin/_panel/past-papers")({
  component: PastPapersPage,
});

function PastPapersPage() {
  const { opts, map } = useSubjects();
  return (
    <ResourceManager
      table="past_papers"
      title="Past papers"
      orderBy={{ column: "year", ascending: false }}
      fields={[
        { name: "subject_id", label: "Subject", type: "select", required: true, options: opts },
        { name: "year", label: "Year", type: "number", required: true, placeholder: "2025" },
        { name: "school_name", label: "School", type: "text", required: true },
        { name: "file_url", label: "File URL", type: "text", required: true, placeholder: "https://..." },
      ]}
      columns={[
        { key: "year", label: "Year" },
        { key: "subject_id", label: "Subject", render: (r) => map[r.subject_id] ?? "—" },
        { key: "school_name", label: "School" },
        { key: "file_url", label: "File", render: (r) => <a href={r.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">Open</a> },
      ]}
    />
  );
}
