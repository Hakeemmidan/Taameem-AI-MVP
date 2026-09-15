'use client';

import { PageHeader, PersonChip, RegulatorChip, SectionLabel } from '@/components/features/atoms';
import { Badge, Card, CardBody, Progress, Stat } from '@/components/ui/primitives';
import { useLang } from '@/lib/i18n/context';
import { EXTRACTION_RUNS, EXTRACTION_TOTALS } from '@/data/console';
import { tenantById } from '@/data/tenants';
import { fmtDate, pct } from '@/lib/utils';

export default function ExtractionPage() {
  const { tb, lang, isRtl } = useLang();
  const acceptedPct = pct(EXTRACTION_TOTALS.accepted, EXTRACTION_TOTALS.rules);
  const editedPct = pct(EXTRACTION_TOTALS.edited, EXTRACTION_TOTALS.rules);
  const rejectedPct = pct(EXTRACTION_TOTALS.rejected, EXTRACTION_TOTALS.rules);

  return (
    <>
      <PageHeader
        title={isRtl ? 'جودة الاستخراج' : 'Extraction quality'}
        subtitle={
          isRtl
            ? 'الدقة تُقاس بما فعله موظف الالتزام: قَبِل أو عدّل أو رفض.'
            : 'Accuracy is what the compliance officer did: accepted, edited or rejected.'
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={isRtl ? 'قواعد مراجعة' : 'Rules reviewed'} value={EXTRACTION_TOTALS.rules} sub={`${EXTRACTION_RUNS.length} ${isRtl ? 'تعاميم' : 'announcements'}`} />
        <Stat label={isRtl ? 'قُبلت كما هي' : 'Accepted as written'} value={`${acceptedPct}%`} tone="primary" sub={`${EXTRACTION_TOTALS.accepted} ${isRtl ? 'قاعدة' : 'rules'}`} />
        <Stat label={isRtl ? 'عُدّلت' : 'Edited by a person'} value={`${editedPct}%`} tone="warn" sub={`${EXTRACTION_TOTALS.edited} ${isRtl ? 'قاعدة' : 'rules'}`} />
        <Stat label={isRtl ? 'رُفضت' : 'Rejected'} value={`${rejectedPct}%`} tone={rejectedPct > 5 ? 'danger' : 'neutral'} sub={`${EXTRACTION_TOTALS.rejected} ${isRtl ? 'قاعدة' : 'rules'}`} />
      </div>

      <Card className="mb-6">
        <CardBody>
          <SectionLabel>{isRtl ? 'ما فعله المراجعون بكل قاعدة' : 'What reviewers did with each rule'}</SectionLabel>
          <div className="flex h-8 overflow-hidden rounded-lg">
            <span className="grid place-items-center bg-primary font-mono text-[12px] font-bold text-primary-fg" style={{ flex: EXTRACTION_TOTALS.accepted }}>
              {acceptedPct}%
            </span>
            <span className="grid place-items-center bg-warn font-mono text-[12px] font-bold text-white" style={{ flex: EXTRACTION_TOTALS.edited }}>
              {editedPct}%
            </span>
            {EXTRACTION_TOTALS.rejected > 0 ? (
              <span className="grid place-items-center bg-danger font-mono text-[12px] font-bold text-white" style={{ flex: EXTRACTION_TOTALS.rejected }}>
                {rejectedPct}%
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-fg-muted">
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary" />{isRtl ? 'قُبلت' : 'Accepted'}</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-warn" />{isRtl ? 'عُدّلت' : 'Edited'}</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-danger" />{isRtl ? 'رُفضت' : 'Rejected'}</span>
          </div>
        </CardBody>
      </Card>

      <SectionLabel>{isRtl ? 'كل عملية استخراج' : 'Every run'}</SectionLabel>
      <Card>
        <CardBody className="p-0">
          <ul className="divide-y divide-border">
            {EXTRACTION_RUNS.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <span className="shrink-0 font-mono text-[11px] text-fg-subtle">{r.id}</span>
                <RegulatorChip id={r.regulator} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[12.5px]">{r.announcement}</span>
                  <span className="block truncate text-[11px] text-fg-subtle">{tb(tenantById(r.tenantId).shortName)}</span>
                </span>
                <span className="hidden shrink-0 sm:block">
                  <PersonChip id={r.reviewer} size={20} />
                </span>
                <span className="w-28 shrink-0">
                  <Progress value={pct(r.accepted, r.rules)} className="h-1.5" animate={false} />
                </span>
                <span className="shrink-0 font-mono text-[12px]">
                  {r.accepted}/{r.rules}
                </span>
                <Badge tone={r.avgConfidence >= 0.9 ? 'primary' : 'warn'}>{r.avgConfidence.toFixed(2)}</Badge>
                <span className="hidden shrink-0 font-mono text-[11.5px] text-fg-subtle lg:block">{fmtDate(r.date, lang)}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </>
  );
}
