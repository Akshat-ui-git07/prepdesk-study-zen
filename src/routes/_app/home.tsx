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
  const [loadedProfile, setLoadedProfile] = useState(false);
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

      const emailLocal = user.email?.split("@")[0] ?? "";
      const metaName =
        (user.user_metadata?.name as string | undefined) ??
        (user.user_metadata?.full_name as string | undefined) ??
        "";
      const resolvedName =
        (p?.name && p.name.trim()) ||
        (metaName && metaName.trim()) ||
        (emailLocal && emailLocal.replace(/[._-]+/g, " ")) ||
        "Student";

      setProfile({ name: resolvedName, section: p?.section ?? "—" });
      setLoadedProfile(true);
      setStats({ chapters: cCount ?? 0, papers: pCount ?? 0 });
      setNextExam(exam ?? null);
    })();
  }, []);

  const examDate = nextExam ? new Date(nextExam.date) : null;
  const daysLeft = examDate
    ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / 86400000))
    : null;

  const firstName = profile?.name?.split(" ")[0] ?? "";

  return (
    <main className="px-5 pt-10 pb-6 animate-[fade-in_0.4s_ease-out]">
      <header className="flex items-start justify-between mb-7">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          {loadedProfile && profile ? (
            <h1 className="text-2xl font-bold tracking-tight mt-0.5">
              {firstName}
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
            {firstName?.[0]?.toUpperCase() ?? "·"}
          </div>
        </div>
      </header>


      {/* Exam countdown */}
      <section
        className="relative overflow-hidden rounded-2xl p-8 shadow-elevated"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.55 0.22 255) 0%, oklch(0.48 0.24 270) 60%, oklch(0.42 0.20 285) 100%)",
        }}
      >
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative">
          {nextExam === undefined ? (
            <>
              <Skeleton className="h-3 w-24 bg-white/20" />
              <Skeleton className="h-20 w-44 mt-4 bg-white/20" />
              <Skeleton className="h-4 w-56 mt-3 bg-white/20" />
            </>
          ) : nextExam === null ? (
            <div className="py-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/80 uppercase tracking-[0.15em]">
                <Flame className="h-3.5 w-3.5" /> Exam schedule
              </div>
              <p className="mt-4 text-white text-xl font-semibold tracking-tight" style={{ fontFamily: "Sora" }}>
                No upcoming exams scheduled
              </p>
              <p className="mt-1.5 text-white/70 text-sm">Check back once new dates are added.</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/80 uppercase tracking-[0.15em]">
                  <Flame className="h-3.5 w-3.5" /> Next exam
                </div>
                <p
                  className="text-xs text-white/85 whitespace-nowrap"
                  style={{ fontFamily: "DM Sans, system-ui" }}
                >
                  {examDate!.toLocaleDateString("en-GB", {
                    weekday: "short", day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>

              <div className="mt-5 flex items-baseline gap-3">
                <span
                  className="text-6xl font-bold text-white tracking-tight leading-none"
                  style={{ fontFamily: "Sora" }}
                >
                  {daysLeft}
                </span>
                <span className="text-white/85 text-sm font-medium">
                  {daysLeft === 0
                    ? `today — ${nextExam.exam_name}`
                    : `${daysLeft === 1 ? "day" : "days"} until ${nextExam.exam_name}`}
                </span>
              </div>

              {/* Proximity bar */}
              <div className="mt-7">
                <div className="h-1 w-full rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white/90 transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(4, 100 - (daysLeft! / 60) * 100))}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-white/60">
                  <span>Today</span>
                  <span>Exam day</span>
                </div>
              </div>
            </>
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
