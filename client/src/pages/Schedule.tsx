import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useTasks } from "@/hooks/use-tasks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddTaskModal } from "@/components/AddTaskModal";
import type { LocalTask } from "@/hooks/use-tasks";
import { format, isSameDay } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarDays, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Schedule() {
  const { toast } = useToast();
  const tasksApi = useTasks();
  const [addOpen, setAddOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [editing, setEditing] = useState<LocalTask | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const groups = useMemo(() => {
    const items = tasksApi.filtered
      .slice()
      .map((t) => ({ t, dt: new Date(`${t.date}T${t.time}:00`) }))
      .sort((a, b) => a.dt.getTime() - b.dt.getTime());

    const result: { day: Date; tasks: LocalTask[] }[] = [];
    for (const it of items) {
      const existing = result.find((g) => isSameDay(g.day, it.dt));
      if (existing) existing.tasks.push(it.t);
      else result.push({ day: it.dt, tasks: [it.t] });
    }
    return result;
  }, [tasksApi.filtered]);

  function openCreate() {
    setMode("create");
    setEditing(null);
    setAddOpen(true);
  }

  function openEdit(task: LocalTask) {
    setMode("edit");
    setEditing(task);
    setAddOpen(true);
  }

  return (
    <div className="min-h-screen bg-aurora">
      <Navbar
        search={tasksApi.search}
        onSearchChange={tasksApi.setSearch}
        onOpenAdd={openCreate}
        onOpenNotifications={() => setNotifOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <section className="animate-float-in">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Schedule</h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
                A calm, chronological view — perfect for scanning what’s next.
              </p>
            </div>
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {groups.length === 0 ? (
              <Card className="p-10 shadow-premium text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-muted">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="mt-3 text-lg font-semibold tracking-tight">Nothing scheduled</div>
                <div className="mt-1 text-sm text-muted-foreground">Create a task and it’ll appear here.</div>
              </Card>
            ) : (
              groups.map((g) => (
                <Card key={g.day.toISOString()} className="p-4 sm:p-5 shadow-premium">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-lg font-semibold tracking-tight">{format(g.day, "EEEE, MMM d")}</div>
                    <div className="text-sm text-muted-foreground">{g.tasks.length} tasks</div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    {g.tasks.map((t) => (
                      <button
                        key={String(t.id)}
                        type="button"
                        onClick={() => openEdit(t)}
                        className="rounded-2xl border bg-card p-4 text-left transition-all duration-300 hover-elevate active-elevate-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-base font-semibold tracking-tight">{t.title}</div>
                            <div className="mt-1 text-sm text-muted-foreground">{t.time}</div>
                            {t.description ? (
                              <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{t.description}</div>
                            ) : null}
                          </div>
                          <StatusBadge status={t.status as any} />
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>

      <AddTaskModal
        open={addOpen}
        onOpenChange={setAddOpen}
        mode={mode}
        initialTask={editing}
        onCreate={(data) => {
          tasksApi.createTask(data);
          toast({ title: "Task created", description: "Scheduled and ready." });
        }}
        onUpdate={(id, updates) => {
          tasksApi.updateTask(id, updates);
          toast({ title: "Saved", description: "Schedule updated." });
        }}
      />
    </div>
  );
}
