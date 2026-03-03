import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import type { LocalTask } from "@/hooks/use-tasks";
import type { CreateTaskRequest, UpdateTaskRequest } from "@shared/schema";
import { insertTaskSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const formSchema = insertTaskSchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

type FormState = z.infer<typeof formSchema>;

function nowDefaults() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
}

export function AddTaskModal(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  mode: "create" | "edit";
  initialTask?: LocalTask | null;

  onCreate: (data: CreateTaskRequest) => void;
  onUpdate: (id: LocalTask["id"], updates: UpdateTaskRequest) => void;
}) {
  const { open, onOpenChange, mode, initialTask, onCreate, onUpdate } = props;

  const initial: FormState = useMemo(() => {
    const defaults = nowDefaults();
    if (mode === "edit" && initialTask) {
      return {
        title: initialTask.title ?? "",
        description: initialTask.description ?? "",
        date: initialTask.date ?? defaults.date,
        time: initialTask.time ?? defaults.time,
        status: (initialTask.status as any) ?? "pending",
      };
    }
    return { title: "", description: "", date: defaults.date, time: defaults.time, status: "pending" };
  }, [initialTask, mode]);

  const [values, setValues] = useState<FormState>(initial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(initial);
      setTouched({});
      setSubmitError(null);
    }
  }, [open, initial]);

  const validation = useMemo(() => formSchema.safeParse(values), [values]);
  const errors = useMemo(() => {
    if (validation.success) return {};
    const map: Record<string, string> = {};
    for (const e of validation.error.errors) map[e.path.join(".")] = e.message;
    return map;
  }, [validation]);

  const canSubmit = validation.success;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function markTouched(key: keyof FormState) {
    setTouched((t) => ({ ...t, [key]: true }));
  }

  function showError(key: keyof FormState) {
    return !!touched[key as string] && !!errors[key as string];
  }

  async function handleSubmit() {
    setSubmitError(null);
    setTouched({ title: true, date: true, time: true });

    const parsed = formSchema.safeParse(values);
    if (!parsed.success) return;

    try {
      const payload = parsed.data;
      if (mode === "create") {
        onCreate({
          title: payload.title,
          description: payload.description || undefined,
          date: payload.date,
          time: payload.time,
          status: payload.status ?? "pending",
        });
      } else if (mode === "edit" && initialTask) {
        onUpdate(initialTask.id, {
          title: payload.title,
          description: payload.description || undefined,
          date: payload.date,
          time: payload.time,
          status: payload.status ?? "pending",
        });
      }
      onOpenChange(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl overflow-hidden">
        <div className="bg-aurora absolute inset-0 -z-10 opacity-60" />
        <div className="absolute inset-0 -z-10 grain opacity-70" />
        <DialogHeader>
          <DialogTitle className="text-2xl">{mode === "create" ? "Add a task" : "Edit task"}</DialogTitle>
          <DialogDescription>
            Set a time — Taskly will trigger an in-app alarm (and a notification when available).
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-sm font-semibold tracking-tight">Title</div>
            <Input
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
              onBlur={() => markTouched("title")}
              placeholder="e.g. Submit expense report"
              className={showError("title") ? "border-destructive focus-visible:ring-destructive/20" : undefined}
            />
            <AnimatePresence initial={false}>
              {showError("title") ? (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-sm text-destructive"
                >
                  {errors.title}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-semibold tracking-tight">Description</div>
            <Textarea
              value={values.description ?? ""}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Optional context, links, or notes…"
              className="min-h-24"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <div className="text-sm font-semibold tracking-tight">Date</div>
              <Input
                type="date"
                value={values.date}
                onChange={(e) => setField("date", e.target.value)}
                onBlur={() => markTouched("date")}
                className={showError("date") ? "border-destructive focus-visible:ring-destructive/20" : undefined}
              />
              <AnimatePresence initial={false}>
                {showError("date") ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-sm text-destructive"
                  >
                    {errors.date}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-semibold tracking-tight">Time</div>
              <Input
                type="time"
                value={values.time}
                onChange={(e) => setField("time", e.target.value)}
                onBlur={() => markTouched("time")}
                className={showError("time") ? "border-destructive focus-visible:ring-destructive/20" : undefined}
              />
              <AnimatePresence initial={false}>
                {showError("time") ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-sm text-destructive"
                  >
                    {errors.time}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {submitError ? <div className="text-sm text-destructive">{submitError}</div> : null}

          <div className="flex items-center justify-end gap-2 flex-wrap">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={!canSubmit} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 border-0 text-white shadow-lg shadow-purple-500/25">
              {mode === "create" ? "Create task" : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
