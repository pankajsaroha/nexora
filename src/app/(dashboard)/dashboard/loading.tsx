import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2 font-sans animate-pulse">
      {/* 1. Header & Greeting Skeleton */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-muted rounded-md" />
          <div className="h-8 w-64 bg-muted rounded-lg" />
          <div className="h-4 w-48 bg-muted rounded-md" />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="h-9 w-28 bg-muted rounded-xl" />
          <div className="h-9 w-28 bg-muted rounded-xl" />
          <div className="h-9 w-32 bg-muted rounded-xl" />
        </div>
      </div>

      {/* 2. Top 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-2xs">
            <div className="h-3 w-24 bg-muted rounded-md" />
            <div className="h-8 w-20 bg-muted rounded-lg" />
            <div className="h-3 w-32 bg-muted rounded-md" />
          </div>
        ))}
      </div>

      {/* 3. Attention Section Skeleton */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-2xs">
        <div className="h-4 w-40 bg-muted rounded-md" />
        <div className="space-y-2">
          <div className="h-12 w-full bg-muted/40 rounded-xl" />
          <div className="h-12 w-full bg-muted/40 rounded-xl" />
        </div>
      </div>

      {/* 4. Two-Column Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-card space-y-4 shadow-2xs h-64" />
        <div className="lg:col-span-7 p-5 rounded-2xl border border-border bg-card space-y-4 shadow-2xs h-64" />
      </div>

      {/* 5. Second Two-Column Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 rounded-2xl border border-border bg-card space-y-4 shadow-2xs h-56" />
        <div className="lg:col-span-6 p-5 rounded-2xl border border-border bg-card space-y-4 shadow-2xs h-56" />
      </div>
    </div>
  );
}
