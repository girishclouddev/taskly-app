import { useEffect, useMemo, useState } from "react";
import type { LocalTask } from "@/hooks/use-tasks";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Pencil, Trash2, Code, Megaphone, Video, Briefcase, FileSignature, MonitorPlay, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function getTaskTheme(title: string) {
  const t = title.toLowerCase();
  if (t.includes("meeting") || t.includes("call") || t.includes("sync")) return { icon: Video, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20", gradient: "from-indigo-500/10" };
  if (t.includes("design") || t.includes("ui") || t.includes("ux") || t.includes("figma")) return { icon: MonitorPlay, color: "text-pink-500", bg: "bg-pink-500/10 border-pink-500/20", gradient: "from-pink-500/10" };
  if (t.includes("code") || t.includes("dev") || t.includes("api") || t.includes("bug") || t.includes("test")) return { icon: Code, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", gradient: "from-emerald-500/10" };
  if (t.includes("marketing") || t.includes("campaign") || t.includes("post") || t.includes("social")) return { icon: Megaphone, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20", gradient: "from-orange-500/10" };
  if (t.includes("idea") || t.includes("plan") || t.includes("think") || t.includes("review")) return { icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20", gradient: "from-purple-500/10" };
  return { icon: Briefcase, color: "text-primary/70", bg: "bg-muted/50 border-border/50", gradient: "from-primary/5" };
}

export function TaskList(props: {
  tasks: LocalTask[];
  onComplete: (id: LocalTask["id"]) => void;
  onDelete: (id: LocalTask["id"]) => void;
  onEdit: (task: LocalTask) => void;
}) {
  const { tasks, onComplete, onDelete, onEdit } = props;
  const empty = useMemo(() => tasks.length === 0, [tasks.length]);

  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
  const visibleTasks = useMemo(() => {
    return tasks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  }, [tasks, page]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#task-")) {
        const id = hash.replace("#task-", "");

        // Find which page this task is on and navigate to it
        const taskIdx = tasks.findIndex((t) => String(t.id) === id);
        if (taskIdx >= 0) {
          const reqPage = Math.floor(taskIdx / ITEMS_PER_PAGE) + 1;
          setPage(reqPage);
        }

        setTimeout(() => {
          setHighlightId(id);
          const el = document.getElementById(`task-${id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }

          // Instantly remove the hash ID from the browser URL so it stays hidden from user
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }, 100);

        setTimeout(() => setHighlightId(null), 4000);
      }
    };

    handleHash();

    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [tasks]);

  return (
    <section className="mt-8 relative z-10">
      <div className="flex items-end justify-between gap-2 flex-wrap mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Tasks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Click a task to edit. Reminders trigger at scheduled time.
          </p>
        </div>
        <div className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
          {tasks.length} total
        </div>
      </div>

      {empty ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-10 shadow-premium border-dashed border-2 bg-background/50 backdrop-blur-sm">
            <div className="mx-auto max-w-md text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                <FileSignature className="h-8 w-8" />
              </div>
              <div className="text-xl font-semibold tracking-tight">No tasks yet</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Add your first task and Taskly will remind you exactly when it matters.
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3 pb-8">
          <AnimatePresence mode="popLayout">
            {visibleTasks.map((t, idx) => {
              const theme = getTaskTheme(t.title);
              const isHighlighted = highlightId === String(t.id);
              const Icon = theme.icon;

              return (
                <motion.div
                  key={String(t.id)}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.4) }}
                  id={`task-${t.id}`}
                >
                  <Card
                    className={cn(
                      "group relative overflow-hidden shadow-premium hover-elevate transition-all duration-300 border backdrop-blur-xl bg-gradient-to-r to-background/90 rounded-2xl",
                      theme.gradient,
                      isHighlighted ? "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse-glow" : ""
                    )}
                  >
                    <div className={cn("absolute right-0 -bottom-8 opacity-[0.03] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 pointer-events-none", theme.color)}>
                      <Icon className="h-48 w-48" />
                    </div>
                    {isHighlighted && <div className="absolute inset-0 bg-primary/5 pointer-events-none" />}

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5">
                      <button
                        type="button"
                        onClick={() => onEdit(t)}
                        className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left focus:outline-none w-full"
                      >
                        <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl border bg-background/50 backdrop-blur-md shadow-sm", theme.bg, theme.color)}>
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="font-semibold text-lg tracking-tight truncate">{t.title}</div>
                            <StatusBadge status={t.status as any} />
                          </div>

                          {t.description ? (
                            <div className="text-sm text-muted-foreground truncate">{t.description}</div>
                          ) : (
                            <div className="text-sm text-muted-foreground italic opacity-50">No description</div>
                          )}
                        </div>

                        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-foreground/80 bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/5 whitespace-nowrap shadow-sm">
                          <span>{t.date}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{t.time}</span>
                        </div>
                      </button>

                      <div className="flex justify-between items-center w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50 gap-3">
                        <div className="sm:hidden flex items-center gap-2 text-xs font-semibold text-foreground/80 bg-background/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-black/5 dark:border-white/5 whitespace-nowrap shadow-sm">
                          <span>{t.date}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{t.time}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button type="button" size="sm" variant="secondary" onClick={() => onComplete(t.id)} className="h-9 shadow-sm whitespace-nowrap bg-background/80 hover:bg-background/100 backdrop-blur-md border border-border/50">
                            <Check className="h-4 w-4 mr-1.5 text-primary" /> Complete
                          </Button>
                          <Button type="button" size="icon" variant="outline" onClick={() => onEdit(t)} className="h-9 w-9 bg-background/50 backdrop-blur-md border border-border/50">
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button type="button" size="icon" variant="destructive" onClick={() => onDelete(t.id)} className="h-9 w-9 opacity-80 hover:opacity-100 shadow-sm border border-destructive/20">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2 font-medium text-sm">
              <div className="text-muted-foreground">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, tasks.length)} of {tasks.length} tasks
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-background/50 backdrop-blur-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = page === pageNum;
                    return (
                      <Button
                        key={pageNum}
                        type="button"
                        variant={isActive ? "default" : "outline"}
                        size="icon"
                        className={cn(
                          "h-8 w-8",
                          isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-background/50 backdrop-blur-sm text-foreground/80 hover:bg-background/80 hover:text-foreground"
                        )}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-background/50 backdrop-blur-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
