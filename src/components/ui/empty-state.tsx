import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#DCD7CB] bg-[#FAF8F3] space-y-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E0D5] flex items-center justify-center text-[#856D3B] shadow-2xs">
        <Icon className="h-6 w-6" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-sm font-extrabold text-[#171614] tracking-tight">{title}</h3>
        <p className="text-xs text-[#7A756B] leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
