"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-5 shadow-xs">
        <AlertCircle className="w-8 h-8" />
      </div>

      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-destructive mb-1">
        Unexpected Operational Error
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight max-w-md">
        Unable to Load Account View
      </h1>

      <p className="text-xs text-muted-foreground max-w-md mt-2 leading-relaxed">
        {error.message ||
          "An error occurred while communicating with the institution database. Please retry or return to the dashboard."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <Button
          onClick={() => reset()}
          size="sm"
          className="gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </Button>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Home className="w-3.5 h-3.5 text-primary" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
