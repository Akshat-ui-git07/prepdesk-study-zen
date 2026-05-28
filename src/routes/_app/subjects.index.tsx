import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { Atom, FlaskConical, Sigma, ChevronRight, type LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_app/subjects/")({
  component: SubjectsIndex,
});

type Subject = { id: string; name: string };

const VISUALS: Record<string, { icon: LucideIcon; gradient: string; tag: string }> = {
  physics: {
    icon: Atom,
    gradient: "linear-gradient(135deg, oklch(0.55 0.22 255) 0%, oklch(0.48 0.24 270) 100%)",
    tag: "Mechanics · Waves · Modern",
  },
  chemistry: {
    icon: FlaskConical,
    gradient: "linear-gradient(135deg, oklch(0.62 0.20 165) 0%, oklch(0.48 0.18 200) 100%)",
    tag: "Physical · Organic · Inorganic",
  },
  mathematics: {
    icon: Sigma,
    gradient: "linear-gradient(135deg, oklch(0.65 0.20 30) 0%, oklch(0.52 0.22 350) 100%)",
    tag: "Algebra · Calculus · Geometry",
  },
};

function visualFor(name: string) {
  const key = name.toLowerCase();
  if (key.includes("phys")) return VISUALS.physics;
  if (key.includes("chem")) return VISUALS.chemistry;
  if (key.includes("math")) return VISUALS.mathematics;
  return {
    icon: Atom,
    gradient: "linear-gradient(135deg, oklch(0.55 0.22 258) 0%, oklch(0.45 0.20 280) 100%)",
    tag: "Chapters & resources",
  };
}

function SubjectsIndex() {
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data: subs } = await supabase.from("subjects").select("id, name").order("name");
      setSubjects(subs ?? []);
      const { data: chs } = await supabase.from("chapters").select("subject_id");
      const map: Record<string, number> = {};
      (chs ?? []).forEach((c: any) => {
        map[c.subject_id] = (map[c.subject_id] ?? 0) + 1;
      });
      setCounts(map);
    })();
  }, []);

  return (
    <main className="px-5 pt-10 pb-6 animate-[fade-in_0.4s_ease-out]">
      <header className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
        <p className="text-sm text-muted-foreground mt-1">Pick a subject to dive into chapters & resources.</p>
      </header>

      <div className="space-y-3">
        {subjects === null
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))
          : subjects.length === 0
          ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-sm font-medium">No subjects yet</p>
              <p className="text-xs text-muted-foreground mt-1">Check back soon.</p>
            </div>
          )
          : subjects.map((s) => {
              const v = visualFor(s.name);
              const Icon = v.icon;
              const chCount = counts[s.id] ?? 0;
              return (
                <Link
                  key={s.id}
                  to="/subjects/$subjectId"
                  params={{ subjectId: s.id }}
                  className="block group active:scale-[0.99] transition-transform"
                >
                  <div
                    className="relative overflow-hidden rounded-2xl p-5 shadow-card border border-white/5"
                    style={{ background: v.gradient }}
                  >
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                    <div className="relative flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur grid place-items-center text-white shadow-glow">
                        <Icon className="h-7 w-7" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/80 font-semibold">
                          {v.tag}
                        </p>
                        <h2
                          className="text-xl font-bold text-white tracking-tight mt-0.5"
                          style={{ fontFamily: "Sora" }}
                        >
                          {s.name}
                        </h2>
                        <p className="text-xs text-white/80 mt-1">
                          {chCount} {chCount === 1 ? "chapter" : "chapters"}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </main>
  );
}
