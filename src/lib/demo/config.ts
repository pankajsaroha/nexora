/**
 * NEXORA Isolated Demo Architecture
 * This file centralizes all temporary demo persona configuration and feature flags.
 * When DEMO_MODE is disabled, all demo switchers and helper panels cleanly disappear.
 */

export const IS_DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  process.env.DEMO_MODE === "true" ||
  process.env.NODE_ENV !== "production";

export interface DemoPersona {
  roleCode: string;
  name: string;
  designation: string;
  email: string;
  avatarInitials: string;
  avatarBg: string;
  contextNote: string;
  relationships: {
    institution: string;
    classContext?: string;
    children?: string[];
    teaches?: string;
  };
}

export const DEMO_INSTITUTION = {
  name: "Northstar International Academy",
  code: "NORTHSTAR",
  city: "Greater Noida",
  state: "Uttar Pradesh",
  affiliation: "CBSE Curriculum & Cambridge International",
  academicYear: "AY 2026-2027 (Term 1)",
};

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    roleCode: "PRINCIPAL",
    name: "Dr. Arvind Menon",
    designation: "Principal & Head of Institution",
    email: "principal@nexora.demo",
    avatarInitials: "AM",
    avatarBg: "from-amber-600 to-amber-800",
    contextNote: "Complete institution visibility, executive KPIs, staff leave approvals, security audits",
    relationships: {
      institution: "Northstar International Academy",
    },
  },
  {
    roleCode: "TEACHER",
    name: "Mrs. Ananya Sharma",
    designation: "Senior Mathematics Teacher & Class Incharge",
    email: "teacher@nexora.demo",
    avatarInitials: "AS",
    avatarBg: "from-indigo-600 to-indigo-800",
    contextNote: "Class teacher for Grade 8A. Taught student: Aarav Sharma. Manages roll-call and homework.",
    relationships: {
      institution: "Northstar International Academy",
      classContext: "Grade 8A",
      teaches: "Mathematics (Grades 8A, 9B, 10A)",
    },
  },
  {
    roleCode: "STUDENT",
    name: "Aarav Sharma",
    designation: "Student (Grade 8A • Roll #12)",
    email: "student@nexora.demo",
    avatarInitials: "AR",
    avatarBg: "from-sky-600 to-sky-800",
    contextNote: "Enrolled in Grade 8A under Mrs. Ananya Sharma. Sibling of Meera Sharma. Parent: Rahul Sharma.",
    relationships: {
      institution: "Northstar International Academy",
      classContext: "Grade 8A (Roll #12)",
    },
  },
  {
    roleCode: "PARENT",
    name: "Mr. Rahul Sharma",
    designation: "Parent / Guardian",
    email: "parent@nexora.demo",
    avatarInitials: "RS",
    avatarBg: "from-stone-700 to-stone-900",
    contextNote: "Authorized guardian to 2 children: Aarav Sharma (Grade 8A) and Meera Sharma (Grade 5B).",
    relationships: {
      institution: "Northstar International Academy",
      children: ["Aarav Sharma (Grade 8A)", "Meera Sharma (Grade 5B)"],
    },
  },
  {
    roleCode: "ACCOUNTANT",
    name: "Mrs. Neha Kapoor",
    designation: "Chief Accountant & Bursar",
    email: "accountant@nexora.demo",
    avatarInitials: "NK",
    avatarBg: "from-emerald-600 to-emerald-800",
    contextNote: "Manages fee collections, overdue invoices, official receipts, and monthly faculty payroll.",
    relationships: {
      institution: "Northstar International Academy",
    },
  },
  {
    roleCode: "SUPER_ADMIN",
    name: "System Super Admin",
    designation: "Platform Administrator",
    email: "admin@nexora.demo",
    avatarInitials: "SA",
    avatarBg: "from-slate-700 to-slate-900",
    contextNote: "Full system control, institutional onboarding wizard, CSV data migration, RBAC permissions.",
    relationships: {
      institution: "Northstar International Academy",
    },
  },
];
