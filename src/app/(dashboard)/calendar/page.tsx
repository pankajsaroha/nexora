import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarClient } from "@/components/calendar/calendar-client";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const events = await prisma.calendarEvent.findMany({
    where: { institutionId: user.institutionId },
    orderBy: { startDate: "asc" },
  });

  const formatted =
    events.length > 0
      ? events.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          eventType: e.eventType as any,
          startDate: e.startDate,
          endDate: e.endDate,
          targetAudience: e.targetAudience,
          location: e.location,
        }))
      : [
          {
            id: "cal-1",
            title: "Annual Parent-Teacher Conference (Term 1 Review)",
            description: "Detailed 1-on-1 consultations for Grades 6 through 12 regarding midterm progress.",
            eventType: "PARENT_MEETING" as const,
            startDate: new Date("2026-09-26"),
            endDate: new Date("2026-09-26"),
            targetAudience: "PARENTS",
            location: "Academic Auditorium & Classrooms",
          },
          {
            id: "cal-2",
            title: "Term 1 Pre-Board Final Assessments",
            description: "CBSE curriculum written exams and practical evaluations.",
            eventType: "EXAM" as const,
            startDate: new Date("2026-10-12"),
            endDate: new Date("2026-10-22"),
            targetAudience: "STUDENTS",
            location: "Examination Halls",
          },
          {
            id: "cal-3",
            title: "Gandhi Jayanti & National Holiday",
            description: "Institutional holiday in observance of Mahatma Gandhi birth anniversary.",
            eventType: "HOLIDAY" as const,
            startDate: new Date("2026-10-02"),
            endDate: new Date("2026-10-02"),
            targetAudience: "EVERYONE",
            location: "Campus Closed",
          },
        ];

  return <CalendarClient events={formatted} />;
}
