import { Metadata } from "next";
import { HomepageClient } from "@/components/landing/homepage-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NEXORA — The Operating System for Modern Education",
  description:
    "Unified cloud operating system for schools and colleges managing students, academics, attendance, fees, payroll, timetable, assignments, exams, and operations.",
  openGraph: {
    title: "NEXORA — The Operating System for Modern Education",
    description:
      "Run your school or college from one connected workspace — from attendance and academics to fees, payroll, communication, and daily operations.",
    type: "website",
  },
};

export default function RootPage() {
  return <HomepageClient />;
}
