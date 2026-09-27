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
        className="flex items-center justify-between w-full max-w-[260px] sm:max-w-[320px] rounded-xl border border-border bg-card/90 hover:bg-card py-2 px-3 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all shadow-2xs group cursor-pointer"
        aria-label="Search students, faculty, classes and tasks"
      >
        <span className="flex items-center gap-2 overflow-hidden mr-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
          <span className="truncate whitespace-nowrap text-left text-[11px] sm:text-xs">
            Search students, faculty, classes...
          </span>
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border bg-muted/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground shrink-0">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="flex items-center px-4 border-b border-border bg-muted/40">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type student name, admission #, teacher, subject, or task..."
                className="w-full py-4 px-3 text-xs text-foreground bg-transparent placeholder:text-muted-foreground focus:outline-none"
              />
              {loading && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />}
              {query && !loading && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-3 bg-card text-card-foreground">
              {/* If no query, show quick navigation */}
              {!query.trim() && (
                <div className="p-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2 block mb-2">
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
                          className="flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-semibold text-foreground hover:bg-muted border border-transparent hover:border-border transition-all"
                        >
                          <Icon className="w-3.5 h-3.5 text-primary" />
                          <span className="truncate">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Results */}
              {query.trim() && !loading && !hasResults && (
                <div className="py-12 text-center text-muted-foreground text-xs space-y-1">
                  <p className="font-bold text-foreground">No records found</p>
                  <p className="text-[11px]">
                    No students, faculty, classes, or tasks matched &quot;{query}&quot;.
                  </p>
                </div>
              )}

              {/* Students Results */}
              {results.students.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2 block mb-1">
                    Students ({results.students.length})
                  </span>
                  <div className="space-y-1">
                    {results.students.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleSelect(`/students?search=${encodeURIComponent(st.fullName)}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-muted transition-colors group border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary font-bold text-[11px]">
                            {st.fullName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground group-hover:text-primary">
                              {st.fullName}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {st.currentClass?.name} - {st.currentSection?.name} • Roll #{st.rollNumber || "—"} • {st.admissionNumber}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Teachers Results */}
              {results.teachers.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2 block mb-1">
                    Faculty & Staff ({results.teachers.length})
                  </span>
                  <div className="space-y-1">
                    {results.teachers.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelect(`/teachers?search=${encodeURIComponent(t.fullName)}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-muted transition-colors group border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-accent-subtle border border-accent/20 flex items-center justify-center text-accent font-bold text-[11px]">
                            {t.fullName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground group-hover:text-primary">
                              {t.fullName}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {t.designation} • {t.employeeId}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Classes Results */}
              {results.classes.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2 block mb-1">
                    Classes & Cohorts ({results.classes.length})
                  </span>
                  <div className="space-y-1">
                    {results.classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => handleSelect("/academics/classes")}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-muted transition-colors group border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground font-bold text-[11px]">
                            {cls.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              {cls.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {cls.sections?.length || 0} Sections Active
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Results */}
              {results.tasks.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2 block mb-1">
                    Tasks ({results.tasks.length})
                  </span>
                  <div className="space-y-1">
                    {results.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleSelect("/tasks")}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-muted transition-colors group border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckSquare className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              {task.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              Priority: {task.priority} • Status: {task.status}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
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
