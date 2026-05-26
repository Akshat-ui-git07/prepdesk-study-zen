import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { useSubjects } from "@/components/admin/useSubjectChapterOptions";

export const Route = createFileRoute("/admin/_panel/exam-schedule")({
  component: ExamSchedulePage,
});

function ExamSchedulePage() {
  const { opts, map } = useSubjects();
  return (
    <ResourceManager
      table="exam_schedule"
      title="Exam schedule"
      description="Upcoming exam dates shown on student home."
      orderBy={{ column: "date" }}
      fields={[
        { name: "exam_name", label: "Exam name", type: "text", required: true, placeholder: "Half-Yearly: English" },
        { name: "date", label: "Date & time", type: "datetime", required: true },
        { name: "subject_id", label: "Subject (optional)", type: "select", options: opts },
      ]}
      columns={[
        { key: "exam_name", label: "Exam" },
        { key: "date", label: "When", render: (r) => new Date(r.date).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) },
        { key: "subject_id", label: "Subject", render: (r) => (r.subject_id ? map[r.subject_id] : "—") },
      ]}
    />
  );
}
