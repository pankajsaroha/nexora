"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] w-fit shadow-2xs", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all select-none",
              isActive
                ? "bg-[#1B1916] text-[#FAF8F3] shadow-xs"
                : "text-[#555047] hover:bg-white hover:text-[#171614]"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.2 text-[10px] font-mono",
                  isActive
                    ? "bg-[#2E2B25] text-[#D4B87C]"
                    : "bg-[#EFECE3] text-[#7A756B]"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
