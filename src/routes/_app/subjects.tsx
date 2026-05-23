import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_app/subjects")({
  component: () => (
    <ComingSoon title="Subjects" subtitle="Physics · Chemistry · Math chapters will live here." />
  ),
});

function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <main className="px-5 pt-10 pb-6 animate-[fade-in_0.4s_ease-out]">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      <div className="mt-8 rounded-3xl border border-dashed border-border p-10 text-center">
        <div className="h-12 w-12 mx-auto rounded-2xl gradient-primary shadow-glow grid place-items-center text-primary-foreground text-xl">✨</div>
        <p className="mt-4 text-sm font-medium">Coming up next</p>
        <p className="text-xs text-muted-foreground mt-1">We'll build this in the next prompt.</p>
      </div>
    </main>
  );
}
