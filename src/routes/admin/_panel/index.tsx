import { createFileRoute, redirect } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/_panel/")({
  beforeLoad: () => { throw redirect({ to: "/admin/subjects" }); },
});

export default function _() { return <ResourceManager table="subjects" title="Subjects" fields={[]} columns={[]} />; }
