# Taameem · تعميم

**From a new rule to proof it was done.**

A regulator letter arrives, the AI reads the Arabic, maps it onto the
institution's own policies and systems, and turns every gap into a task with an
owner, a deadline and sealed proof, ending in a report ready for the regulator.
Seven steps, and a person decides at each one.

> A fully working build. It opens in a browser with no server and no database.
> `الملف بالعربية: ` [README.md](README.md)

---

## Run it

```bash
npm install
npm run dev
```

Then open `http://localhost:3100`.

### Other commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3100 |
| `npm run build` | Builds a static site into `out/` |
| `npm run serve` | Serves the build with a zero-dependency server |
| `npm run typecheck` | Type check |
| `npm run verify` | Data consistency check (see below) |
| `npm run check` | Both, which is what runs before every deploy |
| `npm run seed` | Generates the seed files in `public/seed-files` |
| `npm run package` | Assembles a complete hand-over folder for a demo |
| `npm run walk` | Walks the seven steps in a real browser and fails if any of them does not work |

There is no sign-in. The workspace opens directly as **Sarah Abdullah
Al-Rashid**, Chief Compliance Officer at Innovation Bank.

---

## What it is built with

| Layer | Tool | Why |
| --- | --- | --- |
| Framework | **Next.js 15** · App Router | Full static export, so it runs from a folder, a USB stick or GitHub Pages |
| UI | **React 19** + strict **TypeScript 5.7** | Types catch data mistakes before they reach a screen |
| Styling | **Tailwind CSS 3.4** with CSS variables | One palette serving both light and dark |
| Icons | **lucide-react** | Light and consistent |
| Fonts | `next/font` · **Inter** + **IBM Plex Sans Arabic** | Self-hosted at build time, no external request |
| State | React Context + `localStorage` | No server, and a session survives a refresh mid-demo |
| File reading | Browser File API | Real parsing of the file the user picked |
| Sealing evidence | **SubtleCrypto** · SHA-256 | The fingerprint comes from the file's own bytes |
| Downloads | Blob API | The report and evidence register are built in the browser |
| Build tooling | **esbuild** | Lets Node scripts read the TypeScript data layer |

**Zero runtime dependencies** beyond React and Next. No database, no backend,
no network call from inside the app.

---

## The journey: seven steps

The landing page is the journey itself. Each step is a card that opens the real
place in the product, the cards fill in as you progress, and every page ends
with a hand-off into the next step.

| # | Step | Who does it | The question it answers |
| --- | --- | --- | --- |
| 1 | The letter arrives | Taameem | What was issued, and does it bind us? |
| 2 | The AI reads it | Taameem AI | What exactly does it require? |
| 3 | A person approves | Compliance | Do we accept this reading? |
| 4 | What must change | Taameem AI | Where are we today, and where must we be? |
| 5 | Tasks reach the teams | The owning departments | Who does what, and by when? |
| 6 | Proof is collected | The owning departments | Can we show it was done? |
| 7 | The report goes out | Chief Compliance Officer | What do we tell the regulator? |

Progress is read from what the user actually did rather than a stored step
number, so a refresh or a jump straight to a page never puts the journey out of
order. Sending the report closes the case: the letter is filed as reported, the
report locks, and all seven steps complete.

---

## What makes this build different

### Uploads are real, not theatre
Pick a file from your machine and it is read in your browser. Lines, words,
Arabic share, sections, numbered parts, how many carry a duty and how many name
a period are all **measured from your file**. If it is a PDF or an image we say
so plainly and print no number we did not read. After the upload, click the file
to read back the parts that were pulled out of it, in Arabic and English.

### Evidence is genuinely sealed
A **SHA-256** fingerprint is computed from the file's contents in the browser at
the moment of upload. Any later edit produces a different fingerprint.

### The self-inspection walks the flow
Every finding turns into a **real task** on the board with one click: the head
of the owning department by name, a deadline taken from the finding's own fix
window, six numbered instructions, and, as the proof to hand back, the exact
thing the inspector said they would ask for.

### Tasks arrive understood
25 tasks and 149 numbered steps, naming the real system, the real clause number
and the colleague who signs off, so nobody has to ring Compliance to ask what
was meant.

### Roles change the screen
| Role | What they can do |
| --- | --- |
| Chief Compliance Officer | Full access, and the only one who sends to the regulator |
| Compliance Manager | Reviews, approves and assigns; submits the report **for approval** |
| Compliance Officer | Reviews and prepares, without final approval |
| Department Head | Sees their own department only: its tasks and its evidence |
| Internal Auditor | Read-only across the institution |

To open a screen as someone else during a walk-through, add
`?as=<employee id>` to any URL, for example `?as=E-002`. Nothing in the
interface offers it.

### Three tenants that never cross
A bank, an insurer and a capital market institution. Each has its own policies,
people, systems and the circulars that bind its sector alone. This build opens
the bank's workspace.

| Institution | Sector | Policies | Clauses | People | Systems |
| --- | --- | --- | --- | --- | --- |
| Innovation Bank | Banking and finance | 8 | 134 | 38 | 15 |
| Sahaab Cooperative Insurance | Insurance | 8 | 148 | 23 | 10 |
| Rawda Capital | Capital market | 8 | 138 | 18 | 8 |

### The Taameem console
`/admin` — our own side: the regulatory sources we watch, extraction quality
measured by what the compliance officer did with each rule, and client health.
Our team reaches no client's policies or evidence.

---

## Layout

```
src/
├── app/                    App Router pages
│   ├── page.tsx            The cover: the seven steps
│   ├── institution/        The workspace (journey, announcements, obligations,
│   │                       tasks, evidence, report, policies, people, inspection)
│   └── admin/              The Taameem console
├── components/
│   ├── ui/                 Primitives: button, card, badge, drawer, modal
│   ├── layout/             Shell, top bar, logo
│   └── features/           Flow, AI runner, file picker, notifications
├── data/                   The whole data layer, in TypeScript
│   ├── tenants.ts          Institutions, sectors, roles and their permissions
│   ├── org.ts              79 employees and 44 departments, real Saudi naming
│   ├── policies/           24 policies, 420 clauses, Arabic and English
│   ├── announcements.ts    Regulator letters with their original text
│   ├── obligations.ts      Extracted rules and where they land in each tenant
│   └── work.ts             Tasks, evidence and inspection findings
├── lib/
│   ├── flow.ts             The seven steps
│   ├── parse.ts            File reading, parsing, SHA-256
│   ├── report.ts           Builds the final report and evidence register
│   ├── fix.ts              Turns an inspection finding into a task
│   ├── scope.ts            What each role may see
│   ├── ai/                 The AI run scripts
│   ├── i18n/               Bilingual dictionary and language provider
│   └── store/              Workspace state, progress, notifications
└── scripts/                Seed generation, verification, packaging, server
```

---

## Quality

`npm run check` refuses to pass if:

- One tenant's data points at another tenant's
- An obligation's owner sits in a different department, or a task's assignee
  sits outside the department it was sent to
- A figure on screen disagrees with the library behind it
- A task ships without instructions, or with an empty step in either language
- An employee's Arabic name is not first, father and family

It runs in CI before every deploy.

`npm run walk` drives a real browser through the seven steps from an empty
workspace: it opens the letter, runs the read, approves the obligations, sends
the tasks to the departments, completes them, uploads evidence and checks the
fingerprint was sealed, sends the report, then turns an inspection finding into
a task and confirms it reaches the board. Sixteen checks, and any step that does
not work fails the command.

---

## Deployment

Deployed to GitHub Pages automatically on every push to `main`.

To turn it on once: **Settings → Pages → Source: GitHub Actions**.

---

## Note

Innovation Bank, Sahaab Cooperative Insurance and Rawda Capital are
demonstration institutions. The names and policies are realistic in their
drafting but written by us, and contain no document belonging to a real
institution. Sector sizes come from published official sources.

**Team Taameem** · Financial Market Innovation Hackathon · Track 1, RegTech
