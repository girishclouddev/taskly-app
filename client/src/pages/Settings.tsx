import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useTasks } from "@/hooks/use-tasks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bell, Database, Shield, Trash2 } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const tasksApi = useTasks();
  const [notifOpen, setNotifOpen] = useState(false);

  const storageEstimate = useMemo(() => {
    const json = JSON.stringify(tasksApi.tasks);
    const bytes = new Blob([json]).size;
    const kb = Math.round((bytes / 1024) * 10) / 10;
    return { bytes, kb };
  }, [tasksApi.tasks]);

  const [testTitle, setTestTitle] = useState("Taskly Reminder");
  const [testBody, setTestBody] = useState("This is a test notification from Taskly.");

  async function testNotification() {
    if (!("Notification" in window)) {
      toast({ title: "Not supported", description: "This browser doesn't support notifications." });
      return;
    }

    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }

    if (Notification.permission !== "granted") {
      toast({ title: "Permission needed", description: "Enable notifications in your browser settings." });
      return;
    }

    new Notification(testTitle, { body: testBody, icon: "/favicon.png" });
    toast({ title: "Sent", description: "If permissions allow, you should see a notification." });
  }

  return (
    <div className="min-h-screen bg-aurora">
      <Navbar
        search={tasksApi.search}
        onSearchChange={tasksApi.setSearch}
        onOpenAdd={() => toast({ title: "Tip", description: "Add tasks from Overview or Schedule." })}
        onOpenNotifications={() => setNotifOpen(true)}
      />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <section className="animate-float-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Settings</h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Fine-tune reminders, privacy, and what lives on this device.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            <Card className="p-5 shadow-premium">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-muted">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold tracking-tight">Notifications</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Taskly uses in-app reminders. Browser notifications are optional and permission-based.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={Notification?.permission === "granted"}
                    onCheckedChange={async () => {
                      if (!("Notification" in window)) return;
                      await Notification.requestPermission();
                      toast({ title: "Updated", description: `Permission: ${Notification.permission}` });
                    }}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-sm font-semibold tracking-tight">Test title</div>
                  <Input value={testTitle} onChange={(e) => setTestTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-semibold tracking-tight">Test body</div>
                  <Input value={testBody} onChange={(e) => setTestBody(e.target.value)} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 flex-wrap">
                <Button type="button" variant="outline" onClick={testNotification}>
                  Send test notification
                </Button>
              </div>
            </Card>

            <Card className="p-5 shadow-premium">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-muted">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold tracking-tight">Local storage</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Tasks are stored in your browser (LocalStorage). Clearing removes them from this device only.
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  ~{storageEstimate.kb} KB
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  No account required. Your tasks stay local.
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    tasksApi.clearAll();
                    toast({ title: "Cleared", description: "All local tasks removed." });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear tasks
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* notifOpen intentionally unused here; Navbar action still wired */}
      {notifOpen ? null : null}
    </div>
  );
}
