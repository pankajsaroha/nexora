"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  GraduationCap,
  Layers,
  CheckSquare,
  ArrowRight,
  Sparkles,
  Command,
  X,
  BookOpen,
  Calendar,
  CreditCard,
  Building,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        className="hidden sm:flex items-center justify-between w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 py-1.5 px-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span>Search students, staff, classes, tasks...</span>
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a student name, roll number, teacher, class code, or task..."
                className="w-full py-3.5 px-3 text-xs text-slate-900 dark:text-slate-100 bg-transparent placeholder-slate-400 focus:outline-none"
              />
              {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />}
              {query && !loading && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-3">
              {/* If no query, show quick navigation */}
              {!query.trim() && (
                <div className="p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                    Quick Jump Navigation
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { title: "Students Directory", icon: Users, url: "/students" },
                      { title: "Faculty & Staff", icon: GraduationCap, url: "/teachers" },
                      { title: "Attendance Roster", icon: Calendar, url: "/attendance/student" },
                      { title: "Timetable Grid", icon: BookOpen, url: "/timetable" },
                      { title: "Fee Ledger & Invoices", icon: CreditCard, url: "/fees" },
                      { title: "Operational Tasks", icon: CheckSquare, url: "/tasks" },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSelect(item.url)}
                          className="flex items-center gap-2.5 p-2 rounded-lg text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Results */}
              {query.trim() && !loading && !hasResults && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <p className="font-semibold text-slate-600 dark:text-slate-300">No records found</p>
                  <p className="text-[11px] mt-0.5">
                    No students, faculty, classes, or tasks matched &quot;{query}&quot;.
                  </p>
                </div>
              )}

              {/* Students Results */}
              {results.students.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                    Students ({results.students.length})
                  </span>
                  <div className="space-y-1">
                    {results.students.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleSelect(`/students?search=${encodeURIComponent(st.fullName)}`)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                            {st.fullName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {st.fullName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {st.currentClass?.name} - {st.currentSection?.name} • Roll #{st.rollNumber || "—"} • {st.admissionNumber}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Teachers Results */}
              {results.teachers.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                    Faculty & Staff ({results.teachers.length})
                  </span>
                  <div className="space-y-1">
                    {results.teachers.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelect(`/teachers?search=${encodeURIComponent(t.fullName)}`)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                            {t.fullName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {t.fullName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {t.designation} • {t.employeeId}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Classes Results */}
              {results.classes.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                    Classes & Cohorts ({results.classes.length})
                  </span>
                  <div className="space-y-1">
                    {results.classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => handleSelect(`/timetable?class=${cls.id}`)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {cls.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Code: {cls.code} • {cls.sections?.length || 0} Sections
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Results */}
              {results.tasks.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                    Operational Tasks ({results.tasks.length})
                  </span>
                  <div className="space-y-1">
                    {results.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleSelect(`/tasks`)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckSquare className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {task.title}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Status: {task.status} • Priority: {task.priority}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {task.status}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>NEXORA Instant Index Query</span>
              </span>
              <span className="font-mono">ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
