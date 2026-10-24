"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Building2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface SearchResults {
  students: any[];
  teachers: any[];
  classes: any[];
  tasks: any[];
  institutions?: any[];
}

const QUICK_NAV_ITEMS = [
  { title: "Students Directory", icon: Users, url: "/students" },
  { title: "Faculty & Staff", icon: GraduationCap, url: "/teachers" },
  { title: "Daily Attendance", icon: Calendar, url: "/attendance" },
  { title: "Timetable Grid", icon: Clock, url: "/academics/timetable" },
  { title: "Classes & Sections", icon: School, url: "/academics/classes" },
  { title: "Fee Ledger & Invoices", icon: Receipt, url: "/finance/fees" },
  { title: "Operational Tasks", icon: CheckSquare, url: "/tasks" },
  { title: "Academic Assignments", icon: BookOpen, url: "/academics/assignments" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [results, setResults] = useState<SearchResults>({
    students: [],
    teachers: [],
    classes: [],
    tasks: [],
    institutions: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const clientCacheRef = useRef<Map<string, { data: SearchResults; timestamp: number }>>(new Map());
  const router = useRouter();

  // Listen for Ctrl+K, Cmd+K, and Escape
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

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(-1);
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setQuery("");
      setError(null);
      setResults({ students: [], teachers: [], classes: [], tasks: [], institutions: [] });
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Debounced search query with AbortController, request ID sequencing & client caching
  useEffect(() => {
    const trimmed = query.trim();
    setError(null);

    if (!trimmed || trimmed.length < 2) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setResults({ students: [], teachers: [], classes: [], tasks: [], institutions: [] });
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    const normalized = trimmed.toLowerCase();

    // Check client-side LRU cache for instant 0ms responses on repeated queries
    const cached = clientCacheRef.current.get(normalized);
    if (cached && Date.now() - cached.timestamp < 60_000) {
      setResults(cached.data);
      setLoading(false);
      setSelectedIndex(0);
      return;
    }

    setLoading(true);
    const requestId = ++activeRequestIdRef.current;

    // 280ms debounce window
    const timer = setTimeout(async () => {
      // Abort any stale in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        // Ignore stale response if user continued typing
        if (requestId !== activeRequestIdRef.current) {
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Search failed with status ${res.status}`);
        }

        const data = await res.json();
        if (requestId === activeRequestIdRef.current) {
          const formatted: SearchResults = {
            students: data.students || [],
            teachers: data.teachers || [],
            classes: data.classes || [],
            tasks: data.tasks || [],
            institutions: data.institutions || [],
          };
          setResults(formatted);
          setError(null);
          setSelectedIndex(0);

          // Save to client cache
          clientCacheRef.current.set(normalized, { data: formatted, timestamp: Date.now() });
          if (clientCacheRef.current.size > 50) {
            const oldestKey = clientCacheRef.current.keys().next().value;
            if (oldestKey) clientCacheRef.current.delete(oldestKey);
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          return; // Expected cancellation of stale query
        }
        if (requestId === activeRequestIdRef.current) {
          console.error("Command palette query error:", err);
          setError(err.message || "Failed to fetch search results.");
        }
      } finally {
        if (requestId === activeRequestIdRef.current) {
          setLoading(false);
        }
      }
    }, 280);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  // Compile navigable items for keyboard traversal
  const navigableItems = useMemo(() => {
    if (!query.trim()) {
      return QUICK_NAV_ITEMS.map((item) => ({ id: item.url, url: item.url }));
    }
    const items: Array<{ id: string; url: string }> = [];
    (results.institutions || []).forEach((inst) => {
      items.push({ id: `inst-${inst.id}`, url: `/dashboard` });
    });
    results.students.forEach((st) => {
      items.push({ id: `st-${st.id}`, url: `/students?search=${encodeURIComponent(st.fullName)}` });
    });
    results.teachers.forEach((t) => {
      items.push({ id: `t-${t.id}`, url: `/teachers?search=${encodeURIComponent(t.fullName)}` });
    });
    results.classes.forEach((cls) => {
      items.push({ id: `cls-${cls.id}`, url: `/academics/classes` });
    });
    results.tasks.forEach((task) => {
      items.push({ id: `task-${task.id}`, url: `/tasks` });
    });
    return items;
  }, [query, results]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (navigableItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % navigableItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev <= 0 ? navigableItems.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < navigableItems.length) {
        handleSelect(navigableItems[selectedIndex].url);
      }
    }
  };

  const hasResults =
    (results.institutions?.length || 0) > 0 ||
    results.students.length > 0 ||
    results.teachers.length > 0 ||
    results.classes.length > 0 ||
    results.tasks.length > 0;

  let currentNavIndex = 0;

  return (
    <>
      {/* Trigger button for topbar */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between w-full h-9 sm:h-10 rounded-xl border border-border bg-card/90 hover:bg-card px-2.5 sm:px-3 text-xs text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all shadow-2xs group cursor-pointer min-w-0 overflow-hidden"
        aria-label="Search students, faculty, classes and tasks"
      >
        <span className="flex items-center gap-2 overflow-hidden mr-1 min-w-0">
          <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent shrink-0 transition-colors" />
          <span className="truncate whitespace-nowrap text-left text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            <span className="sm:hidden">Search...</span>
            <span className="hidden sm:inline">Search students, faculty, classes...</span>
          </span>
        </span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 rounded-md border border-border bg-muted/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground shrink-0">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="flex items-center px-4 border-b border-border bg-muted/40">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Type student name, admission #, teacher, subject, or task..."
                className="w-full py-4 px-3 text-xs text-foreground bg-transparent placeholder:text-muted-foreground focus:outline-none"
              />
              {loading && <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />}
              {query && !loading && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-3 bg-card text-card-foreground">
              {/* Quick Jump Navigation if no query */}
              {!query.trim() && (
                <div className="p-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 block mb-2">
                    Quick Jump Navigation
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_NAV_ITEMS.map((item, i) => {
                      const Icon = item.icon;
                      const isHighlighted = selectedIndex === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelect(item.url)}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-semibold transition-all border ${
                            isHighlighted
                              ? "bg-accent/10 border-accent/40 text-foreground"
                              : "text-foreground hover:bg-muted border-transparent hover:border-border"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-accent" />
                          <span className="truncate">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="py-8 px-4 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive mb-1">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-foreground">Search service temporarily unavailable</p>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const q = query;
                      clientCacheRef.current.delete(q.trim().toLowerCase());
                      setQuery("");
                      setTimeout(() => setQuery(q), 10);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Search
                  </button>
                </div>
              )}

              {/* Understandable Empty State */}
              {query.trim().length >= 2 && !loading && !error && !hasResults && (
                <div className="py-12 text-center text-muted-foreground text-xs space-y-1">
                  <p className="font-bold text-foreground">No records found</p>
                  <p className="text-[11px]">
                    No students, faculty, classes, or tasks matched &quot;{query}&quot;.
                  </p>
                </div>
              )}

              {/* Institutions Results (Super Admin) */}
              {results.institutions && results.institutions.length > 0 && (
                <div>
                  <span className="text-eyebrow px-2 block mb-1">
                    Institutions ({results.institutions.length})
                  </span>
                  <div className="space-y-1">
                    {results.institutions.map((inst) => {
                      const itemIndex = currentNavIndex++;
                      const isHighlighted = selectedIndex === itemIndex;
                      return (
                        <button
                          key={inst.id}
                          type="button"
                          onClick={() => handleSelect(`/dashboard`)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors group border ${
                            isHighlighted
                              ? "bg-accent/10 border-accent/40"
                              : "hover:bg-muted border-transparent hover:border-border"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-accent-subtle border border-accent/20 flex items-center justify-center text-accent font-bold text-[11px]">
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground group-hover:text-primary">
                                {inst.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {inst.type} • Code: <span className="font-mono">{inst.code}</span>
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Students Results */}
              {results.students.length > 0 && (
                <div>
                  <span className="text-eyebrow px-2 block mb-1">
                    Students ({results.students.length})
                  </span>
                  <div className="space-y-1">
                    {results.students.map((st) => {
                      const itemIndex = currentNavIndex++;
                      const isHighlighted = selectedIndex === itemIndex;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => handleSelect(`/students?search=${encodeURIComponent(st.fullName)}`)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors group border ${
                            isHighlighted
                              ? "bg-primary/10 border-primary/40"
                              : "hover:bg-muted border-transparent hover:border-border"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary font-bold text-[11px]">
                              {st.fullName[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-bold text-foreground group-hover:text-primary">
                                  {st.fullName}
                                </p>
                                {st.institution?.name && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50">
                                    {st.institution.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {st.currentClass?.name || "Class"} - {st.currentSection?.name || "A"} • Roll #{st.rollNumber || "—"} • <span className="font-mono">{st.admissionNumber}</span>
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Faculty & Staff Results */}
              {results.teachers.length > 0 && (
                <div>
                  <span className="text-eyebrow px-2 block mb-1">
                    Faculty &amp; Staff ({results.teachers.length})
                  </span>
                  <div className="space-y-1">
                    {results.teachers.map((t) => {
                      const itemIndex = currentNavIndex++;
                      const isHighlighted = selectedIndex === itemIndex;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelect(`/teachers?search=${encodeURIComponent(t.fullName)}`)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors group border ${
                            isHighlighted
                              ? "bg-accent/10 border-accent/40"
                              : "hover:bg-muted border-transparent hover:border-border"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-accent-subtle border border-accent/20 flex items-center justify-center text-accent font-bold text-[11px]">
                              {t.fullName[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-bold text-foreground group-hover:text-primary">
                                  {t.fullName}
                                </p>
                                {t.institution?.name && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50">
                                    {t.institution.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {t.designation} • <span className="font-mono">{t.employeeId}</span>
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Classes Results */}
              {results.classes.length > 0 && (
                <div>
                  <span className="text-eyebrow px-2 block mb-1">
                    Classes &amp; Cohorts ({results.classes.length})
                  </span>
                  <div className="space-y-1">
                    {results.classes.map((cls) => {
                      const itemIndex = currentNavIndex++;
                      const isHighlighted = selectedIndex === itemIndex;
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => handleSelect("/academics/classes")}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors group border ${
                            isHighlighted
                              ? "bg-muted border-border"
                              : "hover:bg-muted border-transparent hover:border-border"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground font-bold text-[11px]">
                              {cls.name[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-bold text-foreground">
                                  {cls.name}
                                </p>
                                {cls.institution?.name && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50">
                                    {cls.institution.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {cls.sections?.length || 0} Sections Active
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tasks Results */}
              {results.tasks.length > 0 && (
                <div>
                  <span className="text-eyebrow px-2 block mb-1">
                    Tasks ({results.tasks.length})
                  </span>
                  <div className="space-y-1">
                    {results.tasks.map((task) => {
                      const itemIndex = currentNavIndex++;
                      const isHighlighted = selectedIndex === itemIndex;
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => handleSelect("/tasks")}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors group border ${
                            isHighlighted
                              ? "bg-muted border-border"
                              : "hover:bg-muted border-transparent hover:border-border"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckSquare className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {task.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Priority: {task.priority} • Status: {task.status}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      );
                    })}
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
