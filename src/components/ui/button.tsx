import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "champagne"
    | "olive"
    | "danger"
    | "ghost"
    | "link"
    | "subtle";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      xs: "text-xs px-2.5 py-1 gap-1.5",
      sm: "text-xs font-bold uppercase tracking-wider px-3 py-1.5 gap-1.5",
      md: "text-xs sm:text-sm font-bold uppercase tracking-wider px-4 py-2.5 gap-2",
      lg: "text-sm sm:text-base font-bold uppercase tracking-wider px-5 py-3 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary-hover border border-primary shadow-xs",
      secondary:
        "bg-card text-foreground hover:bg-muted border border-border shadow-2xs",
      outline:
        "border border-border bg-transparent text-foreground hover:bg-muted shadow-2xs",
      champagne:
        "bg-warm/15 text-foreground hover:bg-warm/25 border border-warm/30 shadow-2xs",
      olive:
        "bg-accent/15 text-foreground hover:bg-accent/25 border border-accent/30 shadow-2xs",
      subtle:
        "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border",
      danger:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive shadow-2xs",
      ghost:
        "text-muted-foreground hover:bg-muted hover:text-foreground",
      link: "text-primary hover:text-primary-hover hover:underline p-0 h-auto focus:ring-0 font-bold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
