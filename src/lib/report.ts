import type { Announcement, Evidence, Lang, Obligation, Task } from '@/lib/types';
import type { Tenant } from '@/data/tenants';
import { byId } from '@/data/org';
import { regulatorById } from '@/data/regulators';
import { worstGap } from '@/data/obligations';
import { fmtDate } from '@/lib/utils';

export interface ReportInput {
  tenant: Tenant;
  announcement: Announcement;
  obligations: Obligation[];
  /** the decision made on each obligation, keyed by id */
  status: Record<string, string>;
  confirmedBy: Record<string, { by: string; at: string }>;
  tasks: Task[];
  taskStatus: Record<string, string>;
  evidence: Evidence[];
  signedBy: string;
  sentAt: string | null;
}

const line = (n = 64) => '─'.repeat(n);

/**
 * The report as plain text, so it can be copied into an email or saved as a
 * file without a viewer. Every line is assembled from the decisions the team
 * actually made, which is why there is nothing here to type by hand.
 */
export function buildReport(input: ReportInput, lang: Lang): string {
  const { tenant, announcement, obligations, status, confirmedBy, tasks, taskStatus, evidence, signedBy, sentAt } = input;
  const ar = lang === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);
  const reg = regulatorById(announcement.regulator);
  const signer = byId(signedBy);

  const confirmed = obligations.filter((o) => status[o.id] === 'confirmed');
  const rejected = obligations.filter((o) => status[o.id] === 'rejected');
  const done = tasks.filter((x) => taskStatus[x.id] === 'done');

  const out: string[] = [];
  const push = (...l: string[]) => out.push(...l);

  push(
    t('IMPLEMENTATION REPORT', 'تقرير التنفيذ'),
    line(),
    `${t('To', 'إلى')}: ${ar ? reg.name.ar : reg.name.en}`,
    `${t('From', 'من')}: ${ar ? tenant.name.ar : tenant.name.en}`,
    `${t('Subject', 'الموضوع')}: ${ar ? announcement.title.ar : announcement.title.en}`,
    `${t('Reference', 'المرجع')}: ${announcement.reference}`,
    `${t('Issued', 'تاريخ الصدور')}: ${fmtDate(announcement.issued, lang)}`,
    `${t('Effective', 'تاريخ السريان')}: ${fmtDate(announcement.deadline, lang)}`,
    `${t('Report date', 'تاريخ التقرير')}: ${fmtDate(sentAt ?? new Date().toISOString(), lang)}`,
    '',
    t(
      `This report sets out how ${tenant.name.en} has implemented the requirements of the above, rule by rule, with the evidence held for each.`,
      `يبيّن هذا التقرير كيف نفّذت ${tenant.name.ar} متطلبات ما ورد أعلاه، قاعدة بقاعدة، مع الدليل المحفوظ لكل منها.`,
    ),
    '',
    line(),
    t('1. SUMMARY', '1. الملخص'),
    line(),
    `${t('Rules extracted from the letter', 'القواعد المستخرجة من التعميم')}: ${obligations.length}`,
    `${t('Confirmed and implemented', 'المعتمدة والمنفذة')}: ${confirmed.length}`,
    `${t('Rejected as not applicable', 'المرفوضة لعدم الانطباق')}: ${rejected.length}`,
    `${t('Tasks raised', 'المهام الصادرة')}: ${tasks.length}`,
    `${t('Tasks completed', 'المهام المنجزة')}: ${done.length}`,
    `${t('Evidence files sealed', 'ملفات الأدلة المختومة')}: ${evidence.length}`,
    '',
    line(),
    t('2. RULE BY RULE', '2. قاعدة بقاعدة'),
    line(),
    '',
  );

  obligations.forEach((o, i) => {
    const decision = status[o.id] ?? o.status;
    const stamp = confirmedBy[o.id];
    const approver = stamp ? byId(stamp.by) : undefined;
    const mine = tasks.filter((x) => x.obligationId === o.id);

    push(
      `${i + 1}. ${o.id} · ${ar ? announcement.title.ar : announcement.title.en} ${o.sourceRef}`,
      `   ${t('Requirement', 'المتطلب')}: ${ar ? o.statement.ar : o.statement.en}`,
      `   ${t('Source text', 'النص المصدر')}: ${announcement.body.find((b) => b.ref === o.sourceRef)?.text.ar ?? '—'}`,
      `   ${t('Decision', 'القرار')}: ${
        decision === 'confirmed'
          ? t('Confirmed', 'معتمد')
          : decision === 'rejected'
            ? t('Rejected', 'مرفوض')
            : t('Awaiting review', 'بانتظار المراجعة')
      }${approver ? ` — ${ar ? approver.name.ar : approver.name.en}` : ''}`,
      `   ${t('Gap at the time of reading', 'الفجوة وقت القراءة')}: ${worstGap(o)}`,
    );

    o.mappings.forEach((m) => {
      push(
        `   · ${ar ? m.locator.ar : m.locator.en}`,
        `       ${t('Was', 'كان')}: ${ar ? m.current.ar : m.current.en}`,
        `       ${t('Now', 'أصبح')}: ${ar ? m.required.ar : m.required.en}`,
      );
    });

    mine.forEach((x) => {
      const owner = byId(x.assigneeId);
      const proofs = evidence.filter((e) => e.taskId === x.id);
      push(
        `   · ${t('Task', 'مهمة')} ${x.id}: ${ar ? x.title.ar : x.title.en}`,
        `       ${t('Owner', 'المسؤول')}: ${owner ? (ar ? owner.name.ar : owner.name.en) : x.assigneeId}`,
        `       ${t('Due', 'الموعد')}: ${fmtDate(x.due, lang)} · ${x.hijri}`,
        `       ${t('Status', 'الحالة')}: ${
          (taskStatus[x.id] ?? x.status) === 'done' ? t('Completed', 'منجزة') : t('In progress', 'قيد التنفيذ')
        }`,
        ...proofs.map((e) => `       ${t('Evidence', 'دليل')}: ${e.fileName} · sha-256 ${e.digest.slice(0, 32)}…`),
      );
    });

    push('');
  });

  // work the self-inspection raised belongs to no letter, so it gets its own
  // section rather than being dropped from the report
  const raised = tasks.filter((x) => !x.obligationId);
  if (raised.length > 0) {
    push(line(), t('3. RAISED BY OUR OWN INSPECTION', '3. ما رفعه تفتيشنا الذاتي'), line(), '');
    raised.forEach((x, i) => {
      const owner = byId(x.assigneeId);
      const proofs = evidence.filter((e) => e.taskId === x.id);
      push(
        `${i + 1}. ${x.id}: ${ar ? x.title.ar : x.title.en}`,
        `   ${t('Owner', 'المسؤول')}: ${owner ? (ar ? owner.name.ar : owner.name.en) : x.assigneeId}`,
        `   ${t('Due', 'الموعد')}: ${fmtDate(x.due, lang)} · ${x.hijri}`,
        `   ${t('Status', 'الحالة')}: ${
          (taskStatus[x.id] ?? x.status) === 'done' ? t('Completed', 'منجزة') : t('In progress', 'قيد التنفيذ')
        }`,
        ...proofs.map((e) => `   ${t('Evidence', 'دليل')}: ${e.fileName} · sha-256 ${e.digest.slice(0, 32)}…`),
        '',
      );
    });
  }

  push(
    line(),
    raised.length > 0 ? t('4. EVIDENCE REGISTER', '4. سجل الأدلة') : t('3. EVIDENCE REGISTER', '3. سجل الأدلة'),
    line(),
    t(
      'Each file below was fingerprinted at the moment it was uploaded. A changed file produces a different fingerprint.',
      'كل ملف أدناه بُصم لحظة رفعه. وأي تعديل عليه ينتج بصمة مختلفة.',
    ),
    '',
  );

  evidence.forEach((e, i) => {
    const up = byId(e.uploadedBy);
    push(
      `${i + 1}. ${e.fileName}`,
      `   ${t('Task', 'المهمة')}: ${e.taskId}`,
      `   ${t('Uploaded by', 'رفعه')}: ${up ? (ar ? up.name.ar : up.name.en) : e.uploadedBy} · ${fmtDate(e.uploadedAt, lang)}`,
      `   sha-256: ${e.digest}`,
      '',
    );
  });

  push(
    line(),
    raised.length > 0 ? t('5. SIGN-OFF', '5. الاعتماد') : t('4. SIGN-OFF', '4. الاعتماد'),
    line(),
    `${t('Approved by', 'اعتمده')}: ${signer ? (ar ? signer.name.ar : signer.name.en) : signedBy}`,
    `${t('Title', 'المسمى')}: ${signer ? (ar ? signer.title.ar : signer.title.en) : '—'}`,
    `${t('Institution', 'المنشأة')}: ${ar ? tenant.name.ar : tenant.name.en}`,
    sentAt ? `${t('Sent', 'أُرسل')}: ${fmtDate(sentAt, lang)}` : t('Not sent yet', 'لم يُرسل بعد'),
    '',
    t(
      'Prepared with Taameem. The AI proposed; a person decided on every line above.',
      'أُعد باستخدام تعميم. اقترح الذكاء الاصطناعي، وقرّر الإنسان في كل سطر أعلاه.',
    ),
    '',
  );

  return out.join('\n');
}

/** The evidence register on its own, as a spreadsheet the regulator can open. */
export function buildEvidenceCsv(evidence: Evidence[], tasks: Task[]): string {
  const rows = [
    ['evidence_id', 'file_name', 'kind', 'size_kb', 'task_id', 'task_title_en', 'uploaded_by', 'uploaded_at', 'sha256', 'verified'],
    ...evidence.map((e) => {
      const task = tasks.find((x) => x.id === e.taskId);
      const person = byId(e.uploadedBy);
      return [
        e.id,
        e.fileName,
        e.kind,
        String(e.sizeKb),
        e.taskId,
        task?.title.en ?? '',
        person?.name.en ?? e.uploadedBy,
        e.uploadedAt,
        e.digest,
        e.verified ? 'yes' : 'no',
      ];
    }),
  ];
  return rows
    .map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(','))
    .join('\n');
}

/** Hands the browser a file. Works offline, since nothing leaves the page. */
export function download(name: string, text: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([`﻿${text}`], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
