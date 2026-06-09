"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Thin top bar shown only when there's something to say:
 *   - Offline → "Offline · changes saved locally"
 *   - Online but pending mutations exist → "Syncing N changes…"
 *   - Idle online → hidden (auto-dismiss 1s after queue drains)
 */
export function SyncStatusBanner() {
  const { isOnline, pendingCount } = useOnlineStatus();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"offline" | "syncing">("offline");

  useEffect(() => {
    if (!isOnline) {
      setMode("offline");
      setVisible(true);
      return;
    }
    if (pendingCount > 0) {
      setMode("syncing");
      setVisible(true);
      return;
    }
    // Idle online — slight delay so the user actually sees "Syncing… ✓" before it hides.
    const t = window.setTimeout(() => setVisible(false), 1000);
    return () => window.clearTimeout(t);
  }, [isOnline, pendingCount]);

  const palette =
    mode === "offline"
      ? { bg: "rgba(251,191,36,0.18)", border: "rgba(251,191,36,0.4)", text: "#FBBF24" }
      : { bg: "rgba(204,255,0,0.18)", border: "rgba(204,255,0,0.4)", text: "#CCFF00" };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -32, opacity: 0 }}
          transition={{ type: "spring", stiffness: 480, damping: 36 }}
          className="fixed top-0 inset-x-0 z-[60] flex justify-center pointer-events-none"
        >
          <div
            className="mt-2 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold backdrop-blur-md pointer-events-auto"
            style={{
              background: palette.bg,
              border: `1px solid ${palette.border}`,
              color: palette.text,
              boxShadow: "0 8px 24px -10px rgba(0,0,0,0.5)",
            }}
            role="status"
            aria-live="polite"
          >
            {mode === "offline" ? <OfflineGlyph /> : <SpinnerGlyph />}
            {mode === "offline"
              ? "Offline · changes saved locally"
              : pendingCount === 1
                ? "Syncing 1 change…"
                : `Syncing ${pendingCount} changes…`}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OfflineGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <path d="M2 8.82a15 15 0 0 1 8 -3" />
      <path d="M14 5.82a15 15 0 0 1 8 3" />
      <path d="M5 12.86a10 10 0 0 1 4 -2" />
      <path d="M15 10.86a10 10 0 0 1 4 2" />
      <path d="M8.5 16.43a5 5 0 0 1 7 0" />
      <path d="M12 20h.01" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

function SpinnerGlyph() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden="true"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    >
      <path d="M21 12a9 9 0 1 1-6.2-8.6" />
    </motion.svg>
  );
}
