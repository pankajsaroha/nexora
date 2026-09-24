# NEXORA — Authorization & Security Architecture

NEXORA implements a multi-layered security architecture: **Supabase Auth / Session Tokens + Row Level Security (RLS) + Server-Side Permission Verification**.

---

## 1. Role Hierarchy

| Role Code | Title | Core Functional Scope |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Platform Administrator | Global multi-tenant onboarding, system audits, and schema configuration. |
| **`INSTITUTION_ADMIN`**| Institution Admin | Tenant-level settings, faculty & student onboarding, fee structure creation. |
| **`PRINCIPAL`** | Principal / Dean | Executive health dashboard, campus attendance trends, leave approvals, task assignments. |
| **`TEACHER`** | Faculty Member | Class roll-call, period timetable, coursework assignment publishing, student marks. |
| **`STUDENT`** | Enrolled Scholar | Personal class timetable, homework submission, attendance percentage, term report card. |
| **`PARENT`** | Parent / Guardian | Linked children switcher (*Aarav in 8A* vs *Meera in 5B*), fee payment, attendance alerts. |
| **`ACCOUNTANT`** | Bursar / Accountant | Fee receipt generation, overdue accounts, monthly staff payroll processing. |
| **`HOD`** | Head of Department | Department-level curriculum, faculty workload, and subject reports. |

---

## 2. Row Level Security (RLS) Strategy

All tenant-owned tables in Supabase PostgreSQL have Row Level Security enabled (`ENABLE ROW LEVEL SECURITY`).

### Security Definer Helper Functions:
- **`is_member_of_institution(inst_id UUID)`**: Validates that the authenticated user belongs to the target institution.
- **`get_auth_user_role(inst_id UUID)`**: Returns the active role code of the authenticated user.
- **`is_admin_or_principal(inst_id UUID)`**: Returns `true` if the user is a Super Admin, Institution Admin, or Principal.
- **`is_guardian_of_student(student_id UUID)`**: Validates that the authenticated user is the registered guardian of the specified student.

---

## 3. Server-Side Protection Pattern

Every API endpoint and server action validates session identity before performing queries:

```typescript
import { requireAuth, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  // 1. Verify session authentication & institution scope
  const user = await requireAuth(PERMISSIONS.STUDENTS_CREATE);
  
  // 2. Execute mutation strictly scoped to user.institutionId
  const result = await prisma.student.create({
    data: {
      institutionId: user.institutionId,
      ...validatedData
    }
  });
}
```
