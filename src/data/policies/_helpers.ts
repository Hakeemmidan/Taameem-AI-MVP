import type { PolicyClause, PolicySection } from '@/lib/types';

/** clause */
export const c = (
  ref: string,
  headingEn: string,
  headingAr: string,
  textEn: string,
  textAr: string,
  tags: string[] = [],
): PolicyClause => ({ ref, heading: { en: headingEn, ar: headingAr }, text: { en: textEn, ar: textAr }, tags });

/** section */
export const s = (ref: string, headingEn: string, headingAr: string, clauses: PolicyClause[]): PolicySection => ({
  ref,
  heading: { en: headingEn, ar: headingAr },
  clauses,
});

export const clauseCount = (sections: PolicySection[]) => sections.reduce((n, x) => n + x.clauses.length, 0);
