import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Short-lived server-side TTL cache for search results
// Scoped by role, target institution scope, user ID, and normalized query
interface CacheEntry {
  data: any;
  expiresAt: number;
}

const SEARCH_CACHE_TTL_MS = 25_000; // 25 seconds
const MAX_CACHE_ENTRIES = 200;
const searchCache = new Map<string, CacheEntry>();

// In-flight request deduplication map to prevent parallel duplicate DB queries
const inFlightSearches = new Map<string, Promise<any>>();

function cleanExpiredCache() {
  const now = Date.now();
  if (searchCache.size > MAX_CACHE_ENTRIES) {
    searchCache.forEach((entry, key) => {
      if (entry.expiresAt <= now) {
        searchCache.delete(key);
      }
    });
    if (searchCache.size > MAX_CACHE_ENTRIES) {
      const keysToDelete = Array.from(searchCache.keys()).slice(0, 50);
      for (const k of keysToDelete) {
        searchCache.delete(k);
      }
    }
  }
}

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
        institutions: [],
      });
    }

    const isSuperAdmin = user.roleCode === "SUPER_ADMIN";
    const requestedInstitutionId = searchParams.get("institutionId");

    // Scope: Super Admin can search cross-institution or filter by specific institution;
    // All other roles are strictly bound to their assigned institution
    const targetInstitutionId = isSuperAdmin
      ? (requestedInstitutionId || undefined)
      : user.institutionId;

    const normalizedQuery = q.toLowerCase();
    const cacheKey = `${user.roleCode}:${targetInstitutionId || "CROSS"}:${user.id}:${normalizedQuery}`;

    // 1. Check server-side memory cache
    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data, {
        headers: { "X-Nexora-Search-Cache": "HIT" },
      });
    }

    // 2. In-flight request deduplication
    if (inFlightSearches.has(cacheKey)) {
      const data = await inFlightSearches.get(cacheKey)!;
      return NextResponse.json(data, {
        headers: { "X-Nexora-Search-Cache": "DEDUP" },
      });
    }

    // 3. Execute queries with bounded projections & insensitive matching
    const searchPromise = (async () => {
      // Role-scoped student query
      let studentWhere: any = {
        ...(targetInstitutionId ? { institutionId: targetInstitutionId } : {}),
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { admissionNumber: { contains: q, mode: "insensitive" } },
          { rollNumber: { contains: q, mode: "insensitive" } },
        ],
      };

      if (user.roleCode === "PARENT" && user.guardianId) {
        studentWhere.guardians = { some: { guardianId: user.guardianId } };
      } else if (user.roleCode === "STUDENT" && user.studentId) {
        studentWhere.id = user.studentId;
      }

      const canSearchTeachers = user.roleCode !== "STUDENT" && user.roleCode !== "PARENT";
      const canSearchTasks =
        user.roleCode === "SUPER_ADMIN" ||
        user.roleCode === "PRINCIPAL" ||
        user.roleCode === "ADMIN" ||
        user.roleCode === "TEACHER";

      const [students, teachers, classes, tasks, institutions] = await Promise.all([
        prisma.student.findMany({
          where: studentWhere,
          select: {
            id: true,
            fullName: true,
            admissionNumber: true,
            rollNumber: true,
            currentClass: { select: { name: true } },
            currentSection: { select: { name: true } },
            institution: { select: { id: true, name: true, code: true } },
          },
          take: 5,
        }),
        canSearchTeachers
          ? prisma.teacher.findMany({
              where: {
                ...(targetInstitutionId ? { institutionId: targetInstitutionId } : {}),
                OR: [
                  { fullName: { contains: q, mode: "insensitive" } },
                  { employeeId: { contains: q, mode: "insensitive" } },
                  { designation: { contains: q, mode: "insensitive" } },
                ],
              },
              select: {
                id: true,
                fullName: true,
                employeeId: true,
                designation: true,
                email: true,
                institution: { select: { id: true, name: true, code: true } },
              },
              take: 5,
            })
          : Promise.resolve([]),
        prisma.class.findMany({
          where: {
            ...(targetInstitutionId ? { institutionId: targetInstitutionId } : {}),
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            code: true,
            sections: { select: { id: true, name: true } },
            institution: { select: { id: true, name: true, code: true } },
          },
          take: 4,
        }),
        canSearchTasks
          ? prisma.task.findMany({
              where: {
                ...(targetInstitutionId ? { institutionId: targetInstitutionId } : {}),
                title: { contains: q, mode: "insensitive" },
              },
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                institution: { select: { id: true, name: true, code: true } },
              },
              take: 4,
            })
          : Promise.resolve([]),
        isSuperAdmin
          ? prisma.institution.findMany({
              where: {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { code: { contains: q, mode: "insensitive" } },
                ],
              },
              select: {
                id: true,
                name: true,
                code: true,
                type: true,
                status: true,
              },
              take: 4,
            })
          : Promise.resolve([]),
      ]);

      return {
        students,
        teachers,
        classes,
        tasks,
        institutions,
      };
    })();

    inFlightSearches.set(cacheKey, searchPromise);

    try {
      const data = await searchPromise;
      cleanExpiredCache();
      searchCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
      });
      return NextResponse.json(data, {
        headers: { "X-Nexora-Search-Cache": "MISS" },
      });
    } finally {
      inFlightSearches.delete(cacheKey);
    }
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to query search index." }, { status: 500 });
  }
}
