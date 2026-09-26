import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "champagne"
    | "olive"
    | "burgundy"
    | "stone"
    | "espresso"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral"
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
    sm: "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 font-bold",
    md: "text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 font-bold",
  };

  const variantStyles = {
    default: "bg-[#FAF8F3] text-[#171614] border border-[#E5E0D5]",
    secondary: "bg-[#FAF8F3] text-[#7A756B] border border-[#DCD7CB]",
    champagne: "bg-[#FAF6ED] text-[#856D3B] border border-[#D4B87C]/50",
    olive: "bg-[#F4F6F1] text-[#525E4B] border border-[#65705B]/30",
    burgundy: "bg-[#FAF6ED] text-[#6F3D3A] border border-[#8C4A47]/30",
    stone: "bg-[#FAF8F3] text-[#7A756B] border border-[#DCD7CB]",
    espresso: "bg-[#1B1916] text-[#FAF8F3] border border-[#35322C]",
    success: "bg-[#F4F6F1] text-[#525E4B] border border-[#65705B]/30",
    warning: "bg-[#FAF6ED] text-[#856D3B] border border-[#D4B87C]/50",
    danger: "bg-[#FAF6ED] text-[#6F3D3A] border border-[#8C4A47]/30",
    info: "bg-[#FAF6ED] text-[#856D3B] border border-[#D4B87C]/40",
    neutral: "bg-[#FAF8F3] text-[#555047] border border-[#E5E0D5]",
    outline: "bg-transparent text-[#555047] border border-[#DCD7CB]",
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
