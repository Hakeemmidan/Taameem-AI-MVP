import type { Bi, RegulatorId } from '@/lib/types';
import { libraryStats } from '@/data/policies';
import { systemsOf } from '@/data/systems';
import { departmentsOf, peopleOf } from '@/data/org';
import { OBLIGATIONS } from '@/data/obligations';
import { RULES_BY_REGULATOR, findingsOf, inspectionSummary } from '@/data/work';

/** One line printed into the run log. `at` is milliseconds from the phase start. */
export interface RunLine {
  at: number;
  text: Bi;
  tone?: 'ok' | 'muted' | 'warn' | 'active';
}

export interface SearchHit {
  domain: string;
  title: Bi;
  snippet: Bi;
}

/** A phase renders as a step in the rail; the search block only appears if present. */
export interface RunPhase {
  key: string;
  label: Bi;
  icon: 'read' | 'search' | 'match' | 'draft' | 'check';
  ms: number;
  lines: RunLine[];
  search?: { query: Bi; hits: { at: number; hit: SearchHit }[] };
}

const bi = (en: string, ar: string): Bi => ({ en, ar });

/* ==================================================== bank extraction ==== */

/**
 * The extraction run for SAMA/BC/2026/41. Timings are tuned so a person
 * watching can actually read each line before the next one lands.
 */
const BANK_EXTRACTION: RunPhase[] = [
  {
    key: 'read',
    icon: 'read',
    label: bi('Reading the announcement', 'قراءة التعميم'),
    ms: 4200,
    lines: [
      { at: 200, text: bi('Opening SAMA_BC_2026_41 … 9 pages', 'فتح الملف SAMA_BC_2026_41 … 9 صفحات'), tone: 'muted' },
      { at: 900, text: bi('Language detected: Arabic · legal register', 'اللغة: العربية · صياغة نظامية'), tone: 'ok' },
      { at: 1700, text: bi('Layout parsed: 1 preamble, 10 articles, 2 annexes', 'تحليل البنية: مقدمة و10 مواد وملحقان'), tone: 'ok' },
      { at: 2600, text: bi('Reading article 3 (a) … "خمسة أيام عمل"', 'قراءة المادة الثالثة (أ) … «خمسة أيام عمل»'), tone: 'active' },
      { at: 3500, text: bi('12 candidate rules isolated from 10 articles', 'عزل 12 قاعدة مرشحة من 10 مواد'), tone: 'ok' },
    ],
  },
  {
    key: 'search',
    icon: 'search',
    label: bi('Checking the official sources', 'التحقق من المصادر الرسمية'),
    ms: 6000,
    lines: [
      { at: 200, text: bi('Confirming this supersedes the first edition…', 'التأكد من أنه يحل محل الإصدار الأول…'), tone: 'muted' },
      { at: 4600, text: bi('Confirmed: first edition (1445H) superseded', 'مؤكد: الإصدار الأول (1445هـ) مُلغى'), tone: 'ok' },
      { at: 5300, text: bi('Effective date resolved: 60 days → 11 Nov 2026', 'تاريخ السريان: 60 يوماً → 11 نوفمبر 2026'), tone: 'ok' },
    ],
    search: {
      query: bi('SAMA customer complaints instructions second edition 2026', 'تعليمات معالجة شكاوى العملاء الإصدار الثاني ساما 2026'),
      hits: [
        {
          at: 900,
          hit: {
            domain: 'sama.gov.sa',
            title: bi('Instructions for Handling Customer Complaints — 2nd edition', 'تعليمات معالجة شكاوى العملاء — الإصدار الثاني'),
            snippet: bi('Published 12 Sep 2026 · supersedes the edition issued in 1445H · applies to banks, finance companies and PSPs.', 'نُشر في 12 سبتمبر 2026 · يحل محل الإصدار الصادر في 1445هـ · يسري على البنوك وشركات التمويل ومقدمي خدمات المدفوعات.'),
          },
        },
        {
          at: 1900,
          hit: {
            domain: 'sama.gov.sa',
            title: bi('Consumer Protection Principles — complaint handling', 'مبادئ حماية العملاء — معالجة الشكاوى'),
            snippet: bi('Principle 6: complaints shall be handled fairly, promptly and free of charge.', 'المبدأ السادس: تُعالج الشكاوى بعدالة وسرعة ودون رسوم.'),
          },
        },
        {
          at: 2900,
          hit: {
            domain: 'laws.boe.gov.sa',
            title: bi('Banking Control Law — supervisory powers', 'نظام مراقبة البنوك — الصلاحيات الإشرافية'),
            snippet: bi('Article 16: the Central Bank may issue rules binding on licensed banks.', 'المادة 16: للبنك المركزي إصدار قواعد ملزمة للبنوك المرخصة.'),
          },
        },
        {
          at: 3800,
          hit: {
            domain: 'sama.gov.sa',
            title: bi('Complaint handling statistics — Q2 2026', 'إحصاءات معالجة الشكاوى — الربع الثاني 2026'),
            snippet: bi('Sector average handling time reported at 7.4 working days.', 'متوسط مدة المعالجة في القطاع 7.4 أيام عمل.'),
          },
        },
      ],
    },
  },
  {
    key: 'match',
    icon: 'match',
    label: bi('Matching against your policies', 'المطابقة مع سياساتكم'),
    ms: 5200,
    lines: [
      { at: 300, text: bi('Loading the policy library: 8 policies, 134 clauses', 'تحميل مكتبة السياسات: 8 سياسات و134 بنداً'), tone: 'muted' },
      { at: 1200, text: bi('POL-CMP 5.2 — "ten working days" ← conflicts with article 3 (a)', 'POL-CMP 5-2 — «عشرة أيام عمل» ← يتعارض مع المادة 3 (أ)'), tone: 'warn' },
      { at: 2200, text: bi('POL-CMP 7.2 — already aligned with article 5', 'POL-CMP 7-2 — متوافق أصلاً مع المادة 5'), tone: 'ok' },
      { at: 3100, text: bi('SYS-02 Sanad — no per-complaint working-day counter', 'SYS-02 سند — لا يوجد عدّاد أيام عمل لكل شكوى'), tone: 'warn' },
      { at: 4000, text: bi('SYS-05, SYS-06, SYS-07 — 5 customer texts still say ten days', 'SYS-05 و06 و07 — 5 نصوص للعميل ما زالت تذكر عشرة أيام'), tone: 'warn' },
      { at: 4700, text: bi('Owners resolved from the org chart: 6 departments', 'تحديد المسؤولين من الهيكل التنظيمي: 6 إدارات'), tone: 'ok' },
    ],
  },
  {
    key: 'draft',
    icon: 'draft',
    label: bi('Drafting what must change', 'صياغة ما يجب تغييره'),
    ms: 3600,
    lines: [
      { at: 300, text: bi('9 obligations written, each linked to its Arabic sentence', 'كتابة 9 التزامات، كل منها مرتبط بجملته العربية'), tone: 'ok' },
      { at: 1300, text: bi('17 mappings onto policies, systems and processes', '17 ارتباطاً بالسياسات والأنظمة والإجراءات'), tone: 'ok' },
      { at: 2300, text: bi('Suggested wording prepared for 4 policy clauses', 'إعداد صياغة مقترحة لأربعة بنود في السياسات'), tone: 'ok' },
      { at: 3100, text: bi('Nothing enters the register until you approve it', 'لا يدخل السجل شيء حتى تعتمده'), tone: 'active' },
    ],
  },
];

/* =============================================== insurance extraction ==== */

/** The extraction run for IA/CIR/2026/22, the motor claims circular. */
const INS_EXTRACTION: RunPhase[] = [
  {
    key: 'read',
    icon: 'read',
    label: bi('Reading the circular', 'قراءة التعميم'),
    ms: 4200,
    lines: [
      { at: 200, text: bi('Opening IA_CIR_2026_22 … 7 pages, scanned', 'فتح الملف IA_CIR_2026_22 … 7 صفحات ممسوحة ضوئياً'), tone: 'muted' },
      { at: 900, text: bi('Scanned pages read · Arabic · legal register', 'قراءة الصفحات الممسوحة · العربية · صياغة نظامية'), tone: 'ok' },
      { at: 1700, text: bi('Layout parsed: 1 preamble, 8 articles', 'تحليل البنية: مقدمة و8 مواد'), tone: 'ok' },
      { at: 2600, text: bi('Reading article 2 (a) … "عشرة أيام عمل"', 'قراءة المادة الثانية (أ) … «عشرة أيام عمل»'), tone: 'active' },
      { at: 3500, text: bi('9 candidate rules isolated from 8 articles', 'عزل 9 قواعد مرشحة من 8 مواد'), tone: 'ok' },
    ],
  },
  {
    key: 'search',
    icon: 'search',
    label: bi('Checking the official sources', 'التحقق من المصادر الرسمية'),
    ms: 6000,
    lines: [
      { at: 200, text: bi('Confirming the circular is in force…', 'التأكد من سريان التعميم…'), tone: 'muted' },
      { at: 4600, text: bi('Confirmed: shortens the period in the 2023 circular', 'مؤكد: يختصر المدة الواردة في تعميم 2023'), tone: 'ok' },
      { at: 5300, text: bi('Effective date resolved: 60 days → 9 Nov 2026', 'تاريخ السريان: 60 يوماً → 9 نوفمبر 2026'), tone: 'ok' },
    ],
    search: {
      query: bi('Insurance Authority motor claims settlement period circular 2026', 'تعميم هيئة التأمين مدد تسوية مطالبات المركبات 2026'),
      hits: [
        {
          at: 900,
          hit: {
            domain: 'ia.gov.sa',
            title: bi('Motor Claims Settlement Periods and Notification', 'مدد تسوية مطالبات المركبات والإشعار'),
            snippet: bi('Published 10 Sep 2026 · applies to insurers writing motor business and their claims service providers.', 'نُشر في 10 سبتمبر 2026 · يسري على شركات تأمين المركبات ومزودي خدمات المطالبات لديها.'),
          },
        },
        {
          at: 1900,
          hit: {
            domain: 'ia.gov.sa',
            title: bi('Unified Compulsory Motor Insurance Policy', 'وثيقة التأمين الإلزامي الموحدة للمركبات'),
            snippet: bi('Sets the minimum cover and the claimant’s rights on a motor claim.', 'تحدد الحد الأدنى للتغطية وحقوق المطالب في مطالبات المركبات.'),
          },
        },
        {
          at: 2900,
          hit: {
            domain: 'laws.boe.gov.sa',
            title: bi('Insurance Authority Law — supervisory powers', 'نظام هيئة التأمين — الصلاحيات الإشرافية'),
            snippet: bi('The Authority supervises the insurance sector and issues binding circulars.', 'تشرف الهيئة على قطاع التأمين وتصدر التعاميم الملزمة.'),
          },
        },
        {
          at: 3800,
          hit: {
            domain: 'ia.gov.sa',
            title: bi('Insurance market report — claims settlement times', 'تقرير سوق التأمين — مدد تسوية المطالبات'),
            snippet: bi('Market average settlement time for motor reported at 12.6 working days.', 'متوسط مدة تسوية مطالبات المركبات في السوق 12.6 يوم عمل.'),
          },
        },
      ],
    },
  },
  {
    key: 'match',
    icon: 'match',
    label: bi('Matching against your policies', 'المطابقة مع سياساتكم'),
    ms: 5200,
    lines: [
      { at: 300, text: bi('Loading the policy library: 5 policies, 84 clauses', 'تحميل مكتبة السياسات: 5 سياسات و84 بنداً'), tone: 'muted' },
      { at: 1200, text: bi('POL-CLM 2.1 — "fifteen working days" ← conflicts with article 2 (a)', 'POL-CLM 2-1 — «خمسة عشر يوم عمل» ← يتعارض مع المادة 2 (أ)'), tone: 'warn' },
      { at: 2200, text: bi('POL-CLM 2.4 — partial payment permitted, not required', 'POL-CLM 2-4 — الدفع الجزئي جائز وغير ملزم'), tone: 'warn' },
      { at: 3100, text: bi('ISY-02 claims system — no per-claim working-day counter', 'ISY-02 نظام المطالبات — لا يوجد عدّاد أيام عمل لكل مطالبة'), tone: 'warn' },
      { at: 4000, text: bi('ISY-05 — CLM-ACK-01 sends the claim number with no period', 'ISY-05 — قالب CLM-ACK-01 يرسل رقم المطالبة دون ذكر المدة'), tone: 'warn' },
      { at: 4700, text: bi('Owners resolved from the org chart: 5 departments', 'تحديد المسؤولين من الهيكل التنظيمي: 5 إدارات'), tone: 'ok' },
    ],
  },
  {
    key: 'draft',
    icon: 'draft',
    label: bi('Drafting what must change', 'صياغة ما يجب تغييره'),
    ms: 3600,
    lines: [
      { at: 300, text: bi('7 obligations written, each linked to its Arabic sentence', 'كتابة 7 التزامات، كل منها مرتبط بجملته العربية'), tone: 'ok' },
      { at: 1300, text: bi('14 mappings onto policies, systems and processes', '14 ارتباطاً بالسياسات والأنظمة والإجراءات'), tone: 'ok' },
      { at: 2300, text: bi('Suggested wording prepared for 3 policy clauses', 'إعداد صياغة مقترحة لثلاثة بنود في السياسات'), tone: 'ok' },
      { at: 3100, text: bi('Nothing enters the register until you approve it', 'لا يدخل السجل شيء حتى تعتمده'), tone: 'active' },
    ],
  },
];

/* ========================================== capital market extraction ==== */

/** The extraction run for CMA/RES/2026/3-6, the market conduct amendments. */
const CAP_EXTRACTION: RunPhase[] = [
  {
    key: 'read',
    icon: 'read',
    label: bi('Reading the resolution', 'قراءة القرار'),
    ms: 4200,
    lines: [
      { at: 200, text: bi('Opening CMA_RES_2026_3-6 … 14 pages', 'فتح الملف CMA_RES_2026_3-6 … 14 صفحة'), tone: 'muted' },
      { at: 900, text: bi('Language detected: Arabic · legal register', 'اللغة: العربية · صياغة نظامية'), tone: 'ok' },
      { at: 1700, text: bi('Layout parsed: 1 preamble, 8 articles, marked-up annex', 'تحليل البنية: مقدمة و8 مواد وملحق بالتعديلات'), tone: 'ok' },
      { at: 2600, text: bi('Reading article 2 … "يوم عمل واحد"', 'قراءة المادة الثانية … «يوم عمل واحد»'), tone: 'active' },
      { at: 3500, text: bi('8 candidate rules isolated from 8 articles', 'عزل 8 قواعد مرشحة من 8 مواد'), tone: 'ok' },
    ],
  },
  {
    key: 'search',
    icon: 'search',
    label: bi('Checking the official sources', 'التحقق من المصادر الرسمية'),
    ms: 6000,
    lines: [
      { at: 200, text: bi('Diffing against the regulations in force…', 'مقارنة بالنسخة السارية من اللائحة…'), tone: 'muted' },
      { at: 4600, text: bi('Confirmed: amends the Market Conduct Regulations', 'مؤكد: يعدّل لائحة سلوكيات السوق'), tone: 'ok' },
      { at: 5300, text: bi('Effective date resolved: 90 days → 7 Dec 2026', 'تاريخ السريان: 90 يوماً → 7 ديسمبر 2026'), tone: 'ok' },
    ],
    search: {
      query: bi('CMA market conduct regulations amendments insider list 2026', 'تعديلات لائحة سلوكيات السوق قائمة المطلعين هيئة السوق المالية 2026'),
      hits: [
        {
          at: 900,
          hit: {
            domain: 'cma.org.sa',
            title: bi('Board resolution — amendments to the Market Conduct Regulations', 'قرار المجلس — تعديلات لائحة سلوكيات السوق'),
            snippet: bi('Issued 8 Sep 2026 · in force 90 days after publication · applies to capital market institutions and listed companies.', 'صدر في 8 سبتمبر 2026 · يسري بعد 90 يوماً من النشر · على مؤسسات السوق المالية والشركات المدرجة.'),
          },
        },
        {
          at: 1900,
          hit: {
            domain: 'cma.org.sa',
            title: bi('Market Conduct Regulations — consolidated text', 'لائحة سلوكيات السوق — النص المجمّع'),
            snippet: bi('Manipulation, insider trading, insider lists and surveillance obligations.', 'التلاعب والتداول بناءً على معلومات داخلية وقوائم المطلعين والتزامات المراقبة.'),
          },
        },
        {
          at: 2900,
          hit: {
            domain: 'laws.boe.gov.sa',
            title: bi('Capital Market Law (M/30) — Authority powers', 'نظام السوق المالية (م/30) — صلاحيات الهيئة'),
            snippet: bi('The Authority may issue and amend regulations binding on market participants.', 'للهيئة إصدار اللوائح وتعديلها بما يلزم المتعاملين في السوق.'),
          },
        },
        {
          at: 3800,
          hit: {
            domain: 'cma.org.sa',
            title: bi('CMA annual report 2025 — licensed institutions', 'التقرير السنوي 2025 — المؤسسات المرخصة'),
            snippet: bi('215 licensed capital market institutions at the end of 2025, after 32 new licences that year.', '215 مؤسسة سوق مالية مرخصة بنهاية 2025 بعد 32 ترخيصاً جديداً خلال العام.'),
          },
        },
      ],
    },
  },
  {
    key: 'match',
    icon: 'match',
    label: bi('Matching against your policies', 'المطابقة مع سياساتكم'),
    ms: 5200,
    lines: [
      { at: 300, text: bi('Loading the policy library: 5 policies, 96 clauses', 'تحميل مكتبة السياسات: 5 سياسات و96 بنداً'), tone: 'muted' },
      { at: 1200, text: bi('POL-MKT 2.1 — "three working days" ← conflicts with article 2', 'POL-MKT 2-1 — «ثلاثة أيام عمل» ← يتعارض مع المادة 2'), tone: 'warn' },
      { at: 2200, text: bi('POL-MKT 1.4 — insider list exists, missing time and reason', 'POL-MKT 1-4 — قائمة المطلعين موجودة وينقصها الوقت والسبب'), tone: 'warn' },
      { at: 3100, text: bi('CSY-04 — insider list still held in a spreadsheet', 'CSY-04 — قائمة المطلعين ما زالت في ملف جداول'), tone: 'warn' },
      { at: 4000, text: bi('CSY-01 — voice captured, messaging channels are not', 'CSY-01 — الصوت مسجل وقنوات المراسلة غير مسجلة'), tone: 'warn' },
      { at: 4700, text: bi('Owners resolved from the org chart: 4 departments', 'تحديد المسؤولين من الهيكل التنظيمي: 4 إدارات'), tone: 'ok' },
    ],
  },
  {
    key: 'draft',
    icon: 'draft',
    label: bi('Drafting what must change', 'صياغة ما يجب تغييره'),
    ms: 3600,
    lines: [
      { at: 300, text: bi('6 obligations written, each linked to its Arabic sentence', 'كتابة 6 التزامات، كل منها مرتبط بجملته العربية'), tone: 'ok' },
      { at: 1300, text: bi('12 mappings onto policies, systems and processes', '12 ارتباطاً بالسياسات والأنظمة والإجراءات'), tone: 'ok' },
      { at: 2300, text: bi('Suggested wording prepared for 3 policy clauses', 'إعداد صياغة مقترحة لثلاثة بنود في السياسات'), tone: 'ok' },
      { at: 3100, text: bi('Nothing enters the register until you approve it', 'لا يدخل السجل شيء حتى تعتمده'), tone: 'active' },
    ],
  },
];

/**
 * The run that belongs to a particular letter, with the counts it quotes read
 * from this institution's own data rather than typed into the script.
 */
export const extractionRun = (announcementId: string, tenantId: string): RunPhase[] => {
  const base =
    announcementId === 'ANN-2026-0910' ? INS_EXTRACTION : announcementId === 'ANN-2026-0908' ? CAP_EXTRACTION : BANK_EXTRACTION;

  const stats = libraryStats(tenantId);
  const mine = OBLIGATIONS.filter((o) => o.tenantId === tenantId && o.announcementId === announcementId);
  const mappings = mine.reduce((n, o) => n + o.mappings.length, 0);
  const clauseEdits = mine.reduce((n, o) => n + o.mappings.filter((m) => m.kind === 'policy' && m.gap !== 'none').length, 0);

  const swap = (phase: RunPhase, at: number, text: Bi): RunPhase => ({
    ...phase,
    lines: phase.lines.map((l) => (l.at === at ? { ...l, text } : l)),
  });

  return base.map((p) => {
    if (p.key === 'match') {
      return swap(
        p,
        300,
        bi(
          `Loading the policy library: ${stats.policies} policies, ${stats.clauses} clauses`,
          `تحميل مكتبة السياسات: ${stats.policies} سياسة و${stats.clauses} بنداً`,
        ),
      );
    }
    if (p.key === 'draft') {
      const withCount = swap(
        p,
        300,
        bi(
          `${mine.length} obligations written, each linked to its Arabic sentence`,
          `كتابة ${mine.length} التزاماً، كل منها مرتبط بجملته العربية`,
        ),
      );
      const withMappings = swap(
        withCount,
        1300,
        bi(`${mappings} mappings onto policies, systems and processes`, `${mappings} ارتباطاً بالسياسات والأنظمة والإجراءات`),
      );
      return swap(
        withMappings,
        2300,
        bi(`Suggested wording prepared for ${clauseEdits} policy clauses`, `إعداد صياغة مقترحة لـ ${clauseEdits} بنود في السياسات`),
      );
    }
    return p;
  });
};
/* ==================================================== self-inspection ==== */

/**
 * The counts an institution's run quotes are read from the data, not typed
 * here, so the log can never claim a library size the product does not have.
 */
const facts = (tenantId: string) => {
  const stats = libraryStats(tenantId);
  const summary = inspectionSummary(tenantId);
  return {
    policies: stats.policies,
    clauses: stats.clauses,
    systems: systemsOf(tenantId).length,
    departments: departmentsOf(tenantId).length,
    people: peopleOf(tenantId).length,
    findings: findingsOf(tenantId).length,
    serious: findingsOf(tenantId).filter((f) => f.severity === 'high').length,
    split: RULES_BY_REGULATOR[tenantId] ?? [],
    ...summary,
  };
};

const REG_NAME: Record<RegulatorId, Bi> = {
  sama: bi('SAMA', 'ساما'),
  cma: bi('CMA', 'هيئة السوق المالية'),
  ia: bi('Insurance Authority', 'هيئة التأمين'),
  sdaia: bi('SDAIA', 'سدايا'),
  nca: bi('NCA', 'الهيئة الوطنية للأمن السيبراني'),
};

const HIT: Record<RegulatorId, SearchHit> = {
  sama: {
    domain: 'sama.gov.sa',
    title: bi('Regulatory rules and instructions — current index', 'القواعد والتعليمات الرقابية — الفهرس الساري'),
    snippet: bi('Banking, payments, consumer protection and AML instructions.', 'تعليمات البنوك والمدفوعات وحماية العملاء ومكافحة غسل الأموال.'),
  },
  ia: {
    domain: 'ia.gov.sa',
    title: bi('Insurance Authority circulars and regulations', 'تعاميم هيئة التأمين ولوائحها'),
    snippet: bi('Claims settlement, pricing controls, solvency and policyholder protection.', 'تسوية المطالبات وضوابط التسعير والملاءة وحماية حملة الوثائق.'),
  },
  cma: {
    domain: 'cma.org.sa',
    title: bi('Capital market regulations and rules', 'لوائح السوق المالية وقواعدها'),
    snippet: bi('Market conduct, client assets, conduct of business and AML rules.', 'سلوكيات السوق وأصول العملاء وقواعد ممارسة الأعمال ومكافحة غسل الأموال.'),
  },
  sdaia: {
    domain: 'sdaia.gov.sa',
    title: bi('Personal Data Protection Law — implementing regulations', 'نظام حماية البيانات الشخصية — اللوائح التنفيذية'),
    snippet: bi('Lawful basis, data subject rights, breach notification and cross-border transfer.', 'الأساس النظامي وحقوق أصحاب البيانات والإبلاغ عن الانتهاك والنقل خارج المملكة.'),
  },
  nca: {
    domain: 'nca.gov.sa',
    title: bi('Essential Cybersecurity Controls', 'الضوابط الأساسية للأمن السيبراني'),
    snippet: bi('Governance, access management, logging and third-party cybersecurity.', 'الحوكمة وإدارة الصلاحيات والتسجيل وأمن الأطراف الثالثة.'),
  },
};

/** The self-inspection run for one institution, built from its own numbers. */
export const inspectionRun = (tenantId: string): RunPhase[] => {
  const f = facts(tenantId);
  const watch = Math.max(0, f.findings - f.serious);

  return [
    {
      key: 'load',
      icon: 'read',
      label: bi('Loading your institution', 'تحميل بيانات منشأتكم'),
      ms: 2600,
      lines: [
        {
          at: 200,
          text: bi(
            `${f.policies} policies · ${f.clauses} clauses · ${f.systems} systems · ${f.proofsChecked} proofs`,
            `${f.policies} سياسات · ${f.clauses} بنداً · ${f.systems} نظاماً · ${f.proofsChecked} دليلاً`,
          ),
          tone: 'muted',
        },
        {
          at: 1200,
          text: bi(
            `Org chart loaded: ${f.departments} departments, ${f.people} named owners`,
            `الهيكل التنظيمي: ${f.departments} إدارة و${f.people} مسؤولاً بالاسم`,
          ),
          tone: 'ok',
        },
        { at: 2000, text: bi('Evidence vault opened, digests verified', 'فتح خزانة الأدلة والتحقق من البصمات'), tone: 'ok' },
      ],
    },
    {
      key: 'rules',
      icon: 'search',
      label: bi('Reading the rulebooks', 'قراءة كتب الأنظمة'),
      ms: 5200,
      lines: f.split.map((r, i) => ({
        at: 300 + i * 1500,
        text: bi(`${REG_NAME[r.regulator].en} · ${r.rules} rules in scope`, `${REG_NAME[r.regulator].ar} · ${r.rules} قاعدة ضمن النطاق`),
        tone: 'ok' as const,
      })),
      search: {
        query: bi(
          `${f.split.map((r) => REG_NAME[r.regulator].en).join(' ')} current rulebooks 2026`,
          `كتب الأنظمة السارية ${f.split.map((r) => REG_NAME[r.regulator].ar).join(' و')} 2026`,
        ),
        hits: f.split.map((r, i) => ({ at: 900 + i * 900, hit: HIT[r.regulator] })),
      },
    },
    {
      key: 'test',
      icon: 'check',
      label: bi('Testing each rule against your evidence', 'اختبار كل قاعدة مقابل أدلتكم'),
      ms: 5000,
      lines: [
        {
          at: 400,
          text: bi(
            `${f.rulesChecked} rules tested against ${f.clauses} clauses and ${f.proofsChecked} proofs`,
            `اختبار ${f.rulesChecked} قاعدة مقابل ${f.clauses} بنداً و${f.proofsChecked} دليلاً`,
          ),
          tone: 'muted',
        },
        { at: 1600, text: bi(`${f.inOrder} in order`, `${f.inOrder} سليمة`), tone: 'ok' },
        {
          at: 2600,
          text: bi(`${f.serious} findings an inspector would raise today`, `${f.serious} ملاحظات سيثيرها المفتش اليوم`),
          tone: 'warn',
        },
        {
          at: 3600,
          text: bi(`${watch} findings to watch inside 30 days`, `${watch} ملاحظات للمتابعة خلال 30 يوماً`),
          tone: 'warn',
        },
        { at: 4400, text: bi('Exposure estimated from published penalty ranges', 'تقدير التعرض من نطاقات الغرامات المنشورة'), tone: 'active' },
      ],
    },
  ];
};

export const totalMs = (phases: RunPhase[]) => phases.reduce((n, p) => n + p.ms, 0);
