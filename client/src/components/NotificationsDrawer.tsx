import { useMemo } from "react";
import type { LocalTask } from "@/hooks/use-tasks";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Bell, BellOff, Trash2 } from "lucide-react";

export function NotificationsDrawer(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tasks: LocalTask[];
  onClearAll: () => void;
  onJumpToTask: (task: LocalTask) => void;
}) {
  const { open, onOpenChange, tasks, onClearAll, onJumpToTask } = props;

  const recent = useMemo(() => {
    // "Notifications" are a lightweight view: upcoming pending tasks (soonest first)
    const now = new Date();
    const items = tasks
      .filter((t) => t.status !== "completed")
      .map((t) => ({ t, dt: new Date(`${t.date}T${t.time}:00`) }))
      .filter((x) => !Number.isNaN(x.dt.getTime()))
      .sort((a, b) => a.dt.getTime() - b.dt.getTime())
      .slice(0, 12);

    const soon = items.filter((x) => x.dt.getTime() - now.getTime() <= 6 * 60 * 60 * 1000);
    return soon.length > 0 ? soon : items;
  }, [tasks]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-2xl">Notifications</SheetTitle>
          <SheetDescription>
            A quick queue of what’s coming up. Real push notifications depend on device permissions.
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-sm text-muted-foreground">{recent.length} items</div>
          <Button type="button" variant="outline" onClick={onClearAll}>
            <Trash2 className="h-4 w-4" />
            Clear all tasks
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {recent.length === 0 ? (
            <div className="rounded-2xl border bg-muted/40 p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-muted">
                <BellOff className="h-5 w-5" />
              </div>
              <div className="mt-3 text-lg font-semibold tracking-tight">All quiet</div>
              <div className="mt-1 text-sm text-muted-foreground">No upcoming reminders.</div>
            </div>
          ) : (
            recent.map(({ t }) => (
              <button
                key={String(t.id)}
                type="button"
                onClick={() => onJumpToTask(t)}
                className="w-full rounded-2xl border bg-card p-4 text-left shadow-premium transition-all duration-300 hover-elevate active-elevate-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold tracking-tight">{t.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t.date} • {t.time}
                    </div>
                  </div>
                  <div className="pt-0.5">
                    <StatusBadge status={t.status as any} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Bell className="h-4 w-4" />
                  Reminder will trigger in-app at scheduled time.
                </div>
              </button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
