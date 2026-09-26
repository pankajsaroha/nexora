import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#7A756B]">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3.5 py-2.5 text-xs text-[#171614] placeholder:text-[#7A756B] focus:bg-white focus:border-[#B89B62] focus:outline-none focus:ring-2 focus:ring-[#B89B62] transition-all disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-9",
            rightIcon && "pr-9",
            error && "border-[#8C4A47] focus:ring-[#8C4A47]",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#7A756B]">
            {rightIcon}
          </div>
        )}
        {error && <p className="mt-1 text-[11px] text-[#6F3D3A]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
