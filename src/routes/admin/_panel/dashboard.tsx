import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, Calendar, KeyRound, MessageSquare, Users, FileText,
  ArrowUpRight, Clock,
} from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

export const Route = createFileRoute("/admin/_panel/dashboard")({
  component: Dashboard,
});

type Stats = {
  subjects: number;
  chapters: number;
  students: number;
  pendingContribs: number;
  invitesTotal: number;
  invitesUsed: number;
  upcomingExams: { id: string; exam_name: string; date: string }[];
  recentContribs: { id: string; type: string; content: string; created_at: string }[];
};

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [subjects, chapters, students, pending, invitesAll, invitesUsed, exams, recent] = await Promise.all([
        supabase.from("subjects").select("id", { count: "exact", head: true }),
        supabase.from("chapters").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("contributions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("invite_codes").select("id", { count: "exact", head: true }),
        supabase.from("invite_codes").select("id", { count: "exact", head: true }).not("used_by", "is", null),
        supabase.from("exam_schedule").select("id, exam_name, date").gte("date", new Date().toISOString()).order("date").limit(5),
        supabase.from("contributions").select("id, type, content, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        subjects: subjects.count ?? 0,
        chapters: chapters.count ?? 0,
        students: students.count ?? 0,
        pendingContribs: pending.count ?? 0,
        invitesTotal: invitesAll.count ?? 0,
        invitesUsed: invitesUsed.count ?? 0,
        upcomingExams: (exams.data ?? []) as any,
        recentContribs: (recent.data ?? []) as any,
      });
    })();
  }, []);

  const cards = [
    { label: "Subjects", value: stats?.subjects, icon: BookOpen, to: "/admin/subjects" },
    { label: "Chapters", value: stats?.chapters, icon: FileText, to: "/admin/chapters" },
    { label: "Students", value: stats?.students, icon: Users, to: "/admin/students" },
    { label: "Pending review", value: stats?.pendingContribs, icon: MessageSquare, to: "/admin/contributions" },
    {
      label: "Invites used",
      value: stats ? `${stats.invitesUsed}/${stats.invitesTotal}` : undefined,
      icon: KeyRound, to: "/admin/invite-codes",
    },
    { label: "Upcoming exams", value: stats?.upcomingExams.length, icon: Calendar, to: "/admin/exam-schedule" },
  ];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your Prepdesk content and students.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="group rounded-2xl border border-border/60 bg-surface/40 p-4 hover:bg-surface-elevated/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-3">
              {value === undefined ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p className="text-2xl font-semibold tracking-tight">{value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Panel title="Upcoming exams" to="/admin/exam-schedule">
          {!stats ? (
            <Skeleton className="h-20 w-full" />
          ) : stats.upcomingExams.length === 0 ? (
            <Empty label="No upcoming exams scheduled." />
          ) : (
            <ul className="divide-y divide-border/60">
              {stats.upcomingExams.map((e) => (
                <li key={e.id} className="py-2.5 flex items-center justify-between gap-3">
                  <span className="text-sm truncate">{e.exam_name}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent contributions" to="/admin/contributions">
          {!stats ? (
            <Skeleton className="h-20 w-full" />
          ) : stats.recentContribs.length === 0 ? (
            <Empty label="No contributions yet." />
          ) : (
            <ul className="divide-y divide-border/60">
              {stats.recentContribs.map((c) => (
                <li key={c.id} className="py-2.5 flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.type}</p>
                    <p className="text-sm truncate">{c.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface/40 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link to={to} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground py-4 text-center">{label}</p>;
}
