import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell, Moon, Plus, Search, Sun, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function Navbar(props: {
  search: string;
  onSearchChange: (v: string) => void;
  onOpenAdd: () => void;
  onOpenNotifications: () => void;
}) {
  const { search, onSearchChange, onOpenAdd, onOpenNotifications } = props;
  const [location] = useLocation();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const navItems = useMemo(
    () => [
      { label: "Overview", href: "/" },
      { label: "Schedule", href: "/schedule" },
      { label: "Settings", href: "/settings" },
      { label: "Guide", href: "/guide" },
    ],
    [],
  );

  return (
    <header className="sticky top-0 z-[999] border-b bg-background/80 backdrop-blur-xl">
      <div className="bg-aurora">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="group flex items-center gap-3 rounded-xl px-2 py-1 transition-all duration-300 hover:opacity-80"
              >
                <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
                  <div className="absolute inset-0 rounded-2xl bg-white/10 mix-blend-overlay" />
                  <CheckCircle2 className="relative h-6 w-6 text-white drop-shadow-sm" />
                </div>
                <div className="leading-tight">
                  <div className="text-lg font-bold tracking-tight bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Taskly
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">Stay organized.</div>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((it) => {
                  const active = location === it.href;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={cn(
                        "rounded-xl px-3 py-2 text-sm font-medium tracking-tight transition-all duration-200 hover-elevate active-elevate-2",
                        active ? "toggle-elevate toggle-elevated" : "text-muted-foreground",
                      )}
                    >
                      {it.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
              <div className="hidden sm:block w-full max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search tasks, dates, notes…"
                    type="search"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={onOpenNotifications}
                      aria-label="Notifications"
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={onOpenAdd}
                      className="hidden sm:inline-flex bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 border-0 text-white shadow-lg shadow-purple-500/25"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add task
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create a new task</TooltipContent>
                </Tooltip>

                <Button
                  type="button"
                  size="icon"
                  onClick={onOpenAdd}
                  className="sm:hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 border-0 text-white shadow-lg shadow-purple-500/25"
                  aria-label="Add task"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setDark((d) => !d)}
                      aria-label="Toggle dark mode"
                    >
                      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{dark ? "Light mode" : "Dark mode"}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="sm:hidden pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tasks…"
                type="search"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
