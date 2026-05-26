import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { useSubjects } from "@/components/admin/useSubjectChapterOptions";

export const Route = createFileRoute("/admin/_panel/chapters")({
  component: ChaptersPage,
});

function ChaptersPage() {
  const { opts, map } = useSubjects();
  return (
    <ResourceManager
      table="chapters"
      title="Chapters"
      description="Chapters grouped under each subject."
      orderBy={{ column: "number" }}
      fields={[
        { name: "subject_id", label: "Subject", type: "select", required: true, options: opts },
        { name: "number", label: "Chapter number", type: "number", required: true },
        { name: "name", label: "Name", type: "text", required: true, placeholder: "Motion in a Plane" },
      ]}
      columns={[
        { key: "number", label: "#" },
        { key: "name", label: "Name" },
        { key: "subject_id", label: "Subject", render: (r) => map[r.subject_id] ?? "—" },
      ]}
    />
  );
}
