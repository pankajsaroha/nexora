import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "champagne" | "olive" | "danger" | "ghost" | "link" | "subtle";
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
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#B89B62] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      xs: "text-xs px-2.5 py-1 gap-1.5",
      sm: "text-xs font-bold uppercase tracking-wider px-3 py-1.5 gap-1.5",
      md: "text-xs sm:text-sm font-bold uppercase tracking-wider px-4 py-2.5 gap-2",
      lg: "text-sm sm:text-base font-bold uppercase tracking-wider px-5 py-3 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-[#1B1916] text-[#F7F4ED] hover:bg-[#2A2722] hover:border-[#B89B62] border border-[#1B1916] shadow-xs",
      secondary:
        "bg-[#FAF8F3] text-[#171614] hover:bg-[#EFECE3] border border-[#DCD7CB] shadow-2xs hover:border-[#B89B62]",
      outline:
        "border border-[#DCD7CB] bg-white text-[#171614] hover:bg-[#FAF8F3] hover:border-[#B89B62] shadow-2xs",
      champagne:
        "bg-[#FAF6ED] text-[#856D3B] hover:bg-[#F3EBD8] border border-[#D4B87C]/60 shadow-2xs",
      olive:
        "bg-[#F4F6F1] text-[#525E4B] hover:bg-[#E5EAE0] border border-[#65705B]/30 shadow-2xs",
      subtle:
        "bg-[#FAF8F3] text-[#555047] hover:bg-[#EFECE3] hover:text-[#171614] border border-[#E5E0D5]",
      danger:
        "bg-[#6F3D3A] text-[#FAF8F3] hover:bg-[#8C4A47] border border-[#572F2D] shadow-2xs",
      ghost:
        "text-[#555047] hover:bg-[#FAF8F3] hover:text-[#171614]",
      link: "text-[#856D3B] hover:text-[#171614] hover:underline p-0 h-auto focus:ring-0 font-bold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-[#D4B87C]" />
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
