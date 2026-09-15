import type { RunLine, RunPhase } from './script';
import type { ParsedDoc } from '@/lib/parse';

const bi = (en: string, ar: string) => ({ en, ar });
const n = (v: number) => v.toLocaleString('en-US');

/**
 * Reading a policy the institution just uploaded. Every line below quotes a
 * number measured from the file the person picked. When the file is not text
 * we say that plainly instead of printing a result we did not produce.
 */
export const ingestRun = (doc: ParsedDoc): RunPhase[] => {
  const pct = Math.round(doc.arabic * 100);

  const readLines: RunLine[] = [
    { at: 200, text: bi(`Opening ${doc.name} · ${n(doc.sizeKb)} KB`, `فتح ${doc.name} · ${n(doc.sizeKb)} كيلوبايت`), tone: 'muted' },
  ];

  if (!doc.readable) {
    readLines.push(
      {
        at: 1000,
        text: bi(
          `This is a ${doc.kind.toUpperCase()} file, not plain text.`,
          `هذا ملف ${doc.kind.toUpperCase()} وليس نصاً مقروءاً مباشرة.`,
        ),
        tone: 'warn',
      },
      {
        at: 1900,
        text: bi(
          'In production it goes through Arabic OCR first. In this demo we will not print numbers we did not read.',
          'في النسخة الإنتاجية يمر أولاً على التعرف الضوئي العربي. وفي هذه النسخة لا نطبع أرقاماً لم نقرأها.',
        ),
        tone: 'muted',
      },
      {
        at: 2700,
        text: bi('Pick a .md or .txt file to watch the real read.', 'اختر ملف .md أو .txt لترى القراءة الحقيقية.'),
        tone: 'active',
      },
    );
  } else {
    readLines.push(
      {
        at: 900,
        text: bi(`${n(doc.lines)} lines · ${n(doc.words)} words read`, `قراءة ${n(doc.lines)} سطراً · ${n(doc.words)} كلمة`),
        tone: 'ok',
      },
      {
        at: 1700,
        text: bi(
          `Language: ${pct}% Arabic, ${100 - pct}% Latin`,
          `اللغة: ${pct}% عربي · ${100 - pct}% لاتيني`,
        ),
        tone: 'ok',
      },
      doc.code
        ? {
            at: 2400,
            text: bi(
              `Header read: ${doc.code}${doc.version ? ` · v${doc.version}` : ''}${doc.owner ? ` · owner ${doc.owner}` : ''}`,
              `قراءة الترويسة: ${doc.code}${doc.version ? ` · الإصدار ${doc.version}` : ''}${doc.owner ? ` · المالك ${doc.owner}` : ''}`,
            ),
            tone: 'ok' as const,
          }
        : {
            at: 2400,
            text: bi('No policy header table found, indexing by content', 'لا يوجد جدول ترويسة، ستتم الفهرسة بالمحتوى'),
            tone: 'muted' as const,
          },
    );
  }

  const splitLines: RunLine[] = doc.readable
    ? [
        {
          at: 300,
          text: bi(
            `${n(doc.sections)} sections, ${n(doc.clauses)} numbered clauses identified`,
            `تحديد ${n(doc.sections)} أقسام و${n(doc.clauses)} بنداً مرقماً`,
          ),
          tone: doc.clauses > 0 ? 'ok' : 'warn',
        },
        {
          at: 1200,
          text: bi(
            `${n(doc.duties)} clauses carry a duty, ${n(doc.deadlines)} name a period`,
            `${n(doc.duties)} بنداً تحمل واجباً و${n(doc.deadlines)} تذكر مدة`,
          ),
          tone: 'ok',
        },
        {
          at: 2100,
          text: bi(
            doc.effective ? `Effective date read from the header: ${doc.effective}` : 'Each clause kept with its own reference',
            doc.effective ? `تاريخ السريان من الترويسة: ${doc.effective}` : 'حفظ كل بند برقمه المرجعي',
          ),
          tone: 'ok',
        },
      ]
    : [{ at: 400, text: bi('Nothing to split until the text is recovered.', 'لا يمكن التقسيم قبل استخراج النص.'), tone: 'muted' }];

  const indexLines: RunLine[] = doc.readable
    ? [
        {
          at: 300,
          text: bi(
            doc.tags.length ? `${n(doc.tags.length)} index tags extracted` : 'Index tags derived from the clause text',
            doc.tags.length ? `استخراج ${n(doc.tags.length)} وسماً للفهرسة` : 'اشتقاق وسوم الفهرسة من نص البنود',
          ),
          tone: 'ok',
        },
        {
          at: 1100,
          text: bi(
            doc.regulators.length
              ? `Filed under ${doc.regulators.join(', ')}`
              : 'Filed under the regulators this institution answers to',
            doc.regulators.length
              ? `الفهرسة تحت ${doc.regulators.join('، ')}`
              : 'الفهرسة تحت الجهات الرقابية التي تخضع لها المنشأة',
          ),
          tone: 'ok',
        },
        {
          at: 1900,
          text: bi('Added to the library · every new rule is now compared against it', 'أُضيفت إلى المكتبة · وستُقارن بها كل قاعدة جديدة'),
          tone: 'active',
        },
      ]
    : [
        {
          at: 400,
          text: bi('The file is stored, but it is not indexed yet.', 'حُفظ الملف دون فهرسة.'),
          tone: 'warn',
        },
      ];

  return [
    { key: 'read', icon: 'read', label: bi('Reading the file', 'قراءة الملف'), ms: 3400, lines: readLines },
    { key: 'split', icon: 'match', label: bi('Splitting into clauses', 'التقسيم إلى بنود'), ms: 3000, lines: splitLines },
    { key: 'index', icon: 'draft', label: bi('Indexing it', 'فهرستها'), ms: 2600, lines: indexLines },
  ];
};
