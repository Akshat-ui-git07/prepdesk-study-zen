import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BookMarked, BookOpen, Calendar, ChevronDown, FileText, FlaskConical,
  GraduationCap, HelpCircle, KeyRound, LayoutDashboard, LayoutGrid, ListChecks,
  LogOut, MessageSquare, Shield, Sparkles, StickyNote, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_panel")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/admin" });
    const { data: roles } = await supabase
      .from("user_roles").select("role").eq("user_id", session.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/admin" });
  },
  component: AdminPanel,
});

const contentItems = [
  { to: "/admin/subjects", label: "Subjects", icon: LayoutGrid },
  { to: "/admin/chapters", label: "Chapters", icon: BookOpen },
  { to: "/admin/notes", label: "Notes", icon: StickyNote },
  { to: "/admin/worksheets", label: "Worksheets", icon: ListChecks },
  { to: "/admin/formula-sheets", label: "Formula sheets", icon: FlaskConical },
  { to: "/admin/one-pagers", label: "One-pagers", icon: FileText },
  { to: "/admin/important-questions", label: "Important questions", icon: HelpCircle },
  { to: "/admin/past-papers", label: "Past papers", icon: BookMarked },
  { to: "/admin/practice-papers", label: "Practice papers", icon: GraduationCap },
] as const;

const topItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/invite-codes", label: "Invite codes", icon: KeyRound },
] as const;

const bottomItems = [
  { to: "/admin/contributions", label: "Contributions", icon: MessageSquare },
  { to: "/admin/exam-schedule", label: "Exam schedule", icon: Calendar },
  { to: "/admin/students", label: "Students", icon: Users },
] as const;

const allMobile = [
  ...topItems,
  ...contentItems,
  ...bottomItems,
] as const;

function AdminPanel() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string>("");
  const contentActive = contentItems.some((i) => pathname.startsWith(i.to));
  const [contentOpen, setContentOpen] = useState(contentActive);

  useEffect(() => { if (contentActive) setContentOpen(true); }, [contentActive]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  };

  const NavLink = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => {
    const active = pathname === to || pathname.startsWith(to + "/");
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
          active ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60"
        )}
      >
        <Icon className={cn("h-4 w-4", active && "text-primary")} />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex w-full">
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border/60 bg-surface/40 backdrop-blur sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary grid place-items-center shadow-glow">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Prepdesk</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {topItems.map((i) => <NavLink key={i.to} {...i} />)}

          <button
            onClick={() => setContentOpen((v) => !v)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              contentActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60"
            )}
          >
            <span className="flex items-center gap-3">
              <BookOpen className={cn("h-4 w-4", contentActive && "text-primary")} />
              Content
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", contentOpen && "rotate-180")} />
          </button>
          {contentOpen && (
            <div className="ml-3 pl-3 border-l border-border/60 space-y-0.5">
              {contentItems.map((i) => <NavLink key={i.to} {...i} />)}
            </div>
          )}

          {bottomItems.map((i) => <NavLink key={i.to} {...i} />)}
        </nav>
        <div className="border-t border-border/60 p-3 space-y-2">
          <Link to="/home" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60">
            <Sparkles className="h-3.5 w-3.5" /> Back to student app
          </Link>
          <div className="px-3 text-[11px] text-muted-foreground truncate">{email}</div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 glass border-b border-border/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Admin</span>
        </div>
        <button onClick={signOut} className="text-xs text-muted-foreground">Sign out</button>
      </div>

      <main className="flex-1 min-w-0">
        {/* Mobile horizontal nav */}
        <div className="md:hidden mt-14 overflow-x-auto border-b border-border/60 bg-surface/40 backdrop-blur">
          <div className="flex gap-1 px-3 py-2 w-max">
            {allMobile.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors",
                  active ? "bg-primary/20 text-foreground" : "text-muted-foreground"
                )}>
                  <Icon className="h-3.5 w-3.5" /> {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="px-5 md:px-8 py-6 md:py-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
