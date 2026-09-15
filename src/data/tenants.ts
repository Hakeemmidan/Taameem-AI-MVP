import type { Bi, RegulatorId } from '@/lib/types';

/**
 * A bank, an insurer and a capital market institution do not answer to the same
 * regulator, do not run the same systems and do not hold the same policies.
 * Each one is a separate account with its own people, and nothing crosses over.
 */
export type SectorId = 'bank' | 'insurance' | 'capital';

export interface Sector {
  id: SectorId;
  name: Bi;
  /** the regulator that licenses this sector */
  primary: RegulatorId;
  /** how many of these exist in the Kingdom, and where the count comes from */
  population: number;
  populationNote: Bi;
}

export const SECTORS: Sector[] = [
  {
    id: 'bank',
    name: { en: 'Banks and finance companies', ar: 'البنوك وشركات التمويل' },
    primary: 'sama',
    population: 39,
    populationNote: {
      en: 'Local banks and licensed foreign branches on the Saudi Central Bank register.',
      ar: 'البنوك المحلية وفروع البنوك الأجنبية المرخصة في سجل البنك المركزي السعودي.',
    },
  },
  {
    id: 'insurance',
    name: { en: 'Insurance and reinsurance', ar: 'التأمين وإعادة التأمين' },
    primary: 'ia',
    population: 25,
    populationNote: {
      en: 'Companies supervised by the Insurance Authority, which took over insurance supervision from SAMA in 2023.',
      ar: 'الشركات الخاضعة لهيئة التأمين التي تولت الإشراف على القطاع من البنك المركزي في 2023.',
    },
  },
  {
    id: 'capital',
    name: { en: 'Capital market institutions', ar: 'مؤسسات السوق المالية' },
    primary: 'cma',
    population: 215,
    populationNote: {
      en: 'Licensed capital market institutions at the end of 2025, after 32 new licences that year (CMA annual report 2025).',
      ar: 'مؤسسات السوق المالية المرخصة بنهاية 2025 بعد 32 ترخيصاً جديداً خلال العام (التقرير السنوي لهيئة السوق المالية 2025).',
    },
  },
];

export const sectorById = (id: SectorId) => SECTORS.find((s) => s.id === id)!;

export interface Tenant {
  id: string;
  sector: SectorId;
  name: Bi;
  shortName: Bi;
  licence: Bi;
  /** every regulator this institution actually answers to */
  regulators: RegulatorId[];
  city: Bi;
  staff: number;
  founded: string;
  cr: string;
  /** branches for a bank, points of sale for an insurer, none for a broker */
  network?: Bi;
  hue: number;
  /** what the institution does, in one line */
  activity: Bi;
}

export const TENANTS: Tenant[] = [
  {
    id: 'TN-BANK',
    sector: 'bank',
    name: { en: 'Innovation Bank', ar: 'بنك الابتكار' },
    shortName: { en: 'Innovation Bank', ar: 'بنك الابتكار' },
    licence: { en: 'Licensed bank · Saudi Central Bank', ar: 'بنك مرخص · البنك المركزي السعودي' },
    regulators: ['sama', 'sdaia', 'nca'],
    city: { en: 'Riyadh', ar: 'الرياض' },
    staff: 2840,
    founded: '1998',
    cr: '1010XXXXXX',
    network: { en: '46 branches', ar: '46 فرعاً' },
    hue: 200,
    activity: {
      en: 'Retail and corporate banking, cards and payments.',
      ar: 'الخدمات المصرفية للأفراد والشركات والبطاقات والمدفوعات.',
    },
  },
  {
    id: 'TN-INS',
    sector: 'insurance',
    name: { en: 'Sahaab Cooperative Insurance', ar: 'سحاب للتأمين التعاوني' },
    shortName: { en: 'Sahaab Insurance', ar: 'سحاب للتأمين' },
    licence: { en: 'Licensed insurer · Insurance Authority', ar: 'شركة تأمين مرخصة · هيئة التأمين' },
    regulators: ['ia', 'sdaia', 'nca'],
    city: { en: 'Jeddah', ar: 'جدة' },
    staff: 610,
    founded: '2009',
    cr: '4030XXXXXX',
    network: { en: '18 points of sale', ar: '18 نقطة بيع' },
    hue: 32,
    activity: {
      en: 'Motor, medical and property insurance for individuals and companies.',
      ar: 'تأمين المركبات والتأمين الصحي وتأمين الممتلكات للأفراد والشركات.',
    },
  },
  {
    id: 'TN-CAP',
    sector: 'capital',
    name: { en: 'Rawda Capital', ar: 'روضة كابيتال' },
    shortName: { en: 'Rawda Capital', ar: 'روضة كابيتال' },
    licence: { en: 'Capital market institution · CMA', ar: 'مؤسسة سوق مالية · هيئة السوق المالية' },
    regulators: ['cma', 'sdaia', 'nca'],
    city: { en: 'Riyadh', ar: 'الرياض' },
    staff: 180,
    founded: '2015',
    cr: '1010XXXXXX',
    network: { en: 'Head office only', ar: 'المركز الرئيسي فقط' },
    hue: 268,
    activity: {
      en: 'Dealing, managing, advising and custody for institutional and qualified clients.',
      ar: 'التعامل والإدارة وتقديم المشورة والحفظ للعملاء المؤسسيين والمؤهلين.',
    },
  },
];

export const tenantById = (id: string) => TENANTS.find((t) => t.id === id)!;
export const tenantsInSector = (s: SectorId) => TENANTS.filter((t) => t.sector === s);

/* --------------------------------------------------------------- roles */

export type RoleId = 'cco' | 'manager' | 'officer' | 'dept_head' | 'auditor' | 'platform';

export interface Role {
  id: RoleId;
  name: Bi;
  /** one line: what this person is allowed to do */
  scope: Bi;
  can: {
    reviewObligations: boolean;
    approveObligations: boolean;
    assignTasks: boolean;
    uploadEvidence: boolean;
    sendToRegulator: boolean;
    runInspection: boolean;
    editPolicies: boolean;
    /** a department head only ever sees their own department */
    ownDepartmentOnly: boolean;
  };
}

export const ROLES: Role[] = [
  {
    id: 'cco',
    name: { en: 'Chief Compliance Officer', ar: 'رئيس إدارة الالتزام' },
    scope: {
      en: 'Full access. The only role that may send a report to the regulator.',
      ar: 'صلاحية كاملة. الدور الوحيد الذي يجوز له إرسال تقرير إلى الجهة الرقابية.',
    },
    can: { reviewObligations: true, approveObligations: true, assignTasks: true, uploadEvidence: true, sendToRegulator: true, runInspection: true, editPolicies: true, ownDepartmentOnly: false },
  },
  {
    id: 'manager',
    name: { en: 'Compliance Manager', ar: 'مدير الالتزام' },
    scope: {
      en: 'Reviews and approves obligations, assigns tasks, runs the self-inspection.',
      ar: 'يراجع الالتزامات ويعتمدها ويوزع المهام ويشغّل التفتيش الذاتي.',
    },
    can: { reviewObligations: true, approveObligations: true, assignTasks: true, uploadEvidence: true, sendToRegulator: false, runInspection: true, editPolicies: true, ownDepartmentOnly: false },
  },
  {
    id: 'officer',
    name: { en: 'Compliance Officer', ar: 'أخصائي التزام' },
    scope: {
      en: 'Reviews extractions and prepares them, but cannot give final approval.',
      ar: 'يراجع الاستخراجات ويجهزها، دون صلاحية الاعتماد النهائي.',
    },
    can: { reviewObligations: true, approveObligations: false, assignTasks: false, uploadEvidence: true, sendToRegulator: false, runInspection: true, editPolicies: false, ownDepartmentOnly: false },
  },
  {
    id: 'dept_head',
    name: { en: 'Department Head', ar: 'رئيس إدارة' },
    scope: {
      en: 'Sees only their own department: its tasks and the evidence it must return.',
      ar: 'يرى إدارته فقط: مهامها والأدلة المطلوبة منها.',
    },
    can: { reviewObligations: false, approveObligations: false, assignTasks: false, uploadEvidence: true, sendToRegulator: false, runInspection: false, editPolicies: false, ownDepartmentOnly: true },
  },
  {
    id: 'auditor',
    name: { en: 'Internal Auditor', ar: 'مراجع داخلي' },
    scope: {
      en: 'Read-only across the institution, including the full audit trail.',
      ar: 'اطلاع فقط على كامل المنشأة، بما في ذلك سجل التدقيق.',
    },
    can: { reviewObligations: false, approveObligations: false, assignTasks: false, uploadEvidence: false, sendToRegulator: false, runInspection: true, editPolicies: false, ownDepartmentOnly: false },
  },
  {
    id: 'platform',
    name: { en: 'Taameem Platform Admin', ar: 'مشرف منصة تعميم' },
    scope: {
      en: 'Our own team. Regulatory sources, extraction quality and client health — never a client’s data.',
      ar: 'فريقنا. مصادر الأنظمة وجودة الاستخراج وحالة العملاء، دون الوصول إلى بيانات أي عميل.',
    },
    can: { reviewObligations: false, approveObligations: false, assignTasks: false, uploadEvidence: false, sendToRegulator: false, runInspection: false, editPolicies: false, ownDepartmentOnly: false },
  },
];

export const roleById = (id: RoleId) => ROLES.find((r) => r.id === id)!;
