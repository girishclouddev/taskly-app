import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import type { LocalTask } from "@/hooks/use-tasks";
import { Check, Trash2 } from "lucide-react";

export function TaskCardMobile(props: {
  task: LocalTask;
  onComplete: (id: LocalTask["id"]) => void;
  onDelete: (id: LocalTask["id"]) => void;
  onEdit: (task: LocalTask) => void;
}) {
  const { task, onComplete, onDelete, onEdit } = props;

  return (
    <Card className="p-4 shadow-premium hover-elevate transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="text-left w-full rounded-lg transition-all duration-200 hover-elevate active-elevate-2"
          >
            <div className="truncate text-base font-semibold tracking-tight">{task.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {task.date} • {task.time}
            </div>
            {task.description ? (
              <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{task.description}</div>
            ) : null}
          </button>

          <div className="mt-3">
            <StatusBadge status={task.status as any} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => onComplete(task.id)}
            aria-label="Complete"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => onDelete(task.id)}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
