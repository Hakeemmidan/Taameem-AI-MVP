/**
 * Writes the files a compliance team would hand Taameem on day one, generated
 * from the same data the app runs on so the two can never drift apart.
 * One folder per institution, because a bank, an insurer and a capital market
 * institution are separate accounts that never share a document.
 *   node scripts/make-seed-files.mjs
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData } from './_bundle.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'public', 'seed-files');

const { POLICIES, DEPARTMENTS, EMPLOYEES, SYSTEMS, ANNOUNCEMENTS, TENANTS, SECTORS, ROLES } = await loadData();

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const csv = (rows) =>
  rows.map((r) => r.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(',')).join('\n');

const clausesOf = (p) => p.sections.flatMap((s) => s.clauses);
const roleName = (id) => ROLES.find((r) => r.id === id);

/** A short, stable folder name per institution: 01-innovation-bank and so on. */
const folderOf = (t, i) =>
  `${String(i + 1).padStart(2, '0')}-${t.shortName.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;

const summary = [];

TENANTS.forEach((tenant, i) => {
  const root = join(OUT, folderOf(tenant, i));
  const sector = SECTORS.find((s) => s.id === tenant.sector);

  const policies = POLICIES.filter((p) => p.tenantId === tenant.id);
  const departments = DEPARTMENTS.filter((d) => d.tenantId === tenant.id);
  const employees = EMPLOYEES.filter((e) => e.tenantId === tenant.id);
  const systems = SYSTEMS.filter((s) => s.tenantId === tenant.id);
  const letters = ANNOUNCEMENTS.filter((a) => a.sectors.includes(tenant.sector));
  const dept = (id) => departments.find((d) => d.id === id);

  mkdirSync(join(root, '01-policies'), { recursive: true });
  mkdirSync(join(root, '02-organisation'), { recursive: true });
  mkdirSync(join(root, '03-announcements'), { recursive: true });

  /* ----------------------------------------------------------- policies */
  const policyIndex = [
    `# Policy library — ${tenant.name.en}`,
    `# مكتبة السياسات — ${tenant.name.ar}`,
    '',
    '| File | Code | Policy | Version | Owner | Clauses |',
    '| --- | --- | --- | --- | --- | --- |',
  ];

  for (const p of policies) {
    const clauses = clausesOf(p);
    const owner = dept(p.owner);
    const lines = [
      `# ${p.title.en}`,
      `# ${p.title.ar}`,
      '',
      `| | |`,
      `| --- | --- |`,
      `| Institution | ${tenant.name.en} · ${tenant.name.ar} |`,
      `| Code | ${p.code} |`,
      `| Version | ${p.version} |`,
      `| Owner | ${owner.name.en} · ${owner.name.ar} |`,
      `| Approved by | ${p.approvedBy.en} · ${p.approvedBy.ar} |`,
      `| Effective | ${p.effective} |`,
      `| Next review | ${p.nextReview} |`,
      `| Regulators | ${p.regulators.map((r) => r.toUpperCase()).join(', ')} |`,
      `| Clauses | ${clauses.length} |`,
      '',
      `> ${p.summary.en}`,
      `>`,
      `> ${p.summary.ar}`,
      '',
    ];
    for (const s of p.sections) {
      lines.push(`## ${s.ref}. ${s.heading.en} — ${s.heading.ar}`, '');
      for (const c of s.clauses) {
        lines.push(`### ${c.ref} ${c.heading.en} — ${c.heading.ar}`, '', c.text.en, '', c.text.ar, '', `\`tags: ${c.tags.join(', ')}\``, '');
      }
    }
    writeFileSync(join(root, '01-policies', p.sourceFile), lines.join('\n'), 'utf8');
    policyIndex.push(`| ${p.sourceFile} | ${p.code} | ${p.title.en} | ${p.version} | ${owner.name.en} | ${clauses.length} |`);
  }
  writeFileSync(join(root, '01-policies', '00-INDEX.md'), policyIndex.join('\n'), 'utf8');

  /* ------------------------------------------------------- organisation */
  writeFileSync(
    join(root, '02-organisation', 'employees.csv'),
    csv([
      ['employee_id', 'name_en', 'name_ar', 'title_en', 'title_ar', 'role_id', 'role_en', 'role_ar', 'department_id', 'department_en', 'department_ar', 'email', 'phone', 'can_approve', 'joined'],
      ...employees.map((e) => {
        const d = dept(e.department);
        const r = roleName(e.role);
        return [e.id, e.name.en, e.name.ar, e.title.en, e.title.ar, e.role, r.name.en, r.name.ar, e.department, d.name.en, d.name.ar, e.email, e.phone, e.approver ? 'yes' : 'no', e.joined];
      }),
    ]),
    'utf8',
  );

  writeFileSync(
    join(root, '02-organisation', 'departments.csv'),
    csv([
      ['department_id', 'name_en', 'name_ar', 'head_employee_id', 'head_name_en', 'head_name_ar', 'headcount'],
      ...departments.map((d) => {
        const head = employees.find((e) => e.id === d.headId);
        return [d.id, d.name.en, d.name.ar, d.headId, head.name.en, head.name.ar, d.headcount];
      }),
    ]),
    'utf8',
  );

  writeFileSync(
    join(root, '02-organisation', 'systems-register.csv'),
    csv([
      ['system_id', 'name_en', 'name_ar', 'vendor', 'owner_department', 'criticality', 'hosting_en', 'holds_personal_data', 'purpose_en', 'purpose_ar'],
      ...systems.map((s) => [s.id, s.name.en, s.name.ar, s.vendor, s.ownerDept, s.criticality, s.hosting.en, s.holdsPersonalData ? 'yes' : 'no', s.purpose.en, s.purpose.ar]),
    ]),
    'utf8',
  );

  writeFileSync(
    join(root, '02-organisation', 'roles.csv'),
    csv([
      ['role_id', 'name_en', 'name_ar', 'review_obligations', 'approve_obligations', 'assign_tasks', 'upload_evidence', 'send_to_regulator', 'run_inspection', 'edit_policies', 'own_department_only', 'people_in_this_institution'],
      ...ROLES.filter((r) => r.id !== 'platform').map((r) => [
        r.id,
        r.name.en,
        r.name.ar,
        r.can.reviewObligations ? 'yes' : 'no',
        r.can.approveObligations ? 'yes' : 'no',
        r.can.assignTasks ? 'yes' : 'no',
        r.can.uploadEvidence ? 'yes' : 'no',
        r.can.sendToRegulator ? 'yes' : 'no',
        r.can.runInspection ? 'yes' : 'no',
        r.can.editPolicies ? 'yes' : 'no',
        r.can.ownDepartmentOnly ? 'yes' : 'no',
        employees.filter((e) => e.role === r.id).length,
      ]),
    ]),
    'utf8',
  );

  writeFileSync(
    join(root, '02-organisation', 'institution.md'),
    [
      `# ${tenant.name.en}`,
      `# ${tenant.name.ar}`,
      '',
      `| | |`,
      `| --- | --- |`,
      `| Tenant id | ${tenant.id} |`,
      `| Sector | ${sector.name.en} · ${sector.name.ar} |`,
      `| Licence | ${tenant.licence.en} · ${tenant.licence.ar} |`,
      `| Regulators | ${tenant.regulators.map((r) => r.toUpperCase()).join(', ')} |`,
      `| City | ${tenant.city.en} · ${tenant.city.ar} |`,
      `| Founded | ${tenant.founded} |`,
      `| Staff | ${tenant.staff} |`,
      tenant.network ? `| Network | ${tenant.network.en} · ${tenant.network.ar} |` : '',
      '',
      tenant.activity.en,
      '',
      tenant.activity.ar,
      '',
      '---',
      '',
      `Sector size in the Kingdom: **${sector.population}**. ${sector.populationNote.en}`,
      '',
      `حجم القطاع في المملكة: **${sector.population}**. ${sector.populationNote.ar}`,
      '',
    ]
      .filter((l) => l !== '')
      .join('\n'),
    'utf8',
  );

  /* ------------------------------------------------------ announcements */
  for (const a of letters) {
    const lines = [
      `# ${a.title.ar}`,
      `# ${a.title.en}`,
      '',
      `| | |`,
      `| --- | --- |`,
      `| Reference | ${a.reference} |`,
      `| Regulator | ${a.regulator.toUpperCase()} |`,
      `| Issued | ${a.issued} |`,
      `| Effective | ${a.deadline} |`,
      `| Pages | ${a.pages} |`,
      '',
      `**Applies to:** ${a.appliesTo.en}`,
      '',
      `**النطاق:** ${a.appliesTo.ar}`,
      '',
      '---',
      '',
    ];
    for (const p of a.body) lines.push(`**${p.ref}**`, '', p.text.ar, '', `*${p.text.en}*`, '');
    writeFileSync(join(root, '03-announcements', a.sourceFile.replace(/\.pdf$/i, '.md')), lines.join('\n'), 'utf8');
  }

  /* ------------------------------------------------------------ read me */
  writeFileSync(
    join(root, 'README.md'),
    `# ${tenant.name.en} — what to upload, and in what order
# ${tenant.name.ar} — ما يُرفع، وبأي ترتيب

These are the files this institution's compliance team hands Taameem on day one.
Everything the app shows for ${tenant.shortName.en} is built from exactly these files.
No other institution can see them.

## 1. Policies — \`01-policies/\`
${policies.length} policies, ${policies.reduce((n, p) => n + clausesOf(p).length, 0)} numbered clauses, Arabic and English side by side.
Upload these first. Taameem splits each file into clauses, reads who owns it and
when it was approved, and indexes every clause so a new rule can be matched
against it by reference, not by guesswork.

## 2. The organisation — \`02-organisation/\`
- \`institution.md\` — the licence, the regulators and the activity.
- \`employees.csv\` — ${employees.length} people, each with a department and a role.
- \`departments.csv\` — ${departments.length} departments and their heads.
- \`systems-register.csv\` — ${systems.length} systems, who owns each and whether it holds personal data.
- \`roles.csv\` — what each role may do inside the workspace.

Without these an obligation has no owner and a rule has nowhere to land.

## 3. Announcements — \`03-announcements/\`
${letters.length} regulator letters that bind this sector, as they arrived. In production
Taameem pulls the published ones itself every morning; these are here so the whole
flow can be replayed offline.

---

${tenant.name.en} is a demonstration institution. The names, systems and policy text
are realistic but invented; no real institution's documents are included.
`,
    'utf8',
  );

  summary.push({
    folder: folderOf(tenant, i),
    tenant,
    sector,
    policies: policies.length,
    clauses: policies.reduce((n, p) => n + clausesOf(p).length, 0),
    employees: employees.length,
    departments: departments.length,
    systems: systems.length,
    letters: letters.length,
  });
});

/* -------------------------------------------------------------- top index */
writeFileSync(
  join(OUT, 'README.md'),
  `# Taameem seed files
# ملفات التهيئة لمنصة تعميم

Three separate institutions, three separate accounts. Nothing is shared between
them: a bank never sees an insurer's policies, and an insurer never sees a
capital market institution's client files.

| Folder | Institution | Sector | Policies | Clauses | People | Departments | Systems | Letters |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${summary
  .map(
    (s) =>
      `| \`${s.folder}/\` | ${s.tenant.name.en} · ${s.tenant.name.ar} | ${s.sector.name.en} | ${s.policies} | ${s.clauses} | ${s.employees} | ${s.departments} | ${s.systems} | ${s.letters} |`,
  )
  .join('\n')}

Total: ${summary.reduce((n, s) => n + s.policies, 0)} policies, ${summary.reduce((n, s) => n + s.clauses, 0)} clauses,
${summary.reduce((n, s) => n + s.employees, 0)} named people and ${summary.reduce((n, s) => n + s.systems, 0)} systems.

Each folder opens with its own README explaining what to upload and in what order.

---

ثلاث منشآت منفصلة، وثلاثة حسابات منفصلة. لا شيء مشترك بينها: لا يرى البنك سياسات
شركة التأمين، ولا ترى شركة التأمين ملفات عملاء مؤسسة السوق المالية.
`,
  'utf8',
);

console.log(`seed files written to public/seed-files for ${summary.length} institutions`);
