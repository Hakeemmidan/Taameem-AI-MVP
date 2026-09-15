import type { Policy, PolicyClause } from '@/lib/types';
import { clauseCount } from './_helpers';
import { COMPLAINTS_POLICY } from './complaints';
import { AML_POLICY, KYC_POLICY } from './financial-crime';
import { PDPL_POLICY } from './privacy';
import { INFOSEC_POLICY, OUTSOURCING_POLICY, BCM_POLICY } from './technology';
import { CONSUMER_POLICY } from './conduct';
import { INSURANCE_POLICIES } from './insurance';
import { CAPITAL_POLICIES } from './capital';

/** Innovation Bank's library, in the order a compliance officer would read it. */
export const BANK_POLICIES: Policy[] = [
  COMPLAINTS_POLICY,
  CONSUMER_POLICY,
  AML_POLICY,
  KYC_POLICY,
  PDPL_POLICY,
  INFOSEC_POLICY,
  OUTSOURCING_POLICY,
  BCM_POLICY,
];

/** Every policy in the system. Always filter by tenant before showing them. */
export const POLICIES: Policy[] = [...BANK_POLICIES, ...INSURANCE_POLICIES, ...CAPITAL_POLICIES];

export { COMPLAINTS_POLICY, CONSUMER_POLICY, AML_POLICY, KYC_POLICY, PDPL_POLICY, INFOSEC_POLICY, OUTSOURCING_POLICY, BCM_POLICY };

export const policiesOf = (tenantId: string) => POLICIES.filter((p) => p.tenantId === tenantId);
export const policyById = (id: string) => POLICIES.find((p) => p.id === id);
export const policyClauses = (p: Policy) => p.sections.flatMap((s) => s.clauses);

/** "6.2" inside POL-CMP -> the clause itself, plus the policy it belongs to. */
export const findClause = (policyId: string, ref: string): { policy: Policy; clause: PolicyClause } | undefined => {
  const policy = policyById(policyId);
  if (!policy) return undefined;
  const clause = policyClauses(policy).find((c) => c.ref === ref);
  return clause ? { policy, clause } : undefined;
};

export const libraryStats = (tenantId: string) => {
  const list = policiesOf(tenantId);
  return {
    policies: list.length,
    clauses: list.reduce((n, p) => n + clauseCount(p.sections), 0),
    owners: new Set(list.map((p) => p.owner)).size,
    regulators: new Set(list.flatMap((p) => p.regulators)).size,
  };
};

export const LIBRARY_STATS = {
  policies: POLICIES.length,
  clauses: POLICIES.reduce((n, p) => n + clauseCount(p.sections), 0),
  owners: new Set(POLICIES.map((p) => p.owner)).size,
};

export const ALL_TAGS = Array.from(new Set(POLICIES.flatMap((p) => policyClauses(p).flatMap((c) => c.tags)))).sort();

export const clausesByTag = (tag: string) =>
  POLICIES.flatMap((p) => policyClauses(p).filter((c) => c.tags.includes(tag)).map((clause) => ({ policy: p, clause })));
