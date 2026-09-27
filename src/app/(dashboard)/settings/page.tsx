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
                leftIcon={<Sparkles className="h-3.5 w-3.5 text-primary" />}
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
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-2xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Institutional Student Schema & Custom Attributes</h3>
            <p className="text-[11px] text-muted-foreground">Define custom fields (APAAR ID, Hostel, Transport, Category) that automatically appear in Student Admission.</p>
          </div>
        </div>
        <Link href="/settings/student-fields">
          <Button size="sm" variant="outline">
            Manage Custom Fields →
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono font-bold text-sm shadow-2xs">
              NX
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {institution.name}
              </h2>
              <span className="text-xs text-muted-foreground font-mono">
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
            <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Institution Name
            </label>
            <input
              type="text"
              readOnly
              value={institution.name}
              className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-semibold text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Affiliation Code / ID
            </label>
            <input
              type="text"
              readOnly
              value={institution.code}
              className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-mono text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Official Email
            </label>
            <input
              type="text"
              readOnly
              value={institution.email}
              className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-mono text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Contact Phone
            </label>
            <input
              type="text"
              readOnly
              value={institution.phone}
              className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-mono text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Campus Address
            </label>
            <input
              type="text"
              readOnly
              value={`${institution.address}, ${institution.city}, ${institution.state} - ${institution.pincode}`}
              className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Instructional Operating Hours
            </label>
            <input
              type="text"
              readOnly
              value={institution.workingHours}
              className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-medium text-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* WhatsApp Notification Provider Configuration */}
        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground">
              WhatsApp Integration (PingStack Gateway)
            </h3>
            <Badge variant="success" size="sm">
              PingStack Drop-In Ready
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Currently executing in simulated mock dispatch mode with delivery status state-machines and message audit logs. Supplying <code className="font-mono text-foreground bg-muted px-1 py-0.5 rounded border border-border">PINGSTACK_API_KEY</code> in production environment variables activates instant live SMS/WhatsApp dispatches to parent phone numbers.
          </p>
        </div>
      </div>
    </div>
  );
}
