import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/_panel/subjects")({
  component: () => (
    <ResourceManager
      table="subjects"
      title="Subjects"
      description="Top-level subjects students see in the app."
      orderBy={{ column: "name" }}
      fields={[{ name: "name", label: "Name", type: "text", required: true, placeholder: "Physics" }]}
      columns={[{ key: "name", label: "Name" }]}
    />
  ),
});
