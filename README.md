# NEXORA
### The Operating System for Educational Institutions

**NEXORA** is a multi-tenant, cloud-native educational institution operating system built to unify student demographics, faculty operations, visual timetable scheduling, daily attendance, assignments & homework, exams & report cards, fee billing & receipts, staff payroll & payslips, task management, broadcasts, and campus logistics into one cohesive platform.

---

## Key Highlights

- **Real Database Persistence**: Powered by SQLite & Prisma ORM with full foreign key constraints, cascade rules, and seamless PostgreSQL compatibility.
- **True Role-Based Access Control**: Server-side capability checking for 6 distinct roles:
  1. **Platform Super Admin** (`admin@nexora.demo`)
  2. **Principal / Head of Institution** (`principal@nexora.demo`)
  3. **Senior Faculty & Class Incharge** (`teacher@nexora.demo`)
  4. **Student** (`student@nexora.demo`)
  5. **Parent / Guardian** (`parent@nexora.demo`)
  6. **Chief Accountant & Bursar** (`accountant@nexora.demo`)
- **Interactive Multi-Child Parent Portal**: Automatically isolates and switches context between siblings (e.g. Aarav Sharma & Meera Sharma).
- **PingStack-Ready Notification Engine**: Decoupled `NotificationService` with mock WhatsApp dispatcher (`MockWhatsAppProvider`), delivery state transitions, and audit logs.
- **Universal Data Importer**: Ingests CSV & JSON records for Students and Teachers with granular validation.
- **Printable Official Documents**: One-click printable formats for CBSE Student Report Cards and Employee Monthly Payslips.
- **Believable Seed Dataset**: Pre-populated with **Northstar International Academy** (~350 students, 35 teachers, 19 class sections, timetables, attendance history, fees, payroll, assignments, and tasks).

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (Strict Mode)
- **Database & ORM**: SQLite / Prisma ORM
- **UI & Styling**: Tailwind CSS, Lucide Icons, Custom Design System
- **Security**: Server-Side RBAC, Bcrypt Password Hashing, HTTP-Only Session Cookies

---

## Quickstart & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Run Seed
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Accounts (Password: `demo123`)

| Role | Email | Password | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Principal** | `principal@nexora.demo` | `demo123` | Executive KPI Command Center, Staff Approvals, Audit Logs |
| **Teacher** | `teacher@nexora.demo` | `demo123` | Class 8A Incharge, Roll-call, Assignments, Task Board |
| **Student** | `student@nexora.demo` | `demo123` | Aarav Sharma: Timetable, Attendance, Homework, Results |
| **Parent** | `parent@nexora.demo` | `demo123` | Rajesh Sharma: Sibling Switcher (Aarav & Meera), Fees |
| **Accountant** | `accountant@nexora.demo` | `demo123` | Fee collections, Receipt generator, Staff payroll |
| **Super Admin** | `admin@nexora.demo` | `demo123` | System configuration, Full RBAC matrix, CSV Importer |

> [!TIP]
> A floating **Demo Persona Switcher** is embedded in the top bar of the application, allowing instant identity switching without re-entering credentials during demonstration.

---

## PingStack WhatsApp Integration Architecture

The platform uses `src/lib/notifications/whatsapp.ts`. In development and demo mode, `MockWhatsAppProvider` simulates message queues and logs deliveries to the database.

To connect live WhatsApp messaging via PingStack:
1. Obtain API credentials from [PingStack.io](https://pingstack.io).
2. Set the following in `.env`:
   ```env
   WHATSAPP_PROVIDER="pingstack"
   PINGSTACK_API_KEY="your_api_key"
   PINGSTACK_PHONE_NUMBER_ID="your_phone_id"
   ```
The application will automatically switch from simulated dispatch to live template delivery.
