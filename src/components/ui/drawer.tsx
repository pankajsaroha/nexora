"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  position?: "left" | "right";
  size?: "sm" | "md" | "lg" | "xl";
  width?: "sm" | "md" | "lg" | "xl" | string;
  footer?: React.ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  children,
  position = "right",
  size = "md",
  width,
  footer,
  className,
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const effectiveSize = width || size;
  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const positionClasses = {
    right: "inset-y-0 right-0 animate-in slide-in-from-right duration-200",
    left: "inset-y-0 left-0 animate-in slide-in-from-left duration-200",
  };

  const desc = subtitle || description;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={cn(
          "fixed flex w-full flex-col bg-card text-card-foreground shadow-2xl border-l border-border",
          positionClasses[position],
          sizeClasses[effectiveSize] || "max-w-md",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              {title}
            </h2>
            {desc && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {desc}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-card text-card-foreground">{children}</div>

        {/* Footer if provided */}
        {footer && (
          <div className="border-t border-border bg-muted/30 px-6 py-3 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
