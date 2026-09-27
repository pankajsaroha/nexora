"use client";

import React, { useState } from "react";
import { Building2, ChevronDown, Check, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface InstitutionItem {
  id: string;
  name: string;
  code: string;
  type?: string;
}

export interface InstitutionSelectorProps {
  currentInstitutionId?: string;
  currentInstitutionName?: string;
  institutions?: InstitutionItem[];
  isSuperAdmin?: boolean;
}

export function InstitutionSelector({
  currentInstitutionId,
  currentInstitutionName = "Select Institution",
  institutions = [],
  isSuperAdmin = false,
}: InstitutionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const router = useRouter();

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
      setIsOpen(false);
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
        setIsOpen(false);
        router.refresh();
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to switch institution context");
      }
    } catch (err) {
      console.error("Institution switch error:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 rounded-xl border border-border bg-card/90 hover:bg-card px-2.5 sm:px-3 py-1.5 text-xs text-foreground hover:border-primary/50 transition-all shadow-2xs group cursor-pointer"
        aria-label="Select institution context"
      >
        <div className="w-5 h-5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
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
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform duration-150" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-border bg-card p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2">
            <div className="px-2 py-1 flex items-center justify-between border-b border-border/70 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">
                Authorized Institutions
              </span>
              <span className="text-[10px] font-mono text-primary font-semibold">
                {institutions.length} available
              </span>
            </div>

            {institutions.length > 3 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter institutions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
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
                      "w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all",
                      isSelected
                        ? "bg-primary-subtle border border-primary/30 font-semibold text-foreground"
                        : "hover:bg-muted/70 text-muted-foreground hover:text-foreground border border-transparent"
                    )}
                  >
                    <div className="overflow-hidden mr-2">
                      <p className="font-semibold text-foreground truncate">{inst.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {inst.code} {inst.type ? `· ${inst.type}` : ""}
                      </p>
                    </div>

                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No matching institutions found
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
