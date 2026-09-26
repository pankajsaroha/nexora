"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  GraduationCap,
  CheckSquare,
  ArrowRight,
  Command,
  X,
  BookOpen,
  Calendar,
  CreditCard,
  Loader2,
  Receipt,
  Clock,
  School,
} from "lucide-react";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    students: any[];
    teachers: any[];
    classes: any[];
    tasks: any[];
  }>({
    students: [],
    teachers: [],
    classes: [],
    tasks: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ students: [], teachers: [], classes: [], tasks: [] });
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ students: [], teachers: [], classes: [], tasks: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Command palette query error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const hasResults =
    results.students.length > 0 ||
    results.teachers.length > 0 ||
    results.classes.length > 0 ||
    results.tasks.length > 0;

  return (
    <>
      {/* Trigger button for topbar */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center justify-between w-full max-w-sm rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] py-2 px-3.5 text-xs text-[#7A756B] hover:text-[#171614] hover:border-[#B89B62] transition-all shadow-2xs"
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-[#7A756B]" />
          <span>Search students, faculty, classes, tasks...</span>
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-[#DCD7CB] bg-white px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#7A756B]">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-[#171614]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-2xl rounded-2xl border border-[#E5E0D5] bg-white shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="flex items-center px-4 border-b border-[#EFECE3] bg-[#FAF8F3]">
              <Search className="w-4 h-4 text-[#7A756B] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type student name, admission #, teacher, subject, or task..."
                className="w-full py-4 px-3 text-xs text-[#171614] bg-transparent placeholder-[#7A756B] focus:outline-none"
              />
              {loading && <Loader2 className="w-4 h-4 text-[#B89B62] animate-spin shrink-0" />}
              {query && !loading && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-lg text-[#7A756B] hover:text-[#171614] hover:bg-[#EFECE3]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-3 bg-white">
              {/* If no query, show quick navigation */}
              {!query.trim() && (
                <div className="p-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] px-2 block mb-2">
                    Quick Jump Navigation
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { title: "Students Directory", icon: Users, url: "/students" },
                      { title: "Faculty & Staff", icon: GraduationCap, url: "/teachers" },
                      { title: "Daily Attendance", icon: Calendar, url: "/attendance" },
                      { title: "Timetable Grid", icon: Clock, url: "/academics/timetable" },
                      { title: "Classes & Sections", icon: School, url: "/academics/classes" },
                      { title: "Fee Ledger & Invoices", icon: Receipt, url: "/finance/fees" },
                      { title: "Operational Tasks", icon: CheckSquare, url: "/tasks" },
                      { title: "Academic Assignments", icon: BookOpen, url: "/academics/assignments" },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSelect(item.url)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-semibold text-[#35322C] hover:bg-[#FAF8F3] hover:text-[#171614] border border-transparent hover:border-[#DCD7CB] transition-all"
                        >
                          <Icon className="w-3.5 h-3.5 text-[#7A756B]" />
                          <span className="truncate">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Results */}
              {query.trim() && !loading && !hasResults && (
                <div className="py-12 text-center text-[#7A756B] text-xs space-y-1">
                  <p className="font-bold text-[#171614]">No records found</p>
                  <p className="text-[11px]">
                    No students, faculty, classes, or tasks matched &quot;{query}&quot;.
                  </p>
                </div>
              )}

              {/* Students Results */}
              {results.students.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] px-2 block mb-1">
                    Students ({results.students.length})
                  </span>
                  <div className="space-y-1">
                    {results.students.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleSelect(`/students?search=${encodeURIComponent(st.fullName)}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-[#FAF8F3] transition-colors group border border-transparent hover:border-[#DCD7CB]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#FAF6ED] border border-[#D4B87C]/50 flex items-center justify-center text-[#856D3B] font-bold text-[11px]">
                            {st.fullName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#171614] group-hover:text-[#856D3B]">
                              {st.fullName}
                            </p>
                            <p className="text-[11px] text-[#7A756B] font-mono">
                              {st.currentClass?.name} - {st.currentSection?.name} • Roll #{st.rollNumber || "—"} • {st.admissionNumber}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#7A756B] group-hover:text-[#171614] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Teachers Results */}
              {results.teachers.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] px-2 block mb-1">
                    Faculty & Staff ({results.teachers.length})
                  </span>
                  <div className="space-y-1">
                    {results.teachers.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelect(`/teachers?search=${encodeURIComponent(t.fullName)}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-[#FAF8F3] transition-colors group border border-transparent hover:border-[#DCD7CB]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#F4F6F1] border border-[#65705B]/30 flex items-center justify-center text-[#525E4B] font-bold text-[11px]">
                            {t.fullName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#171614] group-hover:text-[#525E4B]">
                              {t.fullName}
                            </p>
                            <p className="text-[11px] text-[#7A756B] font-mono">
                              {t.designation} • {t.employeeId}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#7A756B] group-hover:text-[#171614] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Classes Results */}
              {results.classes.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] px-2 block mb-1">
                    Classes & Cohorts ({results.classes.length})
                  </span>
                  <div className="space-y-1">
                    {results.classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => handleSelect("/academics/classes")}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-[#FAF8F3] transition-colors group border border-transparent hover:border-[#DCD7CB]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#FAF8F3] border border-[#E5E0D5] flex items-center justify-center text-[#171614] font-bold text-[11px]">
                            {cls.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#171614]">
                              {cls.name}
                            </p>
                            <p className="text-[11px] text-[#7A756B] font-mono">
                              {cls.sections?.length || 0} Sections Active
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#7A756B] group-hover:text-[#171614] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Results */}
              {results.tasks.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] px-2 block mb-1">
                    Tasks ({results.tasks.length})
                  </span>
                  <div className="space-y-1">
                    {results.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleSelect("/tasks")}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-[#FAF8F3] transition-colors group border border-transparent hover:border-[#DCD7CB]"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckSquare className="w-4 h-4 text-[#856D3B]" />
                          <div>
                            <p className="text-xs font-bold text-[#171614]">
                              {task.title}
                            </p>
                            <p className="text-[11px] text-[#7A756B] font-mono">
                              Priority: {task.priority} • Status: {task.status}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#7A756B] group-hover:text-[#171614] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
