## Packages
firebase | FCM push notifications (v9 modular SDK initialization + messaging)
uuid | Client-side ID generation for LocalStorage-backed tasks
@types/uuid | TypeScript types for uuid
date-fns | Date parsing/formatting and reminder calculations
framer-motion | Premium modal transitions + page micro-interactions

## Notes
LocalStorage is the source of truth for tasks (do NOT use /api/tasks for tasks UI state).
Firebase config is a placeholder; app should still work with Notification API fallback.
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  sans: ["var(--font-sans)"],
  mono: ["var(--font-mono)"],
}
