# Sahaab Cooperative Insurance — what to upload, and in what order
# سحاب للتأمين التعاوني — ما يُرفع، وبأي ترتيب

These are the files this institution's compliance team hands Taameem on day one.
Everything the app shows for Sahaab Insurance is built from exactly these files.
No other institution can see them.

## 1. Policies — `01-policies/`
8 policies, 148 numbered clauses, Arabic and English side by side.
Upload these first. Taameem splits each file into clauses, reads who owns it and
when it was approved, and indexes every clause so a new rule can be matched
against it by reference, not by guesswork.

## 2. The organisation — `02-organisation/`
- `institution.md` — the licence, the regulators and the activity.
- `employees.csv` — 23 people, each with a department and a role.
- `departments.csv` — 15 departments and their heads.
- `systems-register.csv` — 10 systems, who owns each and whether it holds personal data.
- `roles.csv` — what each role may do inside the workspace.

Without these an obligation has no owner and a rule has nowhere to land.

## 3. Announcements — `03-announcements/`
3 regulator letters that bind this sector, as they arrived. In production
Taameem pulls the published ones itself every morning; these are here so the whole
flow can be replayed offline.

---

Sahaab Cooperative Insurance is a demonstration institution. The names, systems and policy text
are realistic but invented; no real institution's documents are included.
