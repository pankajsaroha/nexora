# NEXORA Database Schema Reference

NEXORA uses a normalized relational schema defined in `prisma/schema.prisma`.

## Core Entities Summary

| Model | Description | Key Relationships |
| :--- | :--- | :--- |
| `Institution` | Multi-tenant root organization entity | 1:N with Campuses, Users, Classes, Departments, Fees |
| `User` | Authentication identity & system credentials | 1:1 with Teacher / Student / Guardian |
| `Student` | Learner profile, enrollment, roll number | N:1 with Class, Section; M:N with Guardians |
| `Guardian` | Parent or authorized guardian record | Linked to Student via `StudentGuardian` junction |
| `Teacher` | Faculty and operational staff profile | 1:N with Assignments, TimetableSlots, ClassTeacher |
| `Class` & `Section` | Academic grade & division structures | Contains students, periods, class teacher |
| `TimetableSlot` | Weekly scheduled lecture periods | Unique on `[sectionId, dayOfWeek, periodNumber]` |
| `StudentAttendance` | Daily roll-call ledger | Unique on `[studentId, date]` |
| `StudentFee` & `FeePayment` | Invoices, collections, and receipts | Tracks total, paid, and pending balances |
| `Payroll` | Monthly employee salary ledger | Basic, HRA, DA, PF, TDS, and Net salary |
| `Task` & `TaskComment` | Administrative and academic tasks | TODO, IN_PROGRESS, BLOCKED, COMPLETED |
| `WhatsAppMessageLog` | Notification dispatch audit records | Logs queued, sent, and delivered states |
| `AuditLog` | Immutable security audit log | Tracks user actions, entities, and IP addresses |
