import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImportClient } from "@/components/import/import-client";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <ImportClient />;
}
