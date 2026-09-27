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
    default: "bg-muted text-foreground border border-border",
    secondary: "bg-muted/60 text-muted-foreground border border-border",
    champagne: "bg-warm/15 text-foreground border border-warm/30",
    olive: "bg-accent/15 text-foreground border border-accent/30",
    burgundy: "bg-destructive/15 text-destructive border border-destructive/30",
    stone: "bg-muted text-muted-foreground border border-border",
    espresso: "bg-primary text-primary-foreground border border-primary",
    success: "bg-success/15 text-success border border-success/30",
    warning: "bg-warning/15 text-warning border border-warning/30",
    danger: "bg-destructive/15 text-destructive border border-destructive/30",
    info: "bg-primary-subtle text-primary border border-primary/25",
    neutral: "bg-muted text-muted-foreground border border-border",
    outline: "bg-transparent text-muted-foreground border border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg whitespace-nowrap transition-colors select-none",
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
