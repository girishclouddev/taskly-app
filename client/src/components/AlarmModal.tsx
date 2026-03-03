import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { LocalTask } from "@/hooks/use-tasks";
import { BellRing, CheckCircle2, TimerReset, X } from "lucide-react";

export function AlarmModal(props: {
  open: boolean;
  task: LocalTask | null;
  message: string;
  onStop: () => void;
  onSnooze: (minutes: number) => void;
  onMarkCompleted: () => void;
}) {
  const { open, task, message, onStop, onSnooze, onMarkCompleted } = props;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[1000] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onStop}
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, scale: 0.99, filter: "blur(8px)" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl rounded-2xl border bg-card shadow-premium-lg"
          >
            <div className="bg-aurora rounded-2xl">
              <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7">
                <div className="absolute inset-0 grain opacity-70" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/90 to-accent/70 text-primary-foreground shadow-premium">
                        <BellRing className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-semibold tracking-tight">Reminder</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {task ? `${task.date} • ${task.time}` : "Now"}
                        </div>
                      </div>
                    </div>

                    <Button type="button" variant="outline" size="icon" onClick={onStop} aria-label="Close reminder">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-5 rounded-2xl border bg-background/60 p-4 backdrop-blur">
                    <div className="text-sm text-muted-foreground">{message}</div>
                    <div className="mt-2 text-lg font-semibold tracking-tight">{task?.title ?? "Your task"}</div>
                    {task?.description ? (
                      <div className="mt-2 text-sm text-muted-foreground">{task.description}</div>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" variant="secondary" onClick={() => onSnooze(10)}>
                        <TimerReset className="h-4 w-4" />
                        Snooze 10m
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => onSnooze(30)}>
                        Snooze 30m
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => onSnooze(45)}>
                        Snooze 45m
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => onSnooze(60)}>
                        Snooze 1hr
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => onSnooze(180)}>
                        Snooze 3hr
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Button type="button" variant="outline" onClick={onStop}>
                        Stop
                      </Button>
                      <Button type="button" onClick={onMarkCompleted} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 border-0 text-white shadow-lg shadow-teal-500/25">
                        <CheckCircle2 className="h-4 w-4" />
                        Mark completed
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
