"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function PwaRegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => {
            console.debug("Service Worker registration skipped:", err);
          });
      });
    }

    // 2. Connectivity Listeners
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  if (!isOffline && !showRestored) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-sm pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {isOffline ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground shadow-lg text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Offline mode · ERP live sync paused</span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground shadow-lg text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Connection restored · Sync active</span>
        </div>
      )}
    </div>
  );
}
