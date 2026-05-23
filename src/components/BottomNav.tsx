import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, Target, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/practice", label: "Practice", icon: Target },
  { to: "/contribute", label: "Contribute", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 safe-bottom pointer-events-none">
      <div className="mx-auto max-w-md px-3 pb-2 pointer-events-auto">
        <div className="glass border border-border/60 rounded-2xl shadow-elevated flex items-center justify-between px-2 py-2">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/home" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-xl transition-all",
                    active && "gradient-primary shadow-glow"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
                </div>
                <span className={cn("text-[10px] font-medium tracking-wide", active && "text-foreground")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
