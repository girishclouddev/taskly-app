import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Schedule from "@/pages/Schedule";
import Settings from "@/pages/Settings";
import { requestNotificationPermission, onMessageListener, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import Guide from "@/pages/Guide";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/settings" component={Settings} />
      <Route path="/guide" component={Guide} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // 1. Request Permission on Load and save token
    const initMessaging = async () => {
      // The user stated they will provide the VAPID key manually.
      const vapidKey = "YOUR_VAPID_KEY_HERE";
      const token = await requestNotificationPermission(vapidKey);

      if (token) {
        console.log("Saving token to Firestore users collection:", token);
        try {
          // Save token inside Firestore collection "users"
          // We use the token snippet or a generic ID. Using the token as the document ID prevents duplicates.
          await setDoc(doc(db, "users", token), {
            token,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.error("Error saving token to Firestore:", e);
        }
      }
    };
    initMessaging();

    // 2. Set up foreground onMessage listener
    const setupListener = async () => {
      try {
        const payload: any = await onMessageListener();
        console.log("[App.tsx] Foreground message received: ", payload);

        const title = payload?.notification?.title || "Taskly Reminder";
        const body = payload?.notification?.body || "You have a pending task!";

        // Show browser notification manually if tab active
        if ("Notification" in window && Notification.permission === "granted") {
          const taskId = payload?.data?.taskId || '';
          const n = new Notification(title, { body, icon: "/favicon.png", data: { taskId } });
          n.onclick = () => {
            window.focus();
            if (taskId) window.location.hash = `#task-${taskId}`;
          };
        }

        // Setup listener recursively to keep listening for the next message
        setupListener();
      } catch (err) {
        console.warn("Foreground listener error:", err);
      }
    };

    setupListener();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
