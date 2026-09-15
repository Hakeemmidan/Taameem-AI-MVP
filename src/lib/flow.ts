import type { Bi } from '@/lib/types';

/**
 * The seven steps the product is built around. Every workspace page belongs to
 * exactly one of them, so a person can always see where they are and what
 * happens next without being told.
 */
export type FlowKey = 'arrive' | 'read' | 'approve' | 'change' | 'assign' | 'prove' | 'report';

export interface FlowStep {
  n: number;
  key: FlowKey;
  href: string;
  /** lucide icon name, resolved in the component */
  icon: 'Inbox' | 'FileSearch' | 'UserCheck' | 'GitCompareArrows' | 'Send' | 'FolderLock' | 'FileCheck2';
  title: Bi;
  /** one line: what actually happens in this step */
  what: Bi;
  /** the question this step answers */
  asks: Bi;
  /** who does it */
  who: Bi;
}

export const FLOW: FlowStep[] = [
  {
    n: 1,
    key: 'arrive',
    href: '/institution/announcements',
    icon: 'Inbox',
    title: { en: 'The letter arrives', ar: 'وصول التعميم' },
    what: {
      en: 'Taameem watches the regulators every morning and pulls in what is new. A letter sent only to you is uploaded by hand.',
      ar: 'يراقب تعميم مواقع الجهات الرقابية كل صباح ويسحب الجديد. والخطاب الموجّه لكم وحدكم يُرفع يدوياً.',
    },
    asks: { en: 'What was issued, and does it bind us?', ar: 'ماذا صدر، وهل يلزمنا؟' },
    who: { en: 'Taameem', ar: 'تعميم' },
  },
  {
    n: 2,
    key: 'read',
    href: '/institution/announcements',
    icon: 'FileSearch',
    title: { en: 'The AI reads it', ar: 'الذكاء الاصطناعي يقرأه' },
    what: {
      en: 'It reads the Arabic, checks the official sources to confirm what it replaces, and pulls out every rule with its own sentence attached.',
      ar: 'يقرأ النص العربي، ويتحقق من المصادر الرسمية مما يحل محله، ويستخرج كل قاعدة مع جملتها الأصلية.',
    },
    asks: { en: 'What exactly does it require?', ar: 'ما الذي يتطلبه بالضبط؟' },
    who: { en: 'Taameem AI', ar: 'ذكاء تعميم' },
  },
  {
    n: 3,
    key: 'approve',
    href: '/institution/obligations',
    icon: 'UserCheck',
    title: { en: 'A person approves', ar: 'شخص يعتمده' },
    what: {
      en: 'Nothing enters the register until a compliance officer accepts or rejects each rule. The decision is logged with their name.',
      ar: 'لا يدخل السجل شيء حتى يقبل موظف الالتزام كل قاعدة أو يرفضها. ويُسجَّل القرار باسمه.',
    },
    asks: { en: 'Do we accept this reading?', ar: 'هل نقبل هذه القراءة؟' },
    who: { en: 'Compliance', ar: 'إدارة الالتزام' },
  },
  {
    n: 4,
    key: 'change',
    href: '/institution/obligations',
    icon: 'GitCompareArrows',
    title: { en: 'What must change', ar: 'ما الذي يجب تغييره' },
    what: {
      en: 'Each approved rule is laid against your own policy clause, system screen and procedure, so the gap is a specific line, not a feeling.',
      ar: 'تُقابَل كل قاعدة معتمدة ببند سياستكم وشاشة نظامكم وإجرائكم، فتصبح الفجوة سطراً محدداً لا انطباعاً.',
    },
    asks: { en: 'Where are we today, and where must we be?', ar: 'أين نحن اليوم، وأين يجب أن نكون؟' },
    who: { en: 'Taameem AI', ar: 'ذكاء تعميم' },
  },
  {
    n: 5,
    key: 'assign',
    href: '/institution/tasks',
    icon: 'Send',
    title: { en: 'Tasks reach the teams', ar: 'المهام تصل للإدارات' },
    what: {
      en: 'Every gap becomes a task with a named owner, a deadline in both calendars, and numbered instructions the owner can start on without calling Compliance.',
      ar: 'تتحول كل فجوة إلى مهمة بمسؤول بالاسم وموعد بالتقويمين وتعليمات مرقّمة يبدأ بها دون أن يتصل بالالتزام.',
    },
    asks: { en: 'Who does what, and by when?', ar: 'من يفعل ماذا، ومتى؟' },
    who: { en: 'The owning departments', ar: 'الإدارات المالكة' },
  },
  {
    n: 6,
    key: 'prove',
    href: '/institution/evidence',
    icon: 'FolderLock',
    title: { en: 'Proof is collected', ar: 'جمع الإثبات' },
    what: {
      en: 'The department hands back the file the rule asks for. It is sealed with a fingerprint at upload, so it is provably the same file later.',
      ar: 'تسلّم الإدارة الملف الذي تطلبه القاعدة، ويُختم ببصمة عند الرفع فيثبت لاحقاً أنه الملف نفسه.',
    },
    asks: { en: 'Can we show it was done?', ar: 'هل نستطيع إثبات أنه نُفّذ؟' },
    who: { en: 'The owning departments', ar: 'الإدارات المالكة' },
  },
  {
    n: 7,
    key: 'report',
    href: '/institution/report',
    icon: 'FileCheck2',
    title: { en: 'The report goes out', ar: 'التقرير يخرج' },
    what: {
      en: 'One report: the rule, what changed, who approved it and the sealed proof behind it. A person reads it, approves it and sends it.',
      ar: 'تقرير واحد: القاعدة، وما تغيّر، ومن اعتمده، والدليل المختوم خلفه. يقرأه شخص ويعتمده ويرسله.',
    },
    asks: { en: 'What do we tell the regulator?', ar: 'ماذا نقول للجهة الرقابية؟' },
    who: { en: 'Chief Compliance Officer', ar: 'رئيس إدارة الالتزام' },
  },
];

export const stepOf = (key: FlowKey) => FLOW.find((s) => s.key === key)!;

/** Where a workspace page sits in the journey, for the bar at the top of it. */
export const STEP_FOR_PATH: Record<string, FlowKey> = {
  '/institution/announcements': 'read',
  '/institution/obligations': 'approve',
  '/institution/tasks': 'assign',
  '/institution/evidence': 'prove',
  '/institution/report': 'report',
};
