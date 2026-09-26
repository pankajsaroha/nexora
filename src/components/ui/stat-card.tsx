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
        "relative overflow-hidden rounded-2xl border border-[#E5E0D5] bg-white p-5 shadow-2xs transition-all hover:border-[#B89B62] space-y-2",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">
          {title}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-[#FAF8F3] border border-[#E5E0D5] flex items-center justify-center text-[#171614] shrink-0 shadow-2xs">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171614]">
          {value}
        </div>
        {change && (
          <span
            className={cn(
              "inline-flex items-center text-[11px] font-mono font-bold",
              isPositive ? "text-[#525E4B]" : "text-[#6F3D3A]"
            )}
          >
            {isPositive ? "↑" : "↓"} {change}
          </span>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-[#7A756B] font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
