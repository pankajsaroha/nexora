"use client";

import React, { useState } from "react";
import { Library, Search, BookOpen, CheckCircle2, AlertCircle, Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { useRouter } from "next/navigation";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "Science & Technology",
    totalCopies: 5,
    rackLocation: "Rack A-04",
  });

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

  const handleExportCatalog = () => {
    const csvContent = [
      ["Title", "Author", "ISBN", "Category", "Total Copies", "Available Copies", "Rack Location"].join(","),
      ...books.map((b) =>
        [
          `"${b.title}"`,
          `"${b.author}"`,
          b.isbn,
          b.category,
          b.totalCopies,
          b.availableCopies,
          b.rackLocation || "-",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Nexora_Library_Catalog.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddVolume = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAddSuccess(true);
      setTimeout(() => {
        setIsAddModalOpen(false);
        setAddSuccess(false);
        router.refresh();
      }, 1000);
    }, 600);
  };

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
              onClick={handleExportCatalog}
              leftIcon={<Download className="h-3.5 w-3.5 text-[#B89B62]" />}
            >
              Export Catalog
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Volume
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Total Titles</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{books.length}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Unique cataloged works</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Total Volumes</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{totalVolumes}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Copies in collection</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Currently Issued</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{totalIssued}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Borrowed by scholars/faculty</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Shelf Availability</div>
          <div className="mt-1 text-2xl font-bold text-[#65705B]">
            {totalVolumes > 0 ? Math.round((totalAvailable / totalVolumes) * 100) : 0}%
          </div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">{totalAvailable} copies on racks</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[#E5E0D5] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#65705B]" />
          <input
            type="search"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] py-2 pl-9 pr-3 text-xs text-[#171614] placeholder:text-[#65705B] focus:outline-none focus:ring-1 focus:ring-[#171614] transition-colors"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-[#E5E0D5] bg-white px-3 py-2 text-xs font-semibold text-[#171614] focus:outline-none w-full sm:w-auto"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Books Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5E0D5] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E5E0D5] bg-[#FAF8F3] text-[#65705B] font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">Book Title & Details</th>
                <th className="py-3 px-4 font-bold">Author</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Rack Location</th>
                <th className="py-3 px-4 font-bold">Total / Available</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5]">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#65705B] font-mono text-xs">
                    No books cataloged matching this search.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-[#FAF8F3] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#171614] flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-[#B89B62]" />
                        {book.title}
                      </div>
                      <div className="text-[11px] text-[#65705B] font-mono mt-0.5 pl-5.5">
                        ISBN: {book.isbn}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#171614] font-medium">
                      {book.author}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" size="sm">
                        {book.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#171614]">
                      {book.rackLocation || "General Stacks"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#171614]">
                      <span className="text-[#65705B]">{book.availableCopies}</span> / {book.totalCopies}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                          book.availableCopies > 0
                            ? "bg-[#65705B]/10 text-[#65705B] border border-[#65705B]/20"
                            : "bg-[#8B3A3A]/10 text-[#8B3A3A] border border-[#8B3A3A]/20"
                        }`}
                      >
                        {book.availableCopies > 0 ? "Available" : "All Issued"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Volume Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Catalog Accession"
          description="Register a new volume into the institutional library collection."
          size="md"
        >
          {addSuccess ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#B89B62] text-[#B89B62] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#171614]">Volume Cataloged</h4>
              <p className="text-xs text-[#65705B]">
                Book copies are now accessioned and available in the lending circulation ledger.
              </p>
            </div>
          ) : (
            <form onSubmit={handleAddVolume} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171614] mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fundamentals of Quantum Physics"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Author *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David J. Griffiths"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">ISBN Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="978-0-13-111892-8"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  >
                    <option value="Science & Technology">Science & Technology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Literature & Humanities">Literature & Humanities</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="General Reference">General Reference</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Total Copies *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#171614] mb-1">Rack / Shelf Location</label>
                <input
                  type="text"
                  placeholder="e.g. Rack B-12 (Shelf 3)"
                  value={formData.rackLocation}
                  onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E0D5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Accession Volume
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
