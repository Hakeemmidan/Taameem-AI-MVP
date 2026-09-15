/**
 * Checks that nothing in the data layer points across a tenant boundary or at
 * something that does not exist. Run it before every build:
 *   node scripts/verify-data.mjs
 * Exits non-zero on the first category of problem it finds.
 */
import { loadData } from './_bundle.mjs';

const d = await loadData();
const {
  TENANTS,
  SECTORS,
  ROLES,
  DEPARTMENTS,
  EMPLOYEES,
  SYSTEMS,
  POLICIES,
  ANNOUNCEMENTS,
  OBLIGATIONS,
  TASKS,
  EVIDENCE,
  FINDINGS,
  CLIENTS,
  EXTRACTION_RUNS,
  RULES_BY_REGULATOR,
} = d;

const problems = [];
const bad = (msg) => problems.push(msg);

const byId = (list, id) => list.find((x) => x.id === id);
const REGULATORS = new Set(['sama', 'cma', 'ia', 'sdaia', 'nca']);

/* ------------------------------------------------------------- uniqueness */
for (const [name, list] of Object.entries({ EMPLOYEES, SYSTEMS, POLICIES, ANNOUNCEMENTS, OBLIGATIONS, TASKS, EVIDENCE, FINDINGS })) {
  const seen = new Set();
  for (const x of list) {
    if (seen.has(x.id)) bad(`${name}: duplicate id ${x.id}`);
    seen.add(x.id);
  }
}

for (const t of TENANTS) {
  const sector = byId(SECTORS, t.sector);
  if (!sector) bad(`${t.id}: unknown sector ${t.sector}`);
  if (!t.regulators.includes(sector.primary)) bad(`${t.id}: does not answer to its sector regulator ${sector.primary}`);
  for (const r of t.regulators) if (!REGULATORS.has(r)) bad(`${t.id}: unknown regulator ${r}`);

  const depts = DEPARTMENTS.filter((x) => x.tenantId === t.id);
  const people = EMPLOYEES.filter((x) => x.tenantId === t.id);
  const systems = SYSTEMS.filter((x) => x.tenantId === t.id);
  const policies = POLICIES.filter((x) => x.tenantId === t.id);
  const obligations = OBLIGATIONS.filter((x) => x.tenantId === t.id);
  const tasks = TASKS.filter((x) => x.tenantId === t.id);
  const evidence = EVIDENCE.filter((x) => x.tenantId === t.id);
  const findings = FINDINGS.filter((x) => x.tenantId === t.id);
  const deptIds = new Set(depts.map((x) => x.id));

  if (!depts.length) bad(`${t.id}: no departments`);
  if (!policies.length) bad(`${t.id}: no policies`);
  if (!obligations.length) bad(`${t.id}: no obligations`);
  if (!tasks.length) bad(`${t.id}: no tasks`);
  if (!findings.length) bad(`${t.id}: no findings`);

  /* departments */
  const dSeen = new Set();
  for (const x of depts) {
    if (dSeen.has(x.id)) bad(`${t.id}: duplicate department ${x.id}`);
    dSeen.add(x.id);
    const head = people.find((p) => p.id === x.headId);
    if (!head) bad(`${t.id}/${x.id}: head ${x.headId} is not an employee of this institution`);
    else if (head.department !== x.id) bad(`${t.id}/${x.id}: head ${head.id} sits in ${head.department}`);
  }

  /* people */
  for (const p of people) {
    if (!deptIds.has(p.department)) bad(`${p.id}: department ${p.department} does not exist in ${t.id}`);
    if (!byId(ROLES, p.role)) bad(`${p.id}: unknown role ${p.role}`);
    if (!p.email.includes('@')) bad(`${p.id}: malformed email ${p.email}`);
    if (p.name.ar.trim().split(/\s+/).length < 3) bad(`${p.id}: Arabic name is not first + father + family`);
  }

  /* systems */
  for (const s of systems) if (!deptIds.has(s.ownerDept)) bad(`${s.id}: owner department ${s.ownerDept} not in ${t.id}`);

  /* policies */
  for (const p of policies) {
    if (!deptIds.has(p.owner)) bad(`${p.id}: owner department ${p.owner} not in ${t.id}`);
    for (const r of p.regulators) {
      if (!REGULATORS.has(r)) bad(`${p.id}: unknown regulator ${r}`);
      else if (!t.regulators.includes(r)) bad(`${p.id}: cites ${r}, which does not supervise ${t.id}`);
    }
    const refs = new Set();
    for (const s of p.sections)
      for (const c of s.clauses) {
        if (refs.has(c.ref)) bad(`${p.id}: duplicate clause ref ${c.ref}`);
        refs.add(c.ref);
        if (!c.text.ar.trim()) bad(`${p.id} ${c.ref}: empty Arabic text`);
        if (!c.text.en.trim()) bad(`${p.id} ${c.ref}: empty English text`);
      }
  }

  /* obligations */
  for (const o of obligations) {
    const a = byId(ANNOUNCEMENTS, o.announcementId);
    if (!a) bad(`${o.id}: unknown announcement ${o.announcementId}`);
    else {
      if (!a.sectors.includes(t.sector)) bad(`${o.id}: ${a.id} does not bind the ${t.sector} sector`);
      if (!a.body.some((b) => b.ref === o.sourceRef)) bad(`${o.id}: sourceRef ${o.sourceRef} is not a paragraph of ${a.id}`);
    }
    const owner = people.find((p) => p.id === o.ownerId);
    if (!owner) bad(`${o.id}: owner ${o.ownerId} is not an employee of ${t.id}`);
    else if (owner.department !== o.ownerDept) bad(`${o.id}: owner ${owner.id} sits in ${owner.department}, not ${o.ownerDept}`);
    if (!deptIds.has(o.ownerDept)) bad(`${o.id}: department ${o.ownerDept} not in ${t.id}`);

    for (const m of o.mappings) {
      if (m.kind === 'policy') {
        const p = byId(POLICIES, m.targetId);
        if (!p) bad(`${o.id}: policy ${m.targetId} does not exist`);
        else if (p.tenantId !== t.id) bad(`${o.id}: maps onto ${m.targetId}, which belongs to ${p.tenantId}`);
      } else if (m.kind === 'system') {
        const s = byId(SYSTEMS, m.targetId);
        if (!s) bad(`${o.id}: system ${m.targetId} does not exist`);
        else if (s.tenantId !== t.id) bad(`${o.id}: maps onto ${m.targetId}, which belongs to ${s.tenantId}`);
      }
    }
  }

  /* tasks */
  for (const x of tasks) {
    const o = byId(OBLIGATIONS, x.obligationId);
    if (!o) bad(`${x.id}: unknown obligation ${x.obligationId}`);
    else if (o.tenantId !== t.id) bad(`${x.id}: points at ${o.id}, which belongs to ${o.tenantId}`);
    if (!deptIds.has(x.dept)) bad(`${x.id}: department ${x.dept} not in ${t.id}`);
    const a = people.find((p) => p.id === x.assigneeId);
    if (!a) bad(`${x.id}: assignee ${x.assigneeId} is not an employee of ${t.id}`);
    else if (a.department !== x.dept) bad(`${x.id}: assignee ${a.id} sits in ${a.department}, not ${x.dept}`);
    // a task with no instructions is exactly the phone call this product removes
    if (!x.steps || x.steps.length < 3) bad(`${x.id}: fewer than three instruction steps`);
    else
      for (const [i, st] of x.steps.entries()) {
        if (!st.en?.trim()) bad(`${x.id} step ${i + 1}: empty English`);
        if (!st.ar?.trim()) bad(`${x.id} step ${i + 1}: empty Arabic`);
      }
  }

  /* evidence */
  for (const e of evidence) {
    const x = byId(TASKS, e.taskId);
    if (!x) bad(`${e.id}: unknown task ${e.taskId}`);
    else if (x.tenantId !== t.id) bad(`${e.id}: points at ${x.id}, which belongs to ${x.tenantId}`);
    if (!people.some((p) => p.id === e.uploadedBy)) bad(`${e.id}: uploader ${e.uploadedBy} is not an employee of ${t.id}`);
    if (!/^[0-9a-f]{64}$/.test(e.digest)) bad(`${e.id}: digest is not 64 hex characters`);
  }

  /* findings */
  for (const f of findings) {
    if (!deptIds.has(f.ownerDept)) bad(`${f.id}: department ${f.ownerDept} not in ${t.id}`);
    if (!t.regulators.includes(f.regulator)) bad(`${f.id}: cites ${f.regulator}, which does not supervise ${t.id}`);
    if (f.exposureLow > f.exposureHigh) bad(`${f.id}: exposure range is inverted`);
  }

  /* the rule split must add up to the readiness denominator */
  const split = RULES_BY_REGULATOR[t.id] ?? [];
  const summary = d.inspectionSummary(t.id);
  const sum = split.reduce((n, r) => n + r.rules, 0);
  if (sum !== summary.rulesChecked) bad(`${t.id}: rule split sums to ${sum}, readiness uses ${summary.rulesChecked}`);
  for (const r of split) if (!t.regulators.includes(r.regulator)) bad(`${t.id}: rule split names ${r.regulator}, not a supervisor`);
  if (summary.inOrder > summary.rulesChecked) bad(`${t.id}: more rules in order than checked`);

  const stats = d.libraryStats(t.id);
  if (stats.clauses !== summary.clausesChecked)
    bad(`${t.id}: library has ${stats.clauses} clauses, inspection summary claims ${summary.clausesChecked}`);

  /* every sign-in account must land on a workspace with something in it */
  for (const p of people.filter((x) => x.signIn)) {
    const role = byId(ROLES, p.role);
    if (!role.can.ownDepartmentOnly) continue;
    const mine = tasks.filter((x) => x.dept === p.department);
    const behind = new Set(mine.map((x) => x.obligationId));
    const obs = obligations.filter((o) => o.ownerDept === p.department || behind.has(o.id));
    if (!mine.length && !obs.length) bad(`${p.id} (${p.name.en}) can sign in but their department has no work`);
  }

  /* every institution must offer each role at sign-in */
  const offered = new Set(people.filter((x) => x.signIn).map((x) => x.role));
  for (const r of ['cco', 'manager', 'officer', 'dept_head', 'auditor']) {
    if (!offered.has(r)) bad(`${t.id}: no ${r} offered on the sign-in screen`);
  }

  /* the letter each workspace opens on */
  const live = d.LIVE_ANNOUNCEMENT[t.id];
  const liveA = byId(ANNOUNCEMENTS, live);
  if (!liveA) bad(`${t.id}: live announcement ${live} does not exist`);
  else if (!liveA.sectors.includes(t.sector)) bad(`${t.id}: live announcement does not bind its sector`);
}

/* announcements */
for (const a of ANNOUNCEMENTS) {
  if (!a.sectors.length) bad(`${a.id}: binds no sector`);
  for (const s of a.sectors) if (!byId(SECTORS, s)) bad(`${a.id}: unknown sector ${s}`);
  if (!REGULATORS.has(a.regulator)) bad(`${a.id}: unknown regulator ${a.regulator}`);
  if (a.issued > a.deadline) bad(`${a.id}: issued after its deadline`);
  const refs = new Set();
  for (const p of a.body) {
    if (refs.has(p.ref)) bad(`${a.id}: duplicate paragraph ref ${p.ref}`);
    refs.add(p.ref);
  }
}

/* the console */
for (const c of CLIENTS) {
  if (!byId(SECTORS, c.sector)) bad(`${c.id}: unknown sector ${c.sector}`);
  if (c.tenantId && !byId(TENANTS, c.tenantId)) bad(`${c.id}: unknown tenant ${c.tenantId}`);
  if (c.tenantId) {
    const open = OBLIGATIONS.filter((o) => o.tenantId === c.tenantId).length;
    if (c.openObligations !== open) bad(`${c.id}: claims ${c.openObligations} open obligations, the workspace has ${open}`);
  }
}
for (const r of EXTRACTION_RUNS) {
  if (!byId(TENANTS, r.tenantId)) bad(`${r.id}: unknown tenant ${r.tenantId}`);
  if (!EMPLOYEES.some((e) => e.id === r.reviewer && e.tenantId === r.tenantId)) bad(`${r.id}: reviewer ${r.reviewer} is not at ${r.tenantId}`);
  if (r.accepted + r.edited + r.rejected !== r.rules) bad(`${r.id}: outcomes do not add up to ${r.rules} rules`);
}

/* ------------------------------------------------------------------ report */
if (problems.length) {
  console.error(`\n  ${problems.length} problem${problems.length === 1 ? '' : 's'} found:\n`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('');
  process.exit(1);
}

const line = (label, n) => `  ${label.padEnd(26)} ${String(n).padStart(4)}`;
console.log('\n  Data is consistent.\n');
for (const t of TENANTS) {
  const stats = d.libraryStats(t.id);
  console.log(`  ${t.name.en}`);
  console.log(line('departments', DEPARTMENTS.filter((x) => x.tenantId === t.id).length));
  console.log(line('people', EMPLOYEES.filter((x) => x.tenantId === t.id).length));
  console.log(line('systems', SYSTEMS.filter((x) => x.tenantId === t.id).length));
  console.log(line('policies', stats.policies));
  console.log(line('clauses', stats.clauses));
  console.log(line('obligations', OBLIGATIONS.filter((x) => x.tenantId === t.id).length));
  console.log(line('tasks', TASKS.filter((x) => x.tenantId === t.id).length));
  console.log(line('findings', FINDINGS.filter((x) => x.tenantId === t.id).length));
  console.log('');
}
