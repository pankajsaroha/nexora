import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Users, GraduationCap, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary mb-1">
        404 • Resource Not Available
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight max-w-md">
        Record Not Found or Scope Restricted
      </h1>

      <p className="text-xs text-muted-foreground max-w-md mt-2 leading-relaxed">
        The requested student profile, staff record, or operational view does not exist within your current institution scope, or has been archived.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <Link href="/students">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>Students Directory</span>
          </Button>
        </Link>

        <Link href="/teachers">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-primary" />
            <span>Teachers & Staff</span>
          </Button>
        </Link>

        <Link href="/dashboard">
          <Button size="sm" className="gap-2 text-xs">
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
