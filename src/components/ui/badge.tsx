import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "accent"
    | "gold"
    | "amethyst"
    | "plum"
    | "indigo"
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
    sm: "text-[10px] font-medium tracking-wide px-2 py-0.5",
    md: "text-[11px] font-medium tracking-wide px-2.5 py-0.5",
  };

  const variantStyles = {
    default: "bg-muted text-foreground border border-border",
    secondary: "bg-surface-subtle text-foreground-secondary border border-border",
    accent: "bg-accent-subtle text-accent border border-accent/20 font-medium",
    gold: "bg-accent-subtle text-accent border border-accent/30 font-medium",
    amethyst: "bg-accent-subtle text-accent border border-accent/20 font-medium",
    plum: "bg-accent-subtle text-accent border border-accent/20 font-medium",
    indigo: "bg-accent-subtle text-accent border border-accent/20 font-medium",
    champagne: "bg-accent-subtle text-accent border border-accent/20 font-medium",
    olive: "bg-muted text-muted-foreground border border-border",
    burgundy: "bg-destructive-subtle text-destructive border border-destructive-border font-medium",
    stone: "bg-muted text-muted-foreground border border-border",
    espresso: "bg-card text-foreground border border-border font-semibold",
    success: "bg-success-subtle text-success border border-success-border font-medium",
    warning: "bg-warning-subtle text-warning border border-warning-border font-medium",
    danger: "bg-destructive-subtle text-destructive border border-destructive-border font-medium",
    info: "bg-info-subtle text-info border border-info-border font-medium",
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
