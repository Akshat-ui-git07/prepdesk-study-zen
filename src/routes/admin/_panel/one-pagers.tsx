import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { useChapters } from "@/components/admin/useSubjectChapterOptions";

export const Route = createFileRoute("/admin/_panel/one-pagers")({
  component: OnePagersPage,
});

function OnePagersPage() {
  const { opts, map } = useChapters();
  return (
    <ResourceManager
      table="one_pagers"
      title="One-pagers"
      orderBy={{ column: "created_at", ascending: false }}
      fields={[
        { name: "chapter_id", label: "Chapter", type: "select", required: true, options: opts },
        { name: "file_url", label: "File URL", type: "text", required: true, placeholder: "https://..." },
      ]}
      columns={[
        { key: "chapter_id", label: "Chapter", render: (r) => map[r.chapter_id] ?? "—" },
        { key: "file_url", label: "File", render: (r) => <a href={r.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">Open</a> },
      ]}
    />
  );
}
