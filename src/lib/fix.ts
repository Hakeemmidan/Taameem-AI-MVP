import type { Bi, Finding, Task } from '@/lib/types';
import { dept, headOf } from '@/data/org';
import { regulatorById } from '@/data/regulators';
import { DEMO_TODAY } from '@/lib/utils';

/** Gregorian to a close-enough Hijri, only ever shown beside the real date. */
const hijri = (d: Date) => {
  const days = Math.floor((d.getTime() - new Date('1948-07-16').getTime()) / 86_400_000);
  const total = Math.floor(days / 29.530588) + 1367 * 12 + 4;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const day = Math.max(1, Math.min(29, Math.round(((days / 29.530588) % 1) * 29) + 1));
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
};

const bi = (en: string, ar: string): Bi => ({ en, ar });

/**
 * Turns a self-inspection finding into the task that closes it. The owner, the
 * date and the proof all come from the finding itself, so nothing here is a
 * guess: the inspector's own question becomes the evidence to hand back.
 */
export function taskFromFinding(finding: Finding, tenantId: string): Task {
  const owner = headOf(tenantId, finding.ownerDept);
  const d = dept(tenantId, finding.ownerDept);
  const reg = regulatorById(finding.regulator);

  const due = new Date(DEMO_TODAY.getTime() + finding.fixWithinDays * 86_400_000);
  const dueIso = due.toISOString().slice(0, 10);

  const area = finding.area;
  const deptName = d?.name ?? bi(finding.ownerDept, finding.ownerDept);

  return {
    id: `TSK-${finding.id}`,
    tenantId,
    // raised by an inspection, not by a letter, so it belongs to no obligation
    obligationId: '',
    title: bi(`Close the finding: ${area.en}`, `إغلاق الملاحظة: ${area.ar}`),
    detail: bi(
      `${finding.statement.en} Raised by the self-inspection against ${reg.name.en}.`,
      `${finding.statement.ar} صدرت عن التفتيش الذاتي مقابل ${reg.name.ar}.`,
    ),
    dept: finding.ownerDept,
    assigneeId: owner?.id ?? '',
    due: dueIso,
    hijri: hijri(due),
    status: 'sent',
    expectedEvidence: bi(
      `Exactly what the inspector asks for: ${finding.inspectorWouldAsk.en}`,
      `ما يطلبه المفتش بالضبط: ${finding.inspectorWouldAsk.ar}`,
    ),
    steps: [
      bi(
        `Read the finding with ${deptName.en} and agree what is in scope and what is not.`,
        `اقرأ الملاحظة مع ${deptName.ar} واتفقوا على ما يدخل في النطاق وما لا يدخل.`,
      ),
      bi(
        'Write down the gap as one sentence: where we are today, and where the rule puts us.',
        'اكتب الفجوة في جملة واحدة: أين نحن اليوم، وأين تضعنا القاعدة.',
      ),
      bi(
        `Do the fix inside ${finding.fixWithinDays} days, which is the window this finding carries.`,
        `نفّذ الإصلاح خلال ${finding.fixWithinDays} يوماً، وهي المدة التي تحملها هذه الملاحظة.`,
      ),
      bi(
        'Produce the record the inspector would ask to see, dated and signed by its owner.',
        'أنتج السجل الذي سيطلب المفتش رؤيته، مؤرخاً وموقعاً من مالكه.',
      ),
      bi(
        'Upload that record to the evidence vault against this task so the fingerprint is sealed.',
        'ارفع ذلك السجل إلى خزانة الأدلة على هذه المهمة لتُختم بصمته.',
      ),
      bi(
        'Tell Compliance it is closed, and the finding drops out of the next inspection.',
        'أبلغ إدارة الالتزام بالإغلاق، فتسقط الملاحظة من التفتيش القادم.',
      ),
    ],
  };
}
