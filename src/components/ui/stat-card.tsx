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
        "relative overflow-hidden rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs transition-editorial hover:border-slate-400 space-y-2",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
          {title}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-md bg-[#FAF9F5] border border-[#E8E7DF] flex items-center justify-center text-slate-600 shrink-0">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
          {value}
        </div>
        {change && (
          <span
            className={cn(
              "inline-flex items-center text-[11px] font-mono font-semibold",
              isPositive ? "text-emerald-700" : "text-rose-600"
            )}
          >
            {isPositive ? "↑" : "↓"} {change}
          </span>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-slate-500 font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
