import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LocalTask } from "@/hooks/use-tasks";
import { isAfter, isBefore, isSameDay } from "date-fns";
import { CalendarClock, CheckCircle2, Flame, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function taskDateTime(task: LocalTask) {
  return new Date(`${task.date}T${task.time}:00`);
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 500;
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(start + (end - start) * ease));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [value]);

  return <>{displayValue}</>;
}

function StatCard(props: {
  title: string;
  value: number;
  icon: React.ReactNode;
  hint: string;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: props.delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className={cn("h-full border-0 backdrop-blur-xl shadow-xl overflow-hidden relative", props.className)}>
        <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay"></div>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 relative z-10 pb-2">
          <CardTitle className="text-sm font-medium text-white/90 uppercase tracking-wider">{props.title}</CardTitle>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20 text-white shadow-inner backdrop-blur-md">
            {props.icon}
          </div>
        </CardHeader>
        <CardContent className="space-y-1 relative z-10">
          <div className="text-4xl font-bold text-white tracking-tighter">
            <AnimatedNumber value={props.value} />
          </div>
          <div className="text-xs text-white/70 font-medium">{props.hint}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardCards({ tasks }: { tasks: LocalTask[] }) {
  const stats = useMemo(() => {
    const now = new Date();
    const pendingToday = tasks.filter((t) => {
      if (t.status === "completed") return false;
      const dt = taskDateTime(t);
      return isSameDay(dt, now);
    }).length;

    const completed = tasks.filter((t) => t.status === "completed").length;

    const upcoming = tasks.filter((t) => {
      if (t.status === "completed") return false;
      const dt = taskDateTime(t);
      return isAfter(dt, now) && !isSameDay(dt, now);
    }).length;

    const overdue = tasks.filter((t) => {
      if (t.status === "completed") return false;
      const dt = taskDateTime(t);
      return isBefore(dt, now) && !isSameDay(dt, now);
    }).length;

    return { pendingToday, completed, upcoming, overdue };
  }, [tasks]);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Pending today"
        value={stats.pendingToday}
        hint="Tasks scheduled for today"
        icon={<Timer className="h-5 w-5" />}
        className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"
        delay={0.1}
      />
      <StatCard
        title="Completed"
        value={stats.completed}
        hint="Your wins — small and big"
        icon={<CheckCircle2 className="h-5 w-5" />}
        className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600"
        delay={0.2}
      />
      <StatCard
        title="Upcoming"
        value={stats.upcoming}
        hint="Future tasks not due yet"
        icon={<CalendarClock className="h-5 w-5" />}
        className="bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700"
        delay={0.3}
      />
      <StatCard
        title="Overdue"
        value={stats.overdue}
        hint="Past scheduled tasks"
        icon={<Flame className="h-5 w-5" />}
        className="bg-gradient-to-br from-rose-500 via-red-500 to-pink-600"
        delay={0.4}
      />
    </section>
  );
}
