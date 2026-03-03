importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyBRy4BVkApTswyc2LVcCDRhNG7K-XZycw8",
  authDomain: "taskly-app-83134.firebaseapp.com",
  projectId: "taskly-app-83134",
  storageBucket: "taskly-app-83134.firebasestorage.app",
  messagingSenderId: "339959258710",
  appId: "1:339959258710:web:a17322ee3dce128de825f7"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message ", payload);
    const notificationTitle = payload.notification?.title || "Taskly Reminder";
    const notificationOptions = {
      body: payload.notification?.body || "You have a pending task!",
      icon: "/favicon.png",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.warn("Firebase initialization failed in service worker.", error);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const taskId = event.notification.data?.taskId || "";
  const targetPath = taskId ? `/#task-${taskId}` : "/";
  const urlToOpen = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      let matchingClient = null;
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url.split('#')[0] === new URL("/", self.location.origin).href) {
          matchingClient = windowClient;
          break;
        }
      }

      if (matchingClient) {
        matchingClient.focus();
        matchingClient.navigate(urlToOpen); // Trigger the hash change in the open client
        return;
      } else {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
