import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LocalTask } from "@/hooks/use-tasks";

const styles: Record<string, string> = {
  pending:
    "bg-secondary text-secondary-foreground border-secondary-border",
  completed:
    "bg-[hsl(var(--accent)/0.14)] text-foreground border-[hsl(var(--accent)/0.25)] dark:bg-[hsl(var(--accent)/0.18)]",
  overdue:
    "bg-[hsl(var(--destructive)/0.12)] text-foreground border-[hsl(var(--destructive)/0.25)] dark:bg-[hsl(var(--destructive)/0.16)]",
  upcoming:
    "bg-[hsl(var(--primary)/0.12)] text-foreground border-[hsl(var(--primary)/0.25)] dark:bg-[hsl(var(--primary)/0.16)]",
};

export function StatusBadge({ status }: { status: LocalTask["status"] }) {
  const normalized = (status || "pending").toLowerCase();
  const label =
    normalized === "completed"
      ? "Completed"
      : normalized === "overdue"
        ? "Overdue"
        : normalized === "upcoming"
          ? "Upcoming"
          : "Pending";

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium tracking-tight",
        styles[normalized] ?? styles.pending,
      )}
    >
      {label}
    </Badge>
  );
}
