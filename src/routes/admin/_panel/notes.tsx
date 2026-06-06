import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { useSubjects } from "@/components/admin/useSubjectChapterOptions";

export const Route = createFileRoute("/admin/_panel/notes")({
  component: NotesPage,
});

function NotesPage() {
  const { opts, map } = useSubjects();
  return (
    <ResourceManager
      table="notes"
      title="Notes"
      description="Upload chapter notes (PDF)."
      orderBy={{ column: "created_at", ascending: false }}
      fields={[
        { name: "subject_id", label: "Subject", type: "select", required: true, options: opts },
        { name: "title", label: "Title", type: "text", required: true, placeholder: "e.g. Kinematics Notes" },
        { name: "file_url", label: "File", type: "file", required: true },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "subject_id", label: "Subject", render: (r) => map[r.subject_id] ?? "—" },
        { key: "file_url", label: "File", render: (r) => <span className="text-xs text-muted-foreground truncate max-w-[200px] inline-block">{r.file_url?.split("/").pop()}</span> },
      ]}
    />
  );
}
