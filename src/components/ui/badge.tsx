import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "purple"
    | "neutral"
    | "secondary"
    | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 font-semibold",
    md: "text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 font-semibold",
  };

  const variantStyles = {
    default: "bg-slate-100 text-[#0F172A] border border-[#E8E7DF]",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-800 border border-amber-200/80",
    danger: "bg-rose-50 text-rose-800 border border-rose-200/80",
    info: "bg-sky-50 text-sky-800 border border-sky-200/80",
    purple: "bg-slate-100 text-[#1E3A8A] border border-blue-200",
    neutral: "bg-[#FAF9F5] text-slate-700 border border-[#E8E7DF]",
    secondary: "bg-slate-100 text-slate-700 border border-slate-200",
    outline: "bg-transparent text-slate-600 border border-[#E8E7DF]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md whitespace-nowrap transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

