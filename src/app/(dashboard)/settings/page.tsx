import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Building2, Save, Sparkles, Shield, Palette, Globe, Phone, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const institution = await prisma.institution.findUnique({
    where: { id: user.institutionId },
  });

  if (!institution) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        category="System Administration & Configuration"
        title="Institution Profile & Global Settings"
        description="Core institutional identity, academic governance rules, messaging relays, and security credentials."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/settings/student-fields">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Sparkles className="h-3.5 w-3.5 text-[#856D3B]" />}
              >
                Configure Student Fields
              </Button>
            </Link>
            <Button
              size="sm"
              leftIcon={<Save className="h-3.5 w-3.5" />}
            >
              Save Configuration
            </Button>
          </div>
        }
      />

      {/* Schema Extensions Quick Link Banner */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-[#FAF8F3] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#171614] text-[#FAF8F3] flex items-center justify-center font-bold">
            <Sparkles className="h-4 w-4 text-[#D4B87C]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#171614]">Institutional Student Schema & Custom Attributes</h3>
            <p className="text-[11px] text-[#7A756B]">Define custom fields (APAAR ID, Hostel, Transport, Category) that automatically appear in Student Admission.</p>
          </div>
        </div>
        <Link href="/settings/student-fields">
          <Button size="sm" variant="outline">
            Manage Custom Fields →
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-[#E8E7DF] bg-white p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-mono font-bold text-sm">
              NX
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {institution.name}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Affiliation Code: {institution.code} • {institution.type} Tier
              </span>
            </div>
          </div>
          <Badge variant="success" size="sm">
            Operational Tenant
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Institution Name
            </label>
            <input
              type="text"
              readOnly
              value={institution.name}
              className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Affiliation Code / ID
            </label>
            <input
              type="text"
              readOnly
              value={institution.code}
              className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] p-2.5 text-xs font-mono text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Official Email
            </label>
            <input
              type="text"
              readOnly
              value={institution.email}
              className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] p-2.5 text-xs font-mono text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Contact Phone
            </label>
            <input
              type="text"
              readOnly
              value={institution.phone}
              className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] p-2.5 text-xs font-mono text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Campus Address
            </label>
            <input
              type="text"
              readOnly
              value={`${institution.address}, ${institution.city}, ${institution.state} - ${institution.pincode}`}
              className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] p-2.5 text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Instructional Operating Hours
            </label>
            <input
              type="text"
              readOnly
              value={institution.workingHours}
              className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] p-2.5 text-xs font-medium text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {/* WhatsApp Notification Provider Configuration */}
        <div className="pt-4 border-t border-[#E8E7DF] space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">
              WhatsApp Integration (PingStack Gateway)
            </h3>
            <Badge variant="success" size="sm">
              PingStack Drop-In Ready
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Currently executing in simulated mock dispatch mode with delivery status state-machines and message audit logs. Supplying <code className="font-mono text-slate-800 bg-[#FAF9F5] px-1 py-0.5 rounded border border-[#E8E7DF]">PINGSTACK_API_KEY</code> in production environment variables activates instant live SMS/WhatsApp dispatches to parent phone numbers.
          </p>
        </div>
      </div>
    </div>
  );
}
