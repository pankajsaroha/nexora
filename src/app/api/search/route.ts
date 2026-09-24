import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({
        students: [],
        teachers: [],
        classes: [],
        tasks: [],
      });
    }

    // Role-scoped student search
    let studentWhere: any = {
      institutionId: user.institutionId,
      OR: [
        { fullName: { contains: q } },
        { admissionNumber: { contains: q } },
        { rollNumber: { contains: q } },
      ],
    };

    if (user.roleCode === "PARENT" && user.guardianId) {
      studentWhere.guardians = { some: { guardianId: user.guardianId } };
    } else if (user.roleCode === "STUDENT" && user.studentId) {
      studentWhere.id = user.studentId;
    }

    const [students, teachers, classes, tasks] = await Promise.all([
      prisma.student.findMany({
        where: studentWhere,
        select: {
          id: true,
          fullName: true,
          admissionNumber: true,
          rollNumber: true,
          currentClass: { select: { name: true } },
          currentSection: { select: { name: true } },
        },
        take: 5,
      }),
      user.roleCode !== "STUDENT" && user.roleCode !== "PARENT"
        ? prisma.teacher.findMany({
            where: {
              institutionId: user.institutionId,
              OR: [
                { fullName: { contains: q } },
                { employeeId: { contains: q } },
                { designation: { contains: q } },
              ],
            },
            select: {
              id: true,
              fullName: true,
              employeeId: true,
              designation: true,
              email: true,
            },
            take: 5,
          })
        : Promise.resolve([]),
      prisma.class.findMany({
        where: {
          institutionId: user.institutionId,
          OR: [{ name: { contains: q } }, { code: { contains: q } }],
        },
        select: {
          id: true,
          name: true,
          code: true,
          sections: { select: { id: true, name: true } },
        },
        take: 4,
      }),
      user.roleCode === "PRINCIPAL" || user.roleCode === "ADMIN" || user.roleCode === "TEACHER"
        ? prisma.task.findMany({
            where: {
              institutionId: user.institutionId,
              title: { contains: q },
            },
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
            take: 4,
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      students,
      teachers,
      classes,
      tasks,
    });
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to query index." }, { status: 500 });
  }
}
