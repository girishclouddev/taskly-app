import { useEffect, useMemo, useState } from "react";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
    setDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { z } from "zod";
import type { CreateTaskRequest, UpdateTaskRequest, TaskResponse } from "@shared/schema";
import { insertTaskSchema } from "@shared/schema";

export type LocalTask = TaskResponse & { id: string | number;[key: string]: any };

export function useTasks() {
    const [tasks, setTasks] = useState<LocalTask[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
    const [sort, setSort] = useState<"soonest" | "latest" | "title">("soonest");

    // Read tasks from Firestore
    useEffect(() => {
        const q = query(collection(db, "tasks"));
        const unsubscribe = onSnapshot(q, (snapshot: any) => {
            const dbTasks = snapshot.docs.map((d: any) => ({
                id: d.id,
                ...d.data(),
                // Convert firestore timestamp locally if needed, but schema uses mostly string fields for date/time
            })) as LocalTask[];
            setTasks(dbTasks);
        }, (error: any) => {
            console.error("Error fetching tasks:", error);
        });
        return () => unsubscribe();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const byText = (t: LocalTask) => {
            if (!q) return true;
            return (
                t.title.toLowerCase().includes(q) ||
                (t.description ?? "").toLowerCase().includes(q) ||
                `${t.date} ${t.time}`.toLowerCase().includes(q)
            );
        };

        const byStatus = (t: LocalTask) => {
            if (statusFilter === "all") return true;
            return t.status === statusFilter;
        };

        const items = tasks.filter((t) => byText(t) && byStatus(t));

        const keyTime = (t: LocalTask) => new Date(`${t.date}T${t.time}:00`).getTime();

        items.sort((a, b) => {
            if (sort === "title") return a.title.localeCompare(b.title);
            if (sort === "latest") return keyTime(b) - keyTime(a);
            return keyTime(a) - keyTime(b);
        });

        return items;
    }, [tasks, search, sort, statusFilter]);

    async function createTask(input: CreateTaskRequest) {
        try {
            const validated = insertTaskSchema.parse(input);
            const docRef = await addDoc(collection(db, "tasks"), {
                title: validated.title,
                description: validated.description ?? null,
                date: validated.date,
                time: validated.time,
                status: validated.status ?? "pending",
                createdAt: serverTimestamp()
            });
            return { id: docRef.id, ...input } as LocalTask;
        } catch (e) {
            console.error("Error adding task: ", e);
        }
    }

    async function updateTask(id: LocalTask["id"], updates: UpdateTaskRequest) {
        try {
            const taskRef = doc(db, "tasks", String(id));
            await updateDoc(taskRef, updates as any);

            // Clear local fired state for this task when updated, equivalent to previous logic
            const idStr = String(id);
            const newFired = Array.from(firedSet).filter(k => !k.startsWith(`${idStr}::`));
            if (newFired.length !== firedSet.size) {
                await setDoc(doc(db, "reminders", "fired"), { fired: newFired }, { merge: true });
            }
        } catch (e) {
            console.error("Error updating task: ", e);
        }
    }

    async function deleteTask(id: LocalTask["id"]) {
        try {
            const taskRef = doc(db, "tasks", String(id));
            await deleteDoc(taskRef);

            const idStr = String(id);
            const newFired = Array.from(firedSet).filter(k => !k.startsWith(`${idStr}::`));
            if (newFired.length !== firedSet.size) {
                await setDoc(doc(db, "reminders", "fired"), { fired: newFired }, { merge: true });
            }
        } catch (e) {
            console.error("Error deleting task: ", e);
        }
    }

    function toggleComplete(id: LocalTask["id"]) {
        const t = tasks.find((x: any) => String(x.id) === String(id));
        if (!t) return;
        const nextStatus = t.status === "completed" ? "pending" : "completed";
        updateTask(id, { status: nextStatus });
    }

    function markCompleted(id: LocalTask["id"]) {
        updateTask(id, { status: "completed" });
    }

    function markPending(id: LocalTask["id"]) {
        updateTask(id, { status: "pending" });
    }

    async function clearAll() {
        for (const task of tasks) {
            await deleteTask(task.id);
        }
        await setDoc(doc(db, "reminders", "fired"), { fired: [] });
    }

    // Use a designated document for fired set in "reminders/fired"
    const [firedSet, setFiredSet] = useState<Set<string>>(new Set());

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "reminders", "fired"), (documentSnapshot: any) => {
            if (documentSnapshot.exists()) {
                const data = documentSnapshot.data();
                setFiredSet(new Set(data.fired || []));
            } else {
                setFiredSet(new Set());
            }
        });
        return () => unsubscribe();
    }, []);

    function getFiredSet() {
        return firedSet;
    }

    async function setReminderFired(task: LocalTask) {
        try {
            const newFired = Array.from(firedSet);
            newFired.push(`${task.id}::${task.date}::${task.time}`);
            await setDoc(doc(db, "reminders", "fired"), { fired: newFired }, { merge: true });
        } catch (e) {
            console.error(e);
        }
    }

    function hasReminderFired(task: LocalTask) {
        const idStr = `${task.id}::${task.date}::${task.time}`;
        return firedSet.has(idStr);
    }

    return {
        tasks,
        filtered,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        sort,
        setSort,
        createTask,
        updateTask,
        deleteTask,
        toggleComplete,
        markCompleted,
        markPending,
        clearAll,
        hasReminderFired,
        setReminderFired,
        getFiredSet,
    };
}
