import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClassesClient } from "@/components/classes/classes-client";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const classes = await prisma.class.findMany({
    where: { institutionId: user.institutionId },
    include: {
      sections: {
        include: {
          classTeacher: true,
          students: true,
        },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  const formatted = classes.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    level: c.level,
    sections: c.sections.map((s) => ({
      id: s.id,
      name: s.name,
      roomNumber: s.roomNumber,
      capacity: s.capacity,
      classTeacherName: s.classTeacher?.fullName,
      studentsCount: s.students.length,
    })),
  }));

  return <ClassesClient classes={formatted} />;
}
