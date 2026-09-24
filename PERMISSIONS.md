# NEXORA Role & Permission Matrix

NEXORA enforces server-side capability checking using granular permission codes:

| Permission Code | Description | Super Admin | Principal | Teacher | Accountant | Student | Parent |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `students.view` | View enrolled students | ✓ | ✓ | ✓ | ✓ | Self | Linked |
| `students.create` | Register new admissions | ✓ | ✓ | - | - | - | - |
| `attendance.mark` | Take daily student roll-call | ✓ | ✓ | ✓ | - | - | - |
| `fees.collect` | Process payments & issue receipts | ✓ | ✓ | - | ✓ | - | - |
| `fees.view` | View invoices and receipts | ✓ | ✓ | - | ✓ | Self | Linked |
| `payroll.view` | View staff salary sheets | ✓ | ✓ | Self | ✓ | - | - |
| `payroll.approve` | Approve monthly payroll | ✓ | ✓ | - | - | - | - |
| `assignments.create`| Post homework and coursework | ✓ | ✓ | ✓ | - | - | - |
| `tasks.manage` | Create and assign management tasks | ✓ | ✓ | Self | - | - | - |
| `audit.view` | Inspect security audit trails | ✓ | ✓ | - | - | - | - |
