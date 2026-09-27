"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("flex items-center rounded-xl border border-border bg-card/60 p-1 gap-0.5", className)}>
        <div className="h-7 w-7 rounded-lg" />
        <div className="h-7 w-7 rounded-lg" />
        <div className="h-7 w-7 rounded-lg" />
      </div>
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className={cn(
        "flex items-center rounded-xl border border-border bg-card/80 p-0.5 shadow-2xs backdrop-blur-xs transition-colors",
        className
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={`${opt.label} theme`}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "relative flex h-7 items-center justify-center rounded-lg px-2 text-xs font-medium transition-all duration-150 select-none",
              isActive
                ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="sr-only">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ThemeDropdownItem() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="px-3 py-2 border-t border-border mt-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
          Appearance
        </span>
        <span className="text-[10px] font-mono text-muted-foreground capitalize">
          {theme || "System"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all",
            theme === "light"
              ? "bg-card text-foreground shadow-2xs border border-border font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sun className="h-3.5 w-3.5" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all",
            theme === "dark"
              ? "bg-card text-foreground shadow-2xs border border-border font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Moon className="h-3.5 w-3.5" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all",
            theme === "system"
              ? "bg-card text-foreground shadow-2xs border border-border font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Laptop className="h-3.5 w-3.5" />
          <span>System</span>
        </button>
      </div>
    </div>
  );
}
