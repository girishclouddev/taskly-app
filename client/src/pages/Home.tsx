import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardCards } from "@/components/DashboardCards";
import { TaskList } from "@/components/TaskList";
import { AddTaskModal } from "@/components/AddTaskModal";
import { AlarmModal } from "@/components/AlarmModal";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { useTasks, type LocalTask } from "@/hooks/use-tasks";
import { useReminder } from "@/hooks/use-reminder";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, SortAsc, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const { toast } = useToast();
  const tasksApi = useTasks();

  const [addOpen, setAddOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<LocalTask | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: LocalTask["id"] | null }>({
    open: false,
    id: null,
  });

  const reminder = useReminder({
    tasks: tasksApi.tasks,
    hasFired: tasksApi.hasReminderFired,
    setFired: tasksApi.setReminderFired,
    onMarkCompleted: tasksApi.markCompleted,
    onUpdateTask: (id, updates) => tasksApi.updateTask(id, updates as any),
  });

  const pageTasks = tasksApi.filtered;

  const headerFilters = useMemo(() => {
    return (
      <Card className="mt-6 p-4 shadow-premium">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Refine
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={tasksApi.statusFilter} onValueChange={(v) => tasksApi.setStatusFilter(v as any)}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tasksApi.sort} onValueChange={(v) => tasksApi.setSort(v as any)}>
              <SelectTrigger className="w-[170px]">
                <SortAsc className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soonest">Soonest</SelectItem>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                tasksApi.setSearch("");
                tasksApi.setStatusFilter("all");
                tasksApi.setSort("soonest");
                toast({ title: "Reset", description: "Filters cleared." });
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>
    );
  }, [tasksApi, toast]);

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

  function handleDelete(id: LocalTask["id"]) {
    setConfirmDelete({ open: true, id });
  }

  function confirmDeleteNow() {
    if (confirmDelete.id == null) return;
    tasksApi.deleteTask(confirmDelete.id);
    setConfirmDelete({ open: false, id: null });
    toast({ title: "Deleted", description: "Task removed." });
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
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Your day, in focus.
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
                Taskly watches the clock quietly — then taps you on the shoulder exactly when it matters.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button type="button" variant="outline" onClick={() => setNotifOpen(true)}>
                Notifications
              </Button>
              <Button type="button" onClick={openCreate} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 border-0 text-white shadow-lg shadow-purple-500/25">
                Add task
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <DashboardCards tasks={tasksApi.tasks} />
          </div>

          {headerFilters}

          <TaskList
            tasks={pageTasks}
            onComplete={(id) => {
              tasksApi.toggleComplete(id);
              toast({ title: "Updated", description: "Task status changed." });
            }}
            onDelete={handleDelete}
            onEdit={openEdit}
          />
        </section>

        {/* Mobile floating action button */}
        <div className="fixed bottom-6 right-6 z-50 sm:hidden">
          <Button
            type="button"
            size="icon"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 text-white hover:opacity-90 transition-all hover:scale-105 active:scale-95 border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            onClick={openCreate}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </main>

      <AddTaskModal
        open={addOpen}
        onOpenChange={setAddOpen}
        mode={mode}
        initialTask={editing}
        onCreate={(data) => {
          tasksApi.createTask(data);
          toast({ title: "Task created", description: "You’ll get an in-app reminder at the scheduled time." });
        }}
        onUpdate={(id, updates) => {
          tasksApi.updateTask(id, updates);
          toast({ title: "Saved", description: "Task updated." });
        }}
      />

      <NotificationsDrawer
        open={notifOpen}
        onOpenChange={setNotifOpen}
        tasks={tasksApi.tasks}
        onClearAll={() => {
          tasksApi.clearAll();
          toast({ title: "Cleared", description: "All tasks removed from this device." });
        }}
        onJumpToTask={(task) => {
          setNotifOpen(false);
          openEdit(task);
        }}
      />

      <AlarmModal
        open={reminder.reminder.open}
        task={reminder.reminder.task}
        message={reminder.reminder.message}
        onStop={reminder.actions.closeStop}
        onSnooze={(m) => {
          reminder.actions.snooze(m);
          toast({ title: "Snoozed", description: `Reminder delayed by ${m} minutes.` });
        }}
        onMarkCompleted={() => {
          reminder.actions.markCompleted();
          toast({ title: "Completed", description: "Nice. One less thing to carry." });
        }}
      />

      <AlertDialog open={confirmDelete.open} onOpenChange={(v) => setConfirmDelete((s) => ({ ...s, open: v }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from LocalStorage on this device. This action can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete({ open: false, id: null })}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteNow}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
