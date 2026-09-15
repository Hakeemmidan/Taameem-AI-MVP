import type { Bi, RegulatorId } from '@/lib/types';
import type { SectorId } from './tenants';

/** A page Taameem polls every morning for something new. */
export interface SourceWatch {
  id: string;
  regulator: RegulatorId;
  name: Bi;
  url: string;
  lastCheck: string;
  newItems: number;
  /** how the page is read: a feed, a listing page, or a scanned PDF drop */
  method: Bi;
}

export const SOURCE_WATCH: SourceWatch[] = [
  { id: 'SRC-01', regulator: 'sama', name: { en: 'Rules and instructions index', ar: 'فهرس القواعد والتعليمات' }, url: 'sama.gov.sa/ar-sa/Laws', lastCheck: '06:00', newItems: 1, method: { en: 'Listing page, daily diff', ar: 'صفحة فهرس، مقارنة يومية' } },
  { id: 'SRC-02', regulator: 'sama', name: { en: 'Circulars to banks', ar: 'التعاميم الموجهة للبنوك' }, url: 'sama.gov.sa/ar-sa/News/Circulars', lastCheck: '06:00', newItems: 0, method: { en: 'Listing page, daily diff', ar: 'صفحة فهرس، مقارنة يومية' } },
  { id: 'SRC-03', regulator: 'cma', name: { en: 'Board resolutions', ar: 'قرارات مجلس الهيئة' }, url: 'cma.org.sa/Market/News', lastCheck: '06:00', newItems: 1, method: { en: 'Listing page, daily diff', ar: 'صفحة فهرس، مقارنة يومية' } },
  { id: 'SRC-04', regulator: 'cma', name: { en: 'Regulations and rules library', ar: 'مكتبة اللوائح والقواعد' }, url: 'cma.org.sa/RulesRegulations', lastCheck: '06:00', newItems: 0, method: { en: 'Version compare on each document', ar: 'مقارنة إصدارات لكل وثيقة' } },
  { id: 'SRC-05', regulator: 'ia', name: { en: 'Insurance Authority circulars', ar: 'تعاميم هيئة التأمين' }, url: 'ia.gov.sa/ar/circulars', lastCheck: '06:00', newItems: 1, method: { en: 'Listing page + scanned PDF OCR', ar: 'صفحة فهرس + قراءة ضوئية للملفات' } },
  { id: 'SRC-06', regulator: 'sdaia', name: { en: 'PDPL implementing regulations', ar: 'اللوائح التنفيذية لحماية البيانات' }, url: 'sdaia.gov.sa/ar/SDAIA/about/Pages/PDPL', lastCheck: '06:00', newItems: 0, method: { en: 'Version compare on each document', ar: 'مقارنة إصدارات لكل وثيقة' } },
  { id: 'SRC-07', regulator: 'nca', name: { en: 'Cybersecurity controls', ar: 'الضوابط السيبرانية' }, url: 'nca.gov.sa/regulatory-documents', lastCheck: '06:00', newItems: 0, method: { en: 'Version compare on each document', ar: 'مقارنة إصدارات لكل وثيقة' } },
  { id: 'SRC-08', regulator: 'sama', name: { en: 'Official gazette — financial sector', ar: 'أم القرى — القطاع المالي' }, url: 'uqn.gov.sa', lastCheck: '06:00', newItems: 2, method: { en: 'Weekly issue, filtered', ar: 'العدد الأسبوعي، مُصفّى' } },
];

export interface ConsoleClient {
  id: string;
  name: Bi;
  segment: Bi;
  stage: 'paying' | 'pilot' | 'talks';
  annualValue: number;
  announcementsHandled: number;
  since: string;
  /** set when the client has a live workspace in this demo */
  tenantId?: string;
  sector: SectorId;
  /** the person who signs the contract */
  contact: Bi;
  contactTitle: Bi;
  /** open obligations across their workspace */
  openObligations: number;
  lastActive: string;
}

export const CLIENTS: ConsoleClient[] = [
  {
    id: 'CL-01', tenantId: 'TN-BANK', sector: 'bank',
    name: { en: 'Innovation Bank', ar: 'بنك الابتكار' },
    segment: { en: 'Bank · Saudi Central Bank', ar: 'بنك · البنك المركزي السعودي' },
    stage: 'pilot', annualValue: 140_000, announcementsHandled: 5, openObligations: 9, since: '2026-09',
    contact: { en: 'Sarah Abdullah Al-Rashid', ar: 'سارة عبدالله الرشيد' },
    contactTitle: { en: 'Chief Compliance Officer', ar: 'رئيس إدارة الالتزام' },
    lastActive: '2026-09-15 08:12',
  },
  {
    id: 'CL-02', tenantId: 'TN-INS', sector: 'insurance',
    name: { en: 'Sahaab Cooperative Insurance', ar: 'سحاب للتأمين التعاوني' },
    segment: { en: 'Insurer · Insurance Authority', ar: 'شركة تأمين · هيئة التأمين' },
    stage: 'pilot', annualValue: 140_000, announcementsHandled: 3, openObligations: 7, since: '2026-09',
    contact: { en: 'Lama Abdulmohsen Al-Barrak', ar: 'لمى عبدالمحسن البراك' },
    contactTitle: { en: 'Chief Compliance Officer', ar: 'رئيس إدارة الالتزام' },
    lastActive: '2026-09-14 16:40',
  },
  {
    id: 'CL-03', tenantId: 'TN-CAP', sector: 'capital',
    name: { en: 'Rawda Capital', ar: 'روضة كابيتال' },
    segment: { en: 'Capital market institution · CMA', ar: 'مؤسسة سوق مالية · هيئة السوق المالية' },
    stage: 'pilot', annualValue: 70_000, announcementsHandled: 2, openObligations: 6, since: '2026-09',
    contact: { en: 'Maha Abdulaziz Al-Tuwaijri', ar: 'مها عبدالعزيز التويجري' },
    contactTitle: { en: 'Head of Compliance & MLRO', ar: 'رئيس الالتزام ومسؤول الإبلاغ' },
    lastActive: '2026-09-15 09:05',
  },
  {
    id: 'CL-04', sector: 'bank',
    name: { en: 'Nakhla Finance', ar: 'نخلة للتمويل' },
    segment: { en: 'Finance company · Saudi Central Bank', ar: 'شركة تمويل · البنك المركزي السعودي' },
    stage: 'talks', annualValue: 70_000, announcementsHandled: 0, openObligations: 0, since: '2026-09',
    contact: { en: 'Fahad Abdulaziz Al-Rubaia', ar: 'فهد عبدالعزيز الربيعة' },
    contactTitle: { en: 'Compliance Manager', ar: 'مدير الالتزام' },
    lastActive: '—',
  },
  {
    id: 'CL-05', sector: 'capital',
    name: { en: 'Marfa Investment', ar: 'مرفأ للاستثمار' },
    segment: { en: 'Capital market institution · CMA', ar: 'مؤسسة سوق مالية · هيئة السوق المالية' },
    stage: 'talks', annualValue: 70_000, announcementsHandled: 0, openObligations: 0, since: '2026-09',
    contact: { en: 'Aseel Mohammed Al-Shathri', ar: 'أسيل محمد الشثري' },
    contactTitle: { en: 'Head of Compliance', ar: 'رئيس الالتزام' },
    lastActive: '—',
  },
];

export const clientById = (id: string) => CLIENTS.find((c) => c.id === id);

/** How well the engine reads, measured on announcements a person has reviewed. */
export interface ExtractionRun {
  id: string;
  announcement: string;
  regulator: RegulatorId;
  rules: number;
  accepted: number;
  edited: number;
  rejected: number;
  avgConfidence: number;
  reviewer: string;
  /** the institution whose officer reviewed this run */
  tenantId: string;
  date: string;
}

export const EXTRACTION_RUNS: ExtractionRun[] = [
  { id: 'RUN-21', announcement: 'SAMA/BC/2026/41', regulator: 'sama', rules: 9, accepted: 8, edited: 1, rejected: 0, avgConfidence: 0.91, reviewer: 'E-002', tenantId: 'TN-BANK', date: '2026-09-14' },
  { id: 'RUN-20', announcement: 'IA/CIR/2026/22', regulator: 'ia', rules: 7, accepted: 6, edited: 1, rejected: 0, avgConfidence: 0.92, reviewer: 'E-202', tenantId: 'TN-INS', date: '2026-09-12' },
  { id: 'RUN-19', announcement: 'CMA/RES/2026/3-6', regulator: 'cma', rules: 6, accepted: 5, edited: 1, rejected: 0, avgConfidence: 0.92, reviewer: 'E-402', tenantId: 'TN-CAP', date: '2026-09-09' },
  { id: 'RUN-18', announcement: 'SDAIA/PDPL/2026/8', regulator: 'sdaia', rules: 5, accepted: 4, edited: 1, rejected: 0, avgConfidence: 0.88, reviewer: 'E-100', tenantId: 'TN-BANK', date: '2026-08-29' },
  { id: 'RUN-17', announcement: 'IA/CIR/2026/17', regulator: 'ia', rules: 4, accepted: 3, edited: 0, rejected: 1, avgConfidence: 0.84, reviewer: 'E-203', tenantId: 'TN-INS', date: '2026-09-06' },
  { id: 'RUN-16', announcement: 'SAMA/OB/2026/12', regulator: 'sama', rules: 7, accepted: 7, edited: 0, rejected: 0, avgConfidence: 0.93, reviewer: 'E-003', tenantId: 'TN-BANK', date: '2026-09-02' },
  { id: 'RUN-15', announcement: 'CMA/RES/2026/2-9', regulator: 'cma', rules: 8, accepted: 7, edited: 1, rejected: 0, avgConfidence: 0.9, reviewer: 'E-403', tenantId: 'TN-CAP', date: '2026-08-25' },
  { id: 'RUN-14', announcement: 'SAMA/BC/2026/38', regulator: 'sama', rules: 11, accepted: 9, edited: 2, rejected: 0, avgConfidence: 0.9, reviewer: 'E-002', tenantId: 'TN-BANK', date: '2026-08-21' },
];

export const EXTRACTION_TOTALS = EXTRACTION_RUNS.reduce(
  (acc, r) => ({
    rules: acc.rules + r.rules,
    accepted: acc.accepted + r.accepted,
    edited: acc.edited + r.edited,
    rejected: acc.rejected + r.rejected,
  }),
  { rules: 0, accepted: 0, edited: 0, rejected: 0 },
);
