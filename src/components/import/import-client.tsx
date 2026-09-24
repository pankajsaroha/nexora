"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

export function ImportClient() {
  const [entityType, setEntityType] = useState<"STUDENTS" | "TEACHERS">("STUDENTS");
  const [rawText, setRawText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sampleStudentData = `firstName,lastName,gender,dateOfBirth,class,section,parentName,parentPhone,email
Aarav,Kapoor,MALE,2012-04-12,Grade 8,A,Mr. Vikram Kapoor,+91 98110 00111,aarav.k@northstar.edu.in
Isha,Bansal,FEMALE,2012-07-21,Grade 8,A,Mrs. Ritu Bansal,+91 98110 00222,isha.b@northstar.edu.in
Rohan,Verma,MALE,2012-09-05,Grade 8,B,Mr. Deepak Verma,+91 98110 00333,rohan.v@northstar.edu.in`;

  const sampleTeacherData = `firstName,lastName,email,phone,designation,department,salary
Ananya,Mukherjee,ananya.m@northstar.edu.in,+91 98100 22001,Physics Faculty,Science & Technology,62000
Karthik,Subramanian,karthik.s@northstar.edu.in,+91 98100 22002,Mathematics Faculty,Mathematics,60000`;

  const handleLoadSample = () => {
    setRawText(entityType === "STUDENTS" ? sampleStudentData : sampleTeacherData);
    setResult(null);
  };

  const handleImport = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    setResult(null);

    try {
      // Parse CSV
      const lines = rawText.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",").map((v) => v.trim());
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || "";
        });
        rows.push(rowObj);
      }

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, rows }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Data Migration & Bulk Onboarding"
        title="Universal CSV & Data Importer"
        description="Bulk onboard institutional registries, students, and faculty with automated schema validation and integrity checks."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Load Sample Template
            </Button>
          </div>
        }
      />

      {/* Metrics / Info Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Target Schema</div>
          <div className="mt-1 text-base font-bold text-slate-900 font-mono">
            {entityType === "STUDENTS" ? "Student Registry (v2)" : "Faculty & Staff (v1)"}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">Auto-validates admission & roll #</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Duplicate Prevention</div>
          <div className="mt-1 text-base font-bold text-slate-900 font-mono">Unique Key Matching</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Prevents email & admission collisions</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Audit & Rollback</div>
          <div className="mt-1 text-base font-bold text-emerald-700 font-mono">Atomic Transaction</div>
          <div className="mt-0.5 text-[11px] text-slate-500">All-or-nothing database commitment</div>
        </div>
      </div>

      {/* Main Import Panel */}
      <div className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E7DF] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Import Registry:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setEntityType("STUDENTS");
                  setRawText("");
                  setResult(null);
                }}
                className={`px-2.5 py-1 text-xs font-mono uppercase rounded-md transition-colors ${
                  entityType === "STUDENTS"
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Students Registry
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntityType("TEACHERS");
                  setRawText("");
                  setResult(null);
                }}
                className={`px-2.5 py-1 text-xs font-mono uppercase rounded-md transition-colors ${
                  entityType === "TEACHERS"
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Faculty & Staff
              </button>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLoadSample}>
            Fill Example Records →
          </Button>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
            Raw CSV Payload (including header row):
          </label>
          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your CSV content here (e.g. firstName,lastName,gender,dateOfBirth,class,section...)"
            className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] p-3 font-mono text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#E8E7DF]">
          <span className="text-[11px] font-mono text-slate-400">
            {rawText.trim() ? `${rawText.trim().split("\n").length - 1} data records detected` : "No records loaded"}
          </span>
          <Button
            size="sm"
            onClick={handleImport}
            disabled={!rawText.trim()}
            isLoading={isProcessing}
            leftIcon={<UploadCloud className="h-3.5 w-3.5" />}
          >
            Validate & Execute Ingestion
          </Button>
        </div>

        {result && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              result.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="font-mono font-bold">{result.message || result.error}</div>
            {result.errors && result.errors.length > 0 && (
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px] opacity-90">
                {result.errors.map((err: string, idx: number) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
