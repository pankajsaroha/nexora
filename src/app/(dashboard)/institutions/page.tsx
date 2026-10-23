import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InstitutionLifecycleClient } from "@/components/institutions/institution-lifecycle-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Institution Lifecycle Management | Nexora Super Admin",
  description: "Enterprise multi-tenant institution lifecycle, suspension, archival, and protected deletion workflows.",
};

export default async function InstitutionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.roleCode !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return <InstitutionLifecycleClient user={user} />;
}
