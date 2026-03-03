import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { TaskInput, TaskUpdateInput } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

/**
 * Backend API hooks (implemented for completeness),
 * but the app uses LocalStorage for task state per requirements.
 */
export function useApiTasks() {
  return useQuery({
    queryKey: [api.tasks.list.path],
    queryFn: async () => {
      const res = await fetch(api.tasks.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const json = await res.json();
      return parseWithLogging(api.tasks.list.responses[200], json, "tasks.list");
    },
  });
}

export function useApiTask(id: number) {
  return useQuery({
    queryKey: [api.tasks.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tasks.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch task");
      const json = await res.json();
      return parseWithLogging(api.tasks.get.responses[200], json, "tasks.get");
    },
  });
}

export function useApiCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: TaskInput) => {
      const validated = api.tasks.create.input.parse(data);
      const res = await fetch(api.tasks.create.path, {
        method: api.tasks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.tasks.create.responses[400], await res.json(), "tasks.create:400");
          throw new Error(err.message);
        }
        throw new Error("Failed to create task");
      }

      return parseWithLogging(api.tasks.create.responses[201], await res.json(), "tasks.create:201");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.tasks.list.path] }),
  });
}

export function useApiUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & TaskUpdateInput) => {
      const validated = api.tasks.update.input.parse(updates);
      const url = buildUrl(api.tasks.update.path, { id });
      const res = await fetch(url, {
        method: api.tasks.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.tasks.update.responses[400], await res.json(), "tasks.update:400");
          throw new Error(err.message);
        }
        if (res.status === 404) {
          const err = parseWithLogging(api.tasks.update.responses[404], await res.json(), "tasks.update:404");
          throw new Error(err.message);
        }
        throw new Error("Failed to update task");
      }

      return parseWithLogging(api.tasks.update.responses[200], await res.json(), "tasks.update:200");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.tasks.list.path] }),
  });
}

export function useApiDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tasks.delete.path, { id });
      const res = await fetch(url, { method: api.tasks.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.tasks.delete.responses[404], await res.json(), "tasks.delete:404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.tasks.list.path] }),
  });
}
