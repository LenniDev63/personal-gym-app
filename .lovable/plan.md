## Goal

Convert the app to a model where:
- Anyone signing up via the login screen creates a **student** account (trainer signup is removed).
- New students appear in a **global student list** that any trainer can review and **approve or reject**.
- Trainers act as **admins**: every trainer can see, edit, and prescribe workouts for every approved student. Students are no longer bound to a single trainer.
- Trainer accounts are created manually in the database (no UI).

## Changes

### 1. Login screen
- Remove the role selector (Trainer / Student) from `LoginPage.tsx`.
- Sign-up always creates a `student` account.
- Sign-in remains open to both roles (trainers log in with manually created accounts).

### 2. Database (migration)
- Add `approval_status` (`pending` | `approved` | `rejected`) to `student_details`, default `pending`. New row auto-created in `handle_new_user` for students.
- Update `handle_new_user`: ignore the `role` from signup metadata and always insert `student` (defense in depth).
- Drop the per-trainer link model for visibility/management. Keep `trainer_students` table (still useful for chat ownership) but **make it optional / informational** — replace its role in RLS with global trainer access.
- Add helper function `is_trainer(_user uuid)` → true if user has the `trainer` role.
- Rewrite RLS so that **any** trainer can:
  - view & update every `profiles` row of a student
  - view & update every `student_details` row
  - view every `progress_entries` row and insert progress for any student
  - manage `workouts` and `workout_exercises` for any student (drop the `trainer_id = auth.uid()` restriction on SELECT; keep trainer_id stamped on INSERT for audit)
  - view & manage `exercises` library globally (shared trainer library)
  - start `conversations` with any student
- Students keep self-access policies unchanged.

### 3. Trainer Students screen (`StudentsPage.tsx`)
- Replace "add student by email" flow with two tabs/sections:
  - **Pending approvals** — list of students with `approval_status = 'pending'`, each with **Approve** / **Reject** buttons.
  - **Active students** — list of all `approved` students (global, not filtered by trainer).
- Remove the "Add Student" modal and `+` button.
- Approve → set `approval_status = 'approved'`. Reject → set `approval_status = 'rejected'` (hidden from active list).
- Chat / Progress / Workouts buttons remain and work for any approved student.

### 4. Trainer Dashboard
- "Active Students" count = global count of approved students.
- Add a small "Pending approvals" badge/card linking to the Students page when count > 0.

### 5. Other trainer screens
- `StudentWorkoutsPage`, `MessagesPage`, etc. already key off the student id — they keep working once RLS allows global trainer access.

### 6. Student-side
- Newly registered student sees a "Waiting for trainer approval" empty state on their dashboard until approved (simple message; existing pages still load, just with no workouts).

## Technical notes

- No CHECK constraints with `now()`; use a plain text column with an app-level enum.
- All policy changes done via a single migration; existing data migrated by setting current linked students to `approved`.
- `trainer_students` table is kept (so existing chat conversations referencing it still work) but no longer required for visibility. New approvals do **not** auto-create a `trainer_students` row.
- Frontend keeps English copy and current design tokens.
