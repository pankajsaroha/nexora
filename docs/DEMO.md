# NEXORA — Demo Environment & Persona Workspaces

NEXORA provides an isolated, deterministic demonstration environment for prospective customers to experience the system without polluting real tenant datasets.

---

## 1. Two Data Worlds

- **WORLD A (Demo)**: Coherent sample dataset under `Northstar International Academy` (CBSE-9021).
  - Principal: `Dr. Arvind Menon` (`principal@nexora.demo`)
  - Teacher: `Mrs. Ananya Sharma` (`teacher@nexora.demo`)
  - Student: `Aarav Sharma` (`student@nexora.demo`)
  - Parent: `Mr. Rahul Sharma` (`parent@nexora.demo`)
  - Accountant: `Mrs. Neha Kapoor` (`accountant@nexora.demo`)
  - Super Admin: `admin@nexora.demo`

- **WORLD B (Real SaaS Tenants)**: Created through the Onboarding Wizard (`/onboarding`). Each institution has a unique code, dedicated academic years, isolated student ledgers, and independent user accounts.

---

## 2. Interactive Role Switching

The demo switcher at `/api/auth/demo-switch` allows instant traversal across roles during product evaluations without requiring password prompts.
