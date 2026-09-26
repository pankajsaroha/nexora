"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, Sparkles, Download, ArrowRight } from "lucide-react";
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
              leftIcon={<Download className="h-3.5 w-3.5 text-[#B89B62]" />}
            >
              Load Sample Template
            </Button>
          </div>
        }
      />

      {/* Metrics / Info Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Target Schema</div>
          <div className="mt-1 text-base font-bold text-[#171614] font-mono">
            {entityType === "STUDENTS" ? "Student Registry (v2)" : "Faculty & Staff (v1)"}
          </div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Auto-validates admission & roll #</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Duplicate Prevention</div>
          <div className="mt-1 text-base font-bold text-[#171614] font-mono">Unique Key Matching</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Prevents email & admission collisions</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Audit & Rollback</div>
          <div className="mt-1 text-base font-bold text-[#65705B] font-mono">Transaction Safe</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Rolls back batch on unhandled format</div>
        </div>
      </div>

      {/* Entity Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E0D5] pb-3">
        <button
          onClick={() => {
            setEntityType("STUDENTS");
            setResult(null);
          }}
          className={`px-4 py-2 text-xs font-mono uppercase font-bold rounded-lg transition-colors ${
            entityType === "STUDENTS"
              ? "bg-[#171614] text-white shadow-xs"
              : "bg-[#FAF8F3] border border-[#E5E0D5] text-[#171614] hover:bg-[#F3F0E8]"
          }`}
        >
          Import Students Roster
        </button>
        <button
          onClick={() => {
            setEntityType("TEACHERS");
            setResult(null);
          }}
          className={`px-4 py-2 text-xs font-mono uppercase font-bold rounded-lg transition-colors ${
            entityType === "TEACHERS"
              ? "bg-[#171614] text-white shadow-xs"
              : "bg-[#FAF8F3] border border-[#E5E0D5] text-[#171614] hover:bg-[#F3F0E8]"
          }`}
        >
          Import Faculty & Staff
        </button>
      </div>

      {/* Ingestion Console */}
      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#171614]">
              CSV Payload Input
            </h3>
            <p className="text-xs text-[#65705B]">
              Paste raw CSV rows with headers. You may click &quot;Load Sample Template&quot; to test.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleImport}
            isLoading={isProcessing}
            disabled={!rawText.trim()}
            leftIcon={<UploadCloud className="h-3.5 w-3.5" />}
          >
            Execute Ingestion Engine
          </Button>
        </div>

        <textarea
          rows={10}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="firstName,lastName,gender,dateOfBirth,class,section,parentName,parentPhone,email..."
          className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-4 text-xs font-mono text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614] leading-relaxed"
        />

        {/* Results Banner */}
        {result && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              result.error
                ? "bg-[#8B3A3A]/5 border-[#8B3A3A]/20 text-[#8B3A3A]"
                : "bg-[#65705B]/10 border-[#65705B]/20 text-[#525E4B]"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {result.error ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-[#65705B]" />
              )}
              <span>{result.error ? "Ingestion Failed" : "Batch Successfully Processed"}</span>
            </div>
            {result.error && <p>{result.error}</p>}
            {result.message && <p>{result.message}</p>}
            {result.importedCount !== undefined && (
              <p className="font-mono">
                Total records created: <span className="font-bold">{result.importedCount}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
