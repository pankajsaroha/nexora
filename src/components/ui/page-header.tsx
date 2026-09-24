import React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  category?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  category,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#E8E7DF] pb-6 mb-8",
        className
      )}
    >
      <div>
        {category && (
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
            {category}
          </span>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
