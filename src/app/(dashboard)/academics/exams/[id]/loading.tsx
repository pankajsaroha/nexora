import React from "react";

export default function ExamDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header & Breadcrumbs Skeleton */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-4 w-20 bg-muted/70 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 bg-muted/70 rounded-md" />
            <div className="h-6 w-32 bg-muted/50 rounded-md" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="space-y-2">
            <div className="h-3 w-44 bg-muted/50 rounded" />
            <div className="h-7 w-64 bg-muted rounded-lg" />
            <div className="h-4 w-72 bg-muted/50 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 bg-muted rounded-lg" />
            <div className="h-9 w-24 bg-muted/60 rounded-lg" />
          </div>
        </div>

        {/* Tab Bar Skeleton */}
        <div className="pt-2 border-t border-border flex items-center gap-2 overflow-x-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-28 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-white shadow-xs space-y-2">
            <div className="h-3 w-28 bg-muted/60 rounded" />
            <div className="h-7 w-20 bg-muted rounded" />
            <div className="h-3 w-36 bg-muted/40 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="space-y-1">
            <div className="h-4 w-40 bg-muted rounded" />
            <div className="h-3 w-64 bg-muted/50 rounded" />
          </div>
          <div className="h-5 w-24 bg-muted/60 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted/40 rounded" />
          <div className="h-3 w-5/6 bg-muted/40 rounded" />
        </div>
      </div>
    </div>
  );
}
