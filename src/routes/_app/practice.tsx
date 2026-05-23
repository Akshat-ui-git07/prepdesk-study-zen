import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_app/practice")({
  component: () => (
    <main className="px-5 pt-10 pb-6 animate-[fade-in_0.4s_ease-out]">
      <h1 className="text-2xl font-bold tracking-tight">Practice</h1>
      <p className="text-sm text-muted-foreground mt-1">Timed practice papers across PCM.</p>
      <div className="mt-8 rounded-3xl border border-dashed border-border p-10 text-center">
        <div className="h-12 w-12 mx-auto rounded-2xl gradient-primary shadow-glow grid place-items-center text-primary-foreground text-xl">⏱</div>
        <p className="mt-4 text-sm font-medium">Coming up next</p>
        <p className="text-xs text-muted-foreground mt-1">Timed mode + score tracking soon.</p>
      </div>
    </main>
  ),
});
