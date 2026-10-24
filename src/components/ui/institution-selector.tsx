"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Building2, ChevronDown, Check, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface InstitutionItem {
  id: string;
  name: string;
  code: string;
  type?: string;
  status?: string;
}

export interface InstitutionSelectorProps {
  currentInstitutionId?: string;
  currentInstitutionName?: string;
  institutions?: InstitutionItem[];
  isSuperAdmin?: boolean;
  compactMobileTrigger?: boolean;
}

export function InstitutionSelector({
  currentInstitutionId,
  currentInstitutionName = "Select Institution",
  institutions = [],
  isSuperAdmin = false,
  compactMobileTrigger = false,
}: InstitutionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown and optionally restore focus to the trigger button
  const closeDropdown = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    setSearch("");
    if (restoreFocus) {
      setTimeout(() => triggerRef.current?.focus(), 50);
    }
  }, []);

  // Handle outside click / touch tap
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, closeDropdown]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeDropdown(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeDropdown]);

  // Autofocus search input when dropdown opens
  useEffect(() => {
    if (isOpen && institutions.length > 3) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, institutions.length]);

  if (!isSuperAdmin || institutions.length === 0) {
    return null;
  }

  const filtered = institutions.filter(
    (inst) =>
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectInstitution = async (instId: string) => {
    if (instId === currentInstitutionId) {
      closeDropdown(true);
      return;
    }

    setIsSwitching(true);
    try {
      const res = await fetch("/api/auth/switch-institution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId: instId }),
      });

      if (res.ok) {
        closeDropdown(false);
        router.refresh();
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to switch institution context");
        setIsSwitching(false);
      }
    } catch (err) {
      console.error("Institution switch error:", err);
      setIsSwitching(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {compactMobileTrigger ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isSwitching}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground hover:bg-muted active:scale-[0.98] transition-all shadow-2xs group cursor-pointer shrink-0"
          aria-label={`Switch institution context. Current: ${currentInstitutionName}`}
        >
          <Building2 className="h-3 w-3 text-accent shrink-0" />
          <span className="font-semibold text-[11px] text-accent">Switch</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform duration-150",
              isOpen && "rotate-180"
            )}
          />
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isSwitching}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="flex items-center gap-2 rounded-lg border border-border bg-card/90 hover:bg-card px-2.5 sm:px-3 py-1.5 text-xs text-foreground hover:border-accent/50 active:scale-[0.99] transition-all shadow-2xs group cursor-pointer"
          aria-label={`Select institution context. Current: ${currentInstitutionName}`}
        >
          <div className="w-5 h-5 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <Building2 className="h-3 w-3" />
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden text-left">
            <span className="text-[11px] text-muted-foreground hidden md:inline font-normal">
              Viewing:
            </span>
            <span className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[220px]">
              {currentInstitutionName}
            </span>
          </div>
          {isSwitching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent shrink-0" />
          ) : (
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform duration-150",
                isOpen && "rotate-180"
              )}
            />
          )}
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Institution selection menu"
          className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-xl border border-border bg-card p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2"
        >
          <div className="px-2 py-1 flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Authorized Institutions
            </span>
            <span className="text-[10px] font-mono text-accent font-semibold">
              {institutions.length} available
            </span>
          </div>

          {institutions.length > 3 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Filter institutions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    closeDropdown(true);
                  }
                }}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
          )}

            <div className="max-h-60 overflow-y-auto space-y-1">
              {filtered.map((inst) => {
                const isSelected = inst.id === currentInstitutionId;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => handleSelectInstitution(inst.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all",
                      isSelected
                        ? "bg-accent/10 border border-accent/20 font-semibold text-foreground"
                        : "hover:bg-muted/70 text-muted-foreground hover:text-foreground border border-transparent"
                    )}
                  >
                    <div className="overflow-hidden mr-2">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-foreground truncate">{inst.name}</p>
                        {inst.status && inst.status !== "ACTIVE" && (
                          <span
                            className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide shrink-0",
                              inst.status === "SUSPENDED"
                                ? "bg-warning-subtle text-warning border border-warning-border"
                                : "bg-muted text-muted-foreground border border-border"
                            )}
                          >
                            {inst.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {inst.code} {inst.type ? `· ${inst.type}` : ""}
                      </p>
                    </div>

                    {isSelected && <Check className="h-4 w-4 text-accent shrink-0" />}
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No matching institutions found
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-border mt-1">
              <Link
                href="/institutions"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1 text-[11px] font-semibold text-accent hover:underline p-1"
              >
                Manage All Institutions &rarr;
              </Link>
            </div>
          </div>
        )}
    </div>
  );
}
