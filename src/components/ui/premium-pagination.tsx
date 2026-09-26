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
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-[#EFECE3] text-xs font-mono",
        className
      )}
    >
      <div className="text-[#7A756B]">
        {totalItems !== undefined ? (
          <span>
            Showing <strong className="text-[#171614]">{startItem}–{endItem}</strong> of{" "}
            <strong className="text-[#171614]">{totalItems}</strong> records
          </span>
        ) : (
          <span>
            Page <strong className="text-[#171614]">{currentPage}</strong> of{" "}
            <strong className="text-[#171614]">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] text-[#171614] hover:bg-[#EFECE3] disabled:opacity-40 disabled:pointer-events-none transition-all font-bold text-xs"
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
                {showEllipsis && <span className="px-1 text-[#7A756B]">...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "w-8 h-8 rounded-xl font-bold text-xs transition-all",
                    currentPage === page
                      ? "bg-[#1B1916] text-[#FAF8F3] shadow-2xs"
                      : "bg-[#FAF8F3] text-[#555047] hover:bg-[#EFECE3] hover:text-[#171614] border border-[#DCD7CB]"
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
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] text-[#171614] hover:bg-[#EFECE3] disabled:opacity-40 disabled:pointer-events-none transition-all font-bold text-xs"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
