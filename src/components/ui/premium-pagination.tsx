"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PremiumPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : currentPage * itemsPerPage;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-border text-xs font-mono",
        className
      )}
    >
      <div className="text-muted-foreground">
        {totalItems !== undefined ? (
          <span>
            Showing <strong className="text-foreground">{startItem}–{endItem}</strong> of{" "}
            <strong className="text-foreground">{totalItems}</strong> records
          </span>
        ) : (
          <span>
            Page <strong className="text-foreground">{currentPage}</strong> of{" "}
            <strong className="text-foreground">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all font-bold text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            if (totalPages <= 7) return true;
            if (page === 1 || page === totalPages) return true;
            if (Math.abs(page - currentPage) <= 1) return true;
            return false;
          })
          .map((page, idx, array) => {
            const prev = array[idx - 1];
            const showEllipsis = prev && page - prev > 1;

            return (
              <React.Fragment key={page}>
                {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "w-8 h-8 rounded-xl font-bold text-xs transition-all",
                    currentPage === page
                      ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                  )}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all font-bold text-xs"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
