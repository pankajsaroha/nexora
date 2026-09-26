import React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  category?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  category,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const label = eyebrow || category;

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#E5E0D5] pb-6 mb-8",
        className
      )}
    >
      <div>
        {label && (
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#7A756B] font-bold block mb-1">
            {label}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171614]">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-[#555047] mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(actions || children) && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
