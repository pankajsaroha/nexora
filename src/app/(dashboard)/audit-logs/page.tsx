import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ShieldAlert, Clock, User, CheckCircle2, Shield, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const logs = await prisma.auditLog.findMany({
    where: { institutionId: user.institutionId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        category="Security & Access Control"
        title="Audit Logs & Activity Trail"
        description="Tamper-evident logs of administrative operations, admissions, financial receipts, and credentials changes."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export Audit Trail
            </Button>
            <Badge variant="success" size="sm">
              Tenant Scoped
            </Badge>
          </div>
        }
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action Event</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Initiated By</th>
              <th className="py-3 px-4">Operational Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                  {formatDate(l.createdAt, "dd MMM yyyy, HH:mm:ss")}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline" size="sm">
                    {l.action}
                  </Badge>
                </td>
                <td className="py-3 px-4 font-mono font-medium text-foreground">
                  {l.entity}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-foreground">
                    {l.userName || "System Administrator"}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">{l.userEmail || "system@nexora.internal"}</div>
                </td>
                <td className="py-3 px-4 text-muted-foreground max-w-sm truncate text-[11px] font-mono">
                  {l.details || `Operation executed on ${l.entity} (ID: ${l.entityId || "-"})`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
