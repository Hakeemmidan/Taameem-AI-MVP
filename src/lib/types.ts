/** Everything a user can read exists in both languages. */
export type Bi = { en: string; ar: string };

export type Lang = 'en' | 'ar';

export const t = (v: Bi, lang: Lang) => v[lang];

/* ------------------------------------------------------------------ people */

export type DepartmentId =
  | 'compliance'
  | 'legal'
  | 'it'
  | 'operations'
  | 'risk'
  | 'audit'
  | 'retail'
  | 'care'
  | 'aml'
  | 'infosec'
  | 'privacy'
  | 'hr'
  | 'finance'
  | 'marketing'
  | 'procurement'
  // insurance
  | 'claims'
  | 'underwriting'
  | 'actuarial'
  // capital market
  | 'dealing'
  | 'assetmgmt'
  | 'research'
  | 'custody';

export interface Department {
  id: DepartmentId;
  tenantId: string;
  name: Bi;
  short: Bi;
  headId: string;
  /** lucide icon name */
  icon: string;
  headcount: number;
}

export interface Employee {
  id: string;
  tenantId: string;
  /** what this person may do inside the workspace */
  role: import('@/data/tenants').RoleId;
  /** first + father + family, the way a Saudi HR register holds it */
  name: Bi;
  title: Bi;
  department: DepartmentId;
  email: string;
  phone: string;
  /** can sign off obligations and evidence on behalf of the department */
  approver: boolean;
  /** deterministic avatar colour */
  hue: number;
  joined: string;
  /** offered on the sign-in screen, so the demo can be entered as this person */
  signIn?: boolean;
}

/* ----------------------------------------------------------------- systems */

export type SystemCriticality = 'critical' | 'high' | 'medium' | 'low';

export interface BankSystem {
  id: string;
  tenantId: string;
  name: Bi;
  vendor: string;
  ownerDept: DepartmentId;
  criticality: SystemCriticality;
  hosting: Bi;
  /** short note on what the system does, used by the mapping engine */
  purpose: Bi;
  holdsPersonalData: boolean;
}

/* ---------------------------------------------------------------- policies */

export interface PolicyClause {
  /** e.g. "6.2" — stable, quotable in a report */
  ref: string;
  heading: Bi;
  text: Bi;
  /** free tags the extraction engine matches against */
  tags: string[];
}

export interface PolicySection {
  ref: string;
  heading: Bi;
  clauses: PolicyClause[];
}

export interface Policy {
  id: string;
  tenantId: string;
  code: string;
  title: Bi;
  version: string;
  owner: DepartmentId;
  approvedBy: Bi;
  effective: string;
  nextReview: string;
  /** which regulator's rulebook this policy answers to */
  regulators: RegulatorId[];
  summary: Bi;
  sections: PolicySection[];
  /** file the compliance team uploads, mirrored in public/seed-files */
  sourceFile: string;
}

/* ------------------------------------------------------------- regulations */

export type RegulatorId = 'sama' | 'cma' | 'ia' | 'sdaia' | 'nca';

export interface Regulator {
  id: RegulatorId;
  name: Bi;
  short: Bi;
  colour: string;
}

export type AnnouncementStatus = 'new' | 'reading' | 'review' | 'mapped' | 'in_progress' | 'reported' | 'archived';

export interface Announcement {
  id: string;
  reference: string;
  /** which kinds of institution this letter actually binds */
  sectors: import('@/data/tenants').SectorId[];
  regulator: RegulatorId;
  title: Bi;
  issued: string;
  received: string;
  deadline: string;
  /** who it applies to, in the regulator's own words */
  appliesTo: Bi;
  /** the raw Arabic letter, paragraph by paragraph */
  body: { ref: string; text: Bi }[];
  status: AnnouncementStatus;
  pages: number;
  sourceFile: string;
}

/* ------------------------------------------------------------- obligations */

export type Modality = 'must' | 'must_not' | 'should';
export type GapSeverity = 'none' | 'low' | 'medium' | 'high';
export type ObligationStatus = 'extracted' | 'confirmed' | 'rejected' | 'in_progress' | 'closed';

export interface ObligationMapping {
  kind: 'policy' | 'system' | 'process';
  targetId: string;
  /** the exact clause or screen the rule lands on */
  locator: Bi;
  current: Bi;
  required: Bi;
  gap: GapSeverity;
  note: Bi;
}

export interface Obligation {
  id: string;
  tenantId: string;
  announcementId: string;
  /** paragraph in the announcement this came from */
  sourceRef: string;
  modality: Modality;
  statement: Bi;
  confidence: number;
  status: ObligationStatus;
  ownerDept: DepartmentId;
  ownerId: string;
  dueDate: string;
  mappings: ObligationMapping[];
  confirmedBy?: string;
  confirmedAt?: string;
}

/* ------------------------------------------------------------------- tasks */

export type TaskStatus = 'draft' | 'sent' | 'in_progress' | 'done' | 'overdue';

export interface Task {
  id: string;
  tenantId: string;
  obligationId: string;
  title: Bi;
  detail: Bi;
  dept: DepartmentId;
  assigneeId: string;
  due: string;
  hijri: string;
  status: TaskStatus;
  /** what the department must hand back */
  expectedEvidence: Bi;
  /**
   * Exactly what the assignee has to do, in order. This is what reaches them
   * when the task is sent, so it has to be doable without asking Compliance
   * what was meant.
   */
  steps?: Bi[];
}

/* ---------------------------------------------------------------- evidence */

export interface Evidence {
  id: string;
  tenantId: string;
  taskId: string;
  fileName: string;
  kind: 'pdf' | 'png' | 'csv' | 'docx' | 'xlsx';
  sizeKb: number;
  uploadedBy: string;
  uploadedAt: string;
  /** sha-256 style digest, sealed at upload */
  digest: string;
  verified: boolean;
}

/* -------------------------------------------------------------- inspection */

export interface Finding {
  id: string;
  tenantId: string;
  area: Bi;
  regulator: RegulatorId;
  severity: Exclude<GapSeverity, 'none'>;
  statement: Bi;
  inspectorWouldAsk: Bi;
  fixWithinDays: number;
  exposureLow: number;
  exposureHigh: number;
  ownerDept: DepartmentId;
}
