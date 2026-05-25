import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { BookOpen, FileText, Flame, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_app/home")({
  component: Home,
});

type Profile = { name: string; section: string };

type NextExam = { exam_name: string; date: string };

function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<{ chapters: number; papers: number } | null>(null);
  const [nextExam, setNextExam] = useState<NextExam | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const nowIso = new Date().toISOString();
      const [{ data: p }, { count: cCount }, { count: pCount }, { data: exam }] = await Promise.all([
        supabase.from("profiles").select("name, section").eq("id", user.id).maybeSingle(),
        supabase.from("chapters").select("*", { count: "exact", head: true }),
        supabase.from("practice_papers").select("*", { count: "exact", head: true }),
        supabase
          .from("exam_schedule")
          .select("exam_name, date")
          .gte("date", nowIso)
          .order("date", { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);
      setProfile(p);
      setStats({ chapters: cCount ?? 0, papers: pCount ?? 0 });
      setNextExam(exam ?? null);
    })();
  }, []);

  const examDate = nextExam ? new Date(nextExam.date) : null;
  const daysLeft = examDate
    ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / 86400000))
    : null;

  return (
    <main className="px-5 pt-10 pb-6 animate-[fade-in_0.4s_ease-out]">
      <header className="flex items-start justify-between mb-7">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          {profile ? (
            <h1 className="text-2xl font-bold tracking-tight mt-0.5">
              {profile.name.split(" ")[0]}
              <span className="ml-2 text-xs font-medium text-muted-foreground align-middle px-2 py-0.5 rounded-full bg-surface border border-border">
                Section {profile.section}
              </span>
            </h1>
          ) : (
            <Skeleton className="h-7 w-44 mt-1" />
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "DM Sans, system-ui" }}>
            {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </p>
          <div className="h-11 w-11 rounded-full gradient-primary grid place-items-center text-primary-foreground font-semibold shadow-glow">
            {profile?.name?.[0]?.toUpperCase() ?? "·"}
          </div>
        </div>
      </header>

      {/* Exam countdown */}
      <section className="relative overflow-hidden rounded-3xl gradient-primary p-6 shadow-elevated">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          {nextExam === undefined ? (
            <>
              <Skeleton className="h-3 w-24 bg-white/20" />
              <Skeleton className="h-4 w-32 mt-3 bg-white/20" />
              <Skeleton className="h-12 w-40 mt-3 bg-white/20" />
            </>
          ) : nextExam === null ? (
            <>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 uppercase tracking-wider">
                <Flame className="h-3.5 w-3.5" /> Exam schedule
              </div>
              <p className="mt-3 text-white text-base font-medium">No upcoming exams scheduled</p>
              <p className="mt-1 text-white/70 text-xs">Check back once new dates are added.</p>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 uppercase tracking-wider">
                  <Flame className="h-3.5 w-3.5" /> Next exam
                </div>
                <p className="mt-2 text-white text-sm">{nextExam.exam_name}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "Sora" }}>
                    {daysLeft}
                  </span>
                  <span className="text-white/80 text-sm">
                    {daysLeft === 0 ? "today" : daysLeft === 1 ? "day left" : "days left"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70">
                  {examDate!.toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 mt-4">
        <StatCard
          icon={BookOpen}
          label="Chapters"
          value={stats?.chapters}
          accent="Available"
        />
        <StatCard
          icon={FileText}
          label="Practice papers"
          value={stats?.papers}
          accent="Ready to attempt"
        />
      </section>

      {/* Quick actions */}
      <h2 className="mt-8 mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Jump back in
      </h2>
      <div className="space-y-2.5">
        <ActionRow icon={Sparkles} title="Ask the AI tutor" subtitle="Get instant PCM help" />
        <ActionRow icon={TrendingUp} title="Past paper analysis" subtitle="Frequently asked topics" />
        <ActionRow icon={FileText} title="Today's worksheet" subtitle="5 problems · ~15 min" />
      </div>

      {/* Recent updates */}
      <h2 className="mt-8 mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Recent updates
      </h2>
      <ul className="space-y-2.5">
        {(stats ? sampleFeed : Array(3).fill(null)).map((item, i) => (
          <li key={i} className="glass rounded-2xl p-4 border border-border/60">
            {item ? (
              <>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {item.tag}
                </div>
                <p className="mt-1.5 text-sm font-medium">{item.title}</p>
              </>
            ) : (
              <>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

const sampleFeed = [
  { tag: "Physics · Ch 4", title: "New notes uploaded: Motion in a Plane" },
  { tag: "Math · Practice", title: "Trigonometry practice paper added" },
  { tag: "Chemistry", title: "Formula sheet — Atomic Structure refreshed" },
];

function StatCard({
  icon: Icon, label, value, accent,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | undefined; accent: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border/60 p-4 shadow-card">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{accent}</span>
      </div>
      {value === undefined ? (
        <Skeleton className="h-8 w-12 mt-3" />
      ) : (
        <div className="mt-3 text-3xl font-bold tracking-tight" style={{ fontFamily: "Sora" }}>{value}</div>
      )}
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function ActionRow({
  icon: Icon, title, subtitle,
}: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }) {
  return (
    <button className="w-full text-left rounded-2xl bg-surface border border-border/60 p-4 flex items-center gap-3 hover:border-primary/40 hover:bg-surface-elevated transition-all active:scale-[0.99]">
      <div className="h-10 w-10 rounded-xl grid place-items-center bg-primary/15 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <span className="text-muted-foreground">›</span>
    </button>
  );
}
