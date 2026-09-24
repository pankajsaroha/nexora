# NEXORA — Database Architecture & Schema Reference

NEXORA operates a multi-tenant relational schema optimized for educational institutions (K-12 schools, higher education colleges, and university campuses).

---

## 1. Domain Entity Breakdown

### A. Identity & Multi-Tenant Core
- **`institutions`**: Tenant root holding institutional metadata, affiliation code, currency (`INR`, `USD`), timezone, branding, and academic configuration.
- **`campuses`**: Multi-campus divisions under an institution parent.
- **`academic_years`**: Active and historical academic sessions (e.g. `2026-2027`).
- **`terms`**: Term divisions (`Term 1`, `Term 2` or `Semester 1`, `Semester 2`).
- **`departments`**: Academic wings (Science, Mathematics, Computer Applications).
- **`profiles` / `users`**: Authenticated identities linked with Supabase Auth (`auth.users`), holding avatar, contact info, and active role codes.
- **`roles` & `permissions`**: Granular role-based authorization matrix (`role_permissions`).

### B. People & Relationships
- **`students`**: Enrolled learners with admission numbers, roll numbers, class & section assignments, and medical contacts.
- **`guardians`**: Parents and authorized emergency guardians.
- **`student_guardians`**: Many-to-many relationship supporting multi-child parents (*Aarav in 8A* and *Meera in 5B*) and multiple guardians per student.
- **`teachers`**: Faculty records with employee IDs, designations, department links, basic pay, and statutory leave quotas (CL, SL, EL).

### C. Academics & Timetable
- **`classes` & `sections`**: Grade tiers and section cohorts with room capacities and assigned homeroom tutors.
- **`subjects`**: Theory, practical, and elective courses with credit assignments.
- **`teacher_assignments`**: Normalized mapping of Teacher → Subject → Section → Academic Year.
- **`timetable_slots`**: Period schedule matrix mapped by day of the week, period number, room, and faculty.

### D. Attendance & Academic Work
- **`student_attendance`**: Daily and period-level roll-call records (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
- **`staff_attendance`**: Faculty biometric punch-in and check-out logs.
- **`leave_requests`**: Staff time-off petitions with Principal approval workflows.
- **`assignments` & `assignment_submissions`**: Coursework deadlines, attachments, student submissions, and grading feedback.
- **`exams`, `exam_subjects`, `student_marks`**: Assessment timetables, blueprints, and CBSE-compliant grade sheets.

### E. Finance & Payroll
- **`fee_categories` & `fee_structures`**: Itemized tuition, transport, hostel, and activity fee structures.
- **`student_fees`**: Individual student fee ledgers with total, discount, paid, and outstanding balances.
- **`fee_payments`**: Audited payment receipts with unique receipt numbers (`REC-2026-XXXX`) and payment modes (`UPI`, `ONLINE`, `CASH`).
- **`payrolls`**: Monthly faculty compensation ledgers with basic salary, statutory deductions (PF, ESI), allowances, and printable payslips.

### F. Campus Operations & Facilities
- **`tasks` & `task_comments`**: Operational delegation boards with status transitions (`TODO`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`).
- **`announcements`**: Target-filtered broadcast circulars (Parents, Faculty, Scholars).
- **`notifications` & `whats_app_logs`**: Multi-channel delivery records.
- **`books` & `book_issues`**: Library catalog and lending circulation.
- **`vehicles`, `routes`, `route_stops`**: Transport fleet management.
- **`hostels` & `hostel_rooms`**: Dormitory bed occupancy and term boarding fees.
- **`audit_logs`**: Immutable security trails tracking all administrative mutations.

---

## 2. Foreign Key & Integrity Standards
- All foreign keys enforce referential integrity with appropriate cascading rules (`ON DELETE CASCADE` for child components, `ON DELETE SET NULL` for optional references).
- Financial records (`fee_payments`, `student_fees`) are immutable to prevent tampering with historical account balances.
- Unique constraints enforce operational correctness (e.g. unique admission numbers, unique roll-calls per student per date, unique timetable slots per section per period).
