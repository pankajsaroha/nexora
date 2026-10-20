import React from "react";

export default function ExamsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-80 bg-muted/60 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-36 bg-muted rounded-lg" />
          <div className="h-9 w-40 bg-muted rounded-lg" />
        </div>
      </div>

      {/* KPI Stats Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-white shadow-xs space-y-2">
            <div className="h-3 w-24 bg-muted/60 rounded" />
            <div className="h-7 w-16 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted/40 rounded" />
          </div>
        ))}
      </div>

      {/* Search & Filter Bar Skeleton */}
      <div className="p-3 rounded-xl border border-border bg-white shadow-xs flex items-center justify-between gap-3">
        <div className="h-9 flex-1 max-w-md bg-muted/50 rounded-lg" />
        <div className="h-9 w-24 bg-muted/50 rounded-lg" />
      </div>

      {/* Exam Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-border bg-white shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-muted/70 rounded" />
              <div className="h-5 w-20 bg-muted/70 rounded-md" />
            </div>

            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted/50 rounded" />
            </div>

            <div className="pt-2 border-t border-border/50 space-y-2">
              <div className="h-3 w-40 bg-muted/40 rounded" />
              <div className="h-3 w-48 bg-muted/40 rounded" />
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              <div className="h-8 w-28 bg-muted/60 rounded-lg" />
              <div className="h-8 w-8 bg-muted/40 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
