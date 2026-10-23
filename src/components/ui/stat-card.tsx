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
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-border-strong hover:shadow-card space-y-2 group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground block">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-foreground-secondary shrink-0 shadow-2xs group-hover:text-accent group-hover:border-accent/30 transition-colors">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {change && (
          <span
            className={cn(
              "inline-flex items-center text-[11px] font-mono font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? "↑" : "↓"} {change}
          </span>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-muted-foreground leading-tight">
          {description}
        </p>
      )}
    </div>
  );
}
