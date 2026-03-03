import { useEffect, useMemo, useRef, useState } from "react";
import { addMinutes } from "date-fns";
import type { LocalTask } from "./useTasks";

type ReminderState = {
    open: boolean;
    task: LocalTask | null;
    message: string;
};

function getTaskDateTime(task: LocalTask) {
    return new Date(`${task.date}T${task.time}:00`);
}

async function tryBrowserNotify(title: string, body: string, taskId: string | number) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
        try {
            const n = new Notification(title, { body, icon: "/favicon.png", data: { taskId } });
            n.onclick = () => {
                window.focus();
                window.location.hash = `#task-${taskId}`;
            };
        } catch (err) {
            console.warn("[notify] Failed to show notification:", err);
        }
    }
}

export function useNotifications(opts: {
    tasks: LocalTask[];
    hasFired: (task: LocalTask) => boolean;
    setFired: (task: LocalTask) => void;
    onMarkCompleted: (id: LocalTask["id"]) => void;
    onUpdateTask: (id: LocalTask["id"], updates: Partial<Pick<LocalTask, "date" | "time" | "status">>) => void;
}) {
    const { tasks, hasFired, setFired, onMarkCompleted, onUpdateTask } = opts;

    const [state, setState] = useState<ReminderState>({
        open: false,
        task: null,
        message: "Hey! You need to complete this task.",
    });

    const tickingRef = useRef(false);

    const eligible = useMemo(() => {
        return tasks.filter((t) => t.status === "pending");
    }, [tasks]);

    useEffect(() => {
        const interval = window.setInterval(async () => {
            if (tickingRef.current) return;
            tickingRef.current = true;

            try {
                const now = new Date();

                for (const task of eligible) {
                    if (state.open) break;
                    // Prompt logic: If current date/time >= task date/time AND task status == pending AND not already triggered
                    if (hasFired(task)) continue;

                    const dt = getTaskDateTime(task);
                    if (Number.isNaN(dt.getTime())) continue;

                    const diff = now.getTime() - dt.getTime();
                    if (diff >= 0) {
                        setFired(task);
                        setState({ open: true, task, message: "Hey! You need to complete this task." });

                        await tryBrowserNotify("Taskly Reminder", task.title, task.id);

                        try {
                            // Play a sound if available
                            const audio = new Audio('/alarm.mp3');
                            audio.play().catch(() => { });
                        } catch (e) { }

                        break;
                    }
                }
            } finally {
                tickingRef.current = false;
            }
        }, 30_000);

        return () => window.clearInterval(interval);
    }, [eligible, hasFired, setFired, state.open, state.task, tasks]);

    const actions = useMemo(() => {
        const task = state.task;
        return {
            closeStop: () => setState((s) => ({ ...s, open: false, task: null })),
            snooze: (minutes: number) => {
                if (!task) return;
                const dt = getTaskDateTime(task);
                const next = addMinutes(Number.isNaN(dt.getTime()) ? new Date() : dt, minutes);

                const yyyy = next.getFullYear();
                const mm = String(next.getMonth() + 1).padStart(2, "0");
                const dd = String(next.getDate()).padStart(2, "0");
                const hh = String(next.getHours()).padStart(2, "0");
                const min = String(next.getMinutes()).padStart(2, "0");

                onUpdateTask(task.id, { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}`, status: "pending" });
                setState((s) => ({ ...s, open: false, task: null }));
            },
            markCompleted: () => {
                if (!task) return;
                onMarkCompleted(task.id);
                setState((s) => ({ ...s, open: false, task: null }));
            },
        };
    }, [onMarkCompleted, onUpdateTask, state.task]);

    return { reminder: state, setReminder: setState, actions };
}
