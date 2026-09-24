import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "link" | "subtle";
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
      "inline-flex items-center justify-center font-medium rounded-lg transition-editorial focus:outline-none focus:ring-1 focus:ring-[#0F172A] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      xs: "text-xs px-2.5 py-1 gap-1.5",
      sm: "text-xs font-semibold px-3.5 py-2 gap-2",
      md: "text-xs sm:text-sm font-semibold px-4 py-2.5 gap-2",
      lg: "text-sm sm:text-base font-semibold px-5 py-3 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-[#0F172A] text-white hover:bg-slate-800 border border-slate-800 shadow-2xs",
      secondary:
        "bg-white text-slate-800 hover:bg-[#FAF9F5] border border-[#E8E7DF] shadow-2xs hover:border-slate-400",
      outline:
        "border border-[#E8E7DF] bg-white text-slate-700 hover:bg-[#FAF9F5] hover:border-slate-400 shadow-2xs",
      subtle:
        "bg-[#FAF9F5] text-slate-700 hover:bg-slate-100 border border-[#E8E7DF]",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 border border-rose-700 shadow-2xs",
      ghost:
        "text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]",
      link: "text-[#1E3A8A] hover:underline p-0 h-auto focus:ring-0 font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
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

