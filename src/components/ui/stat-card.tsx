import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  description,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-primary/40 space-y-2 group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center text-primary shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {value}
        </div>
        {change && (
          <span
            className={cn(
              "inline-flex items-center text-[11px] font-mono font-bold",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? "↑" : "↓"} {change}
          </span>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-muted-foreground font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
