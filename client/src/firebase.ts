import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBRy4BVkApTswyc2LVcCDRhNG7K-XZycw8",
  authDomain: "taskly-app-83134.firebaseapp.com",
  projectId: "taskly-app-83134",
  storageBucket: "taskly-app-83134.firebasestorage.app",
  messagingSenderId: "339959258710",
  appId: "1:339959258710:web:a17322ee3dce128de825f7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let messaging = null;

try {
  // Messaging only works in supported browsers
  messaging = getMessaging(app);
} catch (error) {
  console.warn("Firebase Messaging not supported in this environment.", error);
}

export const requestNotificationPermission = async (vapidKey) => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey });
      console.log("FCM Token:", token);
      return token;
    } else {
      console.log("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
    return null;
  }
};

export const onMessageListener = () => {
  if (!messaging) return new Promise((resolve) => {});
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export { app, db, messaging };
