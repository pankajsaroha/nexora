"use client";

import React, { useState } from "react";
import { Library, Search, BookOpen, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export interface BookItem {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  rackLocation?: string | null;
}

export function LibraryClient({ books }: { books: BookItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const categories = Array.from(new Set(books.map((b) => b.category)));
  const totalVolumes = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const totalAvailable = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const totalIssued = totalVolumes - totalAvailable;

  const filteredBooks = books.filter((b) => {
    const matchQ =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.includes(search);
    const matchCat = category === "ALL" || b.category === category;
    return matchQ && matchCat;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        category="Learning Resources & Media"
        title="Library & Catalog Index"
        description="Book stock inventories, lending circulation ledgers, ISBN indices, and rack shelf locations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Circulation registry exported.")}
            >
              Export Catalog
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => alert("Add Book accession modal will open.")}
            >
              Add Volume
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Titles</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{books.length}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Unique cataloged works</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Volumes</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalVolumes}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Copies in collection</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Currently Issued</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalIssued}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Borrowed by scholars/faculty</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Shelf Availability</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            {totalVolumes > 0 ? Math.round((totalAvailable / totalVolumes) * 100) : 0}%
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">{totalAvailable} copies on racks</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[#E8E7DF] shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="search"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] px-3 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none w-full sm:w-auto font-mono text-[11px]"
        >
          <option value="ALL">ALL CATEGORIES</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Catalog Table */}
      <div className="overflow-hidden rounded-xl border border-[#E8E7DF] bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#E8E7DF] bg-[#FAF9F5] text-slate-500 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Volume Title & Author</th>
              <th className="py-3 px-4">ISBN Identifier</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Rack / Shelf</th>
              <th className="py-3 px-4 text-center">Available / Total</th>
              <th className="py-3 px-4 text-right">Circulation Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E7DF]">
            {filteredBooks.map((b) => (
              <tr key={b.id} className="hover:bg-[#FAF9F5] transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900">{b.title}</div>
                  <div className="text-[11px] text-slate-400 font-serif italic">{b.author}</div>
                </td>
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{b.isbn}</td>
                <td className="py-3 px-4">
                  <Badge variant="outline" size="sm">
                    {b.category}
                  </Badge>
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                  {b.rackLocation || "Main Wing — A1"}
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                  {b.availableCopies} <span className="text-slate-400 font-normal">/ {b.totalCopies}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Badge variant={b.availableCopies > 0 ? "success" : "danger"} size="sm">
                    {b.availableCopies > 0 ? "Available" : "All Issued"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
