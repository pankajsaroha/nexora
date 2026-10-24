import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StudentCustomFieldsClient } from "@/components/settings/student-custom-fields-client";

export const dynamic = "force-dynamic";

export default async function StudentCustomFieldsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Non-administrative roles must not configure student schema extensions
  const allowedRoles = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL"];
  if (!allowedRoles.includes(user.roleCode || "")) {
    redirect("/profile");
  }

  const fields = await prisma.studentCustomField.findMany({
    where: { institutionId: user.institutionId },
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
  });

  const parsedFields = fields.map((f) => {
    let options: string[] = [];
    if (f.options) {
      try {
        const parsed = JSON.parse(f.options);
        if (Array.isArray(parsed)) options = parsed;
      } catch {
        options = [];
      }
    }
    return {
      id: f.id,
      name: f.name,
      key: f.key,
      fieldType: f.fieldType,
      options,
      placeholder: f.placeholder,
      helpText: f.helpText,
      isRequired: f.isRequired,
      isVisibleToAdmin: f.isVisibleToAdmin,
      isVisibleToTeacher: f.isVisibleToTeacher,
      isVisibleToParent: f.isVisibleToParent,
      isVisibleToStudent: f.isVisibleToStudent,
      orderIndex: f.orderIndex,
      isActive: f.isActive,
    };
  });

  return <StudentCustomFieldsClient fields={parsedFields} />;
}
