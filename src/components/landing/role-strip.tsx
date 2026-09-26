"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  BookOpen,
  Award,
} from "lucide-react";

export function RoleStrip() {
  const router = useRouter();
  const [navigatingRole, setNavigatingRole] = useState<string | null>(null);

  const handleLaunchRole = async (email: string, roleCode: string) => {
    setNavigatingRole(roleCode);
    try {
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: roleCode }),
      });

      if (res.ok) {
        router.refresh();
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      router.push("/dashboard");
    }
  };

  const roles = [
    {
      roleCode: "PRINCIPAL",
      title: "Principal & Leadership",
      persona: "Dr. Arvind Menon",
      tagline: "See the entire institution at a glance",
      email: "principal@nexora.demo",
      capabilities: ["Campus Roll-Call (94.2%)", "Revenue & Fee Ledgers", "Staff Absence & Leave Approvals"],
      metrics: "350 Students • 35 Faculty • 19 Cohorts",
      badgeColor: "bg-[#2E281F] text-[#D4B87C] border-[#B89B62]/40",
      accentBorder: "hover:border-[#B89B62]",
      cardTint: "bg-[#201E1A]",
      accentGlow: "group-hover:border-[#B89B62]/70",
      iconColor: "text-[#D4B87C]",
      icon: Award,
      preview: {
        type: "stat",
        kpis: [
          { label: "Today Attendance", val: "94.2%", color: "text-[#7A8068]" },
          { label: "Term 1 Realized", val: "₹18.4L", color: "text-[#D4B87C]" },
          { label: "Pending Tasks", val: "3 Active", color: "text-[#C4AA76]" },
        ],
      },
    },
    {
      roleCode: "TEACHER",
      title: "Faculty & Tutors",
      persona: "Mrs. Ananya Sharma",
      tagline: "Manage your classroom effortlessly",
      email: "teacher@nexora.demo",
      capabilities: ["Grade 8A Roll-Call (45s)", "7-Period Timetable", "Assignment Dispatch & Marks"],
      metrics: "Maths Lead • Grade 8A Incharge • 32 Scholars",
      badgeColor: "bg-[#232B22] text-[#A3B19B] border-[#65705B]/40",
      accentBorder: "hover:border-[#7A8068]",
      cardTint: "bg-[#201E1A]",
      accentGlow: "group-hover:border-[#65705B]/70",
      iconColor: "text-[#A3B19B]",
      icon: GraduationCap,
      preview: {
        type: "timetable",
        slots: [
          { period: "P1 (08:30)", sub: "Grade 8A Maths", room: "Room 104" },
          { period: "P2 (09:15)", sub: "Grade 10 Science", room: "Physics Lab" },
        ],
      },
    },
    {
      roleCode: "STUDENT",
      title: "Enrolled Scholars",
      persona: "Aarav Sharma",
      tagline: "Everything you need in one place",
      email: "student@nexora.demo",
      capabilities: ["Today's Class Schedule", "Homework Submission Queue", "CBSE Term Progress (86.4%)"],
      metrics: "Grade 8A • Roll #12 • 92.4% Attendance",
      badgeColor: "bg-[#2B2925] text-[#DCD7CB] border-[#7A756B]/40",
      accentBorder: "hover:border-[#9A958A]",
      cardTint: "bg-[#201E1A]",
      accentGlow: "group-hover:border-[#7A756B]/70",
      iconColor: "text-[#DCD7CB]",
      icon: BookOpen,
      preview: {
        type: "student",
        items: [
          { label: "Academic Standing", val: "Grade 8A (Roll #12)" },
          { label: "Upcoming Homework", val: "Polynomials (Due 30 Sep)" },
        ],
      },
    },
    {
      roleCode: "PARENT",
      title: "Families & Guardians",
      persona: "Mr. Rahul Sharma",
      tagline: "Stay connected with your child's progress",
      email: "parent@nexora.demo",
      capabilities: ["Multi-Child Sibling Switcher", "Instant WhatsApp Alerts", "Digital Fee Receipts & UPI"],
      metrics: "Aarav (Grade 8A) & Meera (Grade 5B)",
      badgeColor: "bg-[#2C1F1F] text-[#E0A8A5] border-[#8C4A47]/40",
      accentBorder: "hover:border-[#8C4A47]",
      cardTint: "bg-[#201E1A]",
      accentGlow: "group-hover:border-[#8C4A47]/70",
      iconColor: "text-[#E0A8A5]",
      icon: HeartHandshake,
      preview: {
        type: "parent",
        children: [
          { name: "Aarav Sharma", grade: "Grade 8A", att: "94%", fee: "PAID" },
          { name: "Meera Sharma", grade: "Grade 5B", att: "92%", fee: "PAID" },
        ],
      },
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#171614] text-[#F7F4ED] border-b border-[#2A2722]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B89B62]/30 bg-[#201E1A] text-[11px] font-mono uppercase tracking-widest text-[#C4AA76]">
              <Sparkles className="w-3.5 h-3.5 text-[#B89B62]" />
              <span>One Platform. Every Role.</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tailored workspaces for everyone in your institution.
            </h2>

            <p className="text-sm text-[#C5C0B6]">
              Click any persona card below to instantly launch their dedicated live portal with pre-loaded demo records.
            </p>
          </div>

          <span className="text-xs font-mono text-[#D4B87C] font-semibold bg-[#201E1A] px-3.5 py-2 rounded-xl border border-[#35322C] shadow-2xs">
            1-Click Instant Demo Access • No Password Required
          </span>
        </div>

        {/* 4 Role Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((r) => {
            const isNavigating = navigatingRole === r.roleCode;
            const Icon = r.icon;

            return (
              <div
                key={r.roleCode}
                role="button"
                tabIndex={0}
                onClick={() => handleLaunchRole(r.email, r.roleCode)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLaunchRole(r.email, r.roleCode);
                  }
                }}
                className={`group relative rounded-3xl border border-[#35322C] ${r.cardTint} p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-2xl hover:translate-y-[-3px] ${r.accentBorder} focus:outline-none focus:ring-2 focus:ring-[#B89B62]`}
              >
                <div className="space-y-5">
                  {/* Top Badge & Role Name */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${r.badgeColor}`}
                    >
                      {r.title}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#2B2925] border border-[#3A3730] flex items-center justify-center text-[#FAF8F3] shadow-2xs">
                      <Icon className={`w-3.5 h-3.5 ${r.iconColor}`} />
                    </div>
                  </div>

                  {/* Headline & Persona */}
                  <div>
                    <h3 className="font-extrabold text-base text-[#FAF8F3] group-hover:text-white transition-colors">
                      {r.persona}
                    </h3>
                    <p className="text-xs font-medium text-[#A6A095] mt-1 leading-snug">
                      {r.tagline}
                    </p>
                  </div>

                  {/* Visual UI Preview Snippet */}
                  <div className="p-3.5 rounded-2xl bg-[#171614] border border-[#2F2C26] space-y-2 text-xs shadow-inner">
                    {r.preview.type === "stat" && (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {r.preview.kpis?.map((k, i) => (
                          <div key={i} className="space-y-0.5">
                            <div className={`text-xs font-extrabold ${k.color}`}>{k.val}</div>
                            <div className="text-[9px] text-[#8C877D] font-medium truncate">{k.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {r.preview.type === "timetable" && (
                      <div className="space-y-1.5 font-mono text-[10px]">
                        {r.preview.slots?.map((s, i) => (
                          <div key={i} className="flex justify-between items-center bg-[#201E1A] p-1.5 rounded-lg border border-[#2F2C26]">
                            <span className="font-bold text-[#FAF8F3]">{s.period}</span>
                            <span className="text-[#A6A095] truncate">{s.sub}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {r.preview.type === "student" && (
                      <div className="space-y-1 font-mono text-[10px]">
                        {r.preview.items?.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-[#C5C0B6]">
                            <span className="text-[#8C877D]">{item.label}:</span>
                            <span className="font-bold text-[#FAF8F3]">{item.val}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {r.preview.type === "parent" && (
                      <div className="space-y-1.5">
                        {r.preview.children?.map((c, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px] font-mono bg-[#201E1A] p-1.5 rounded-lg border border-[#2F2C26]">
                            <span className="font-bold text-[#FAF8F3]">{c.name}</span>
                            <span className="text-[#7A8068] font-bold">{c.att}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3 Capabilities */}
                  <div className="space-y-1.5 pt-1">
                    {r.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#C5C0B6] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#7A8068] shrink-0" />
                        <span className="truncate">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1-Click Action Footer */}
                <div className="mt-6 pt-4 border-t border-[#2A2722] flex items-center justify-between text-xs font-bold text-[#FAF8F3]">
                  <span>
                    {isNavigating ? "Opening Portal..." : "Enter Portal"}
                  </span>
                  {isNavigating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4B87C]" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-[#2E2B25] border border-[#3A3730] flex items-center justify-center text-[#FAF8F3] group-hover:bg-[#B89B62] group-hover:text-[#171614] group-hover:border-[#B89B62] transition-all shadow-2xs">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
