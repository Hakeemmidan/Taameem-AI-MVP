'use client';

import { useState } from 'react';
import { Building2, ExternalLink, Lock } from 'lucide-react';
import { PageHeader, RegulatorChip, Row, SectionLabel } from '@/components/features/atoms';
import { Badge, Card, CardBody, Stat } from '@/components/ui/primitives';
import { Drawer } from '@/components/ui/overlay';
import { useLang } from '@/lib/i18n/context';
import { CLIENTS, EXTRACTION_RUNS, type ConsoleClient } from '@/data/console';
import { SECTORS, tenantById } from '@/data/tenants';
import { fmtSar, fmtSarShort } from '@/lib/utils';

const STAGE_AR = { paying: 'يدفع', pilot: 'تجربة', talks: 'محادثات' } as const;
const STAGE_TONE = { paying: 'primary', pilot: 'warn', talks: 'neutral' } as const;

export default function ClientsPage() {
  const { t, tb, lang, isRtl } = useLang();
  const [open, setOpen] = useState<ConsoleClient | null>(null);

  const paying = CLIENTS.filter((c) => c.stage === 'paying');
  const pilots = CLIENTS.filter((c) => c.stage === 'pilot');
  const arr = paying.reduce((n, c) => n + c.annualValue, 0);
  const pipeline = CLIENTS.filter((c) => c.stage !== 'paying').reduce((n, c) => n + c.annualValue, 0);

  const tenant = open?.tenantId ? tenantById(open.tenantId) : null;
  const runs = open?.tenantId ? EXTRACTION_RUNS.filter((r) => r.tenantId === open.tenantId) : [];

  return (
    <>
      <PageHeader
        title={isRtl ? 'العملاء' : 'Clients'}
        subtitle={
          isRtl
            ? `الحالة الحقيقية اليوم: ${pilots.length} تجارب و${CLIENTS.length - pilots.length - paying.length} محادثات.`
            : `The honest state today: ${pilots.length} pilots and ${CLIENTS.length - pilots.length - paying.length} conversations.`
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label={isRtl ? 'إيراد سنوي متكرر' : 'Annual recurring revenue'}
          value={fmtSarShort(arr, lang)}
          tone={arr > 0 ? 'primary' : 'neutral'}
          sub={`${paying.length} ${isRtl ? 'عملاء يدفعون' : 'paying clients'}`}
        />
        <Stat
          label={isRtl ? 'قيمة قيد التفاوض' : 'Pipeline value'}
          value={fmtSarShort(pipeline, lang)}
          tone="warn"
          sub={`${CLIENTS.length - paying.length} ${isRtl ? 'تجارب ومحادثات' : 'pilots and conversations'}`}
        />
        <Stat
          label={isRtl ? 'تعاميم عولجت' : 'Announcements handled'}
          value={CLIENTS.reduce((n, c) => n + c.announcementsHandled, 0)}
          sub={isRtl ? 'عبر جميع العملاء' : 'across all clients'}
        />
      </div>

      <Card>
        <CardBody className="p-0">
          <ul className="divide-y divide-border">
            {CLIENTS.map((c) => (
              <li key={c.id}>
                <button onClick={() => setOpen(c)} className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-start transition hover:bg-bg-soft">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-bg-soft text-fg-muted">
                    <Building2 className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{tb(c.name)}</p>
                    <p className="truncate text-[12px] text-fg-muted">{tb(c.segment)}</p>
                  </div>
                  <div className="hidden shrink-0 text-center sm:block">
                    <p className="font-mono text-[13px] font-semibold">{c.announcementsHandled}</p>
                    <p className="text-[11px] text-fg-subtle">{isRtl ? 'تعاميم' : 'letters'}</p>
                  </div>
                  <div className="shrink-0 text-end">
                    <p className="font-mono text-[13px] font-semibold">{fmtSar(c.annualValue, lang)}</p>
                    <p className="text-[11px] text-fg-subtle">{isRtl ? 'سنوياً' : 'per year'}</p>
                  </div>
                  <Badge tone={STAGE_TONE[c.stage]}>{isRtl ? STAGE_AR[c.stage] : c.stage}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <SectionLabel className="mt-8">{isRtl ? 'حجم كل قطاع في المملكة' : 'How large each sector is in the Kingdom'}</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-3">
        {SECTORS.map((s) => (
          <Card key={s.id} className="p-4">
            <p className="font-mono text-[26px] font-bold leading-none">{s.population}</p>
            <p className="mt-2 text-[13px] font-semibold">{tb(s.name)}</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-fg-subtle">{tb(s.populationNote)}</p>
          </Card>
        ))}
      </div>

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? tb(open.name) : ''}
        subtitle={open ? tb(open.segment) : ''}
        width="max-w-xl"
      >
        {open ? (
          <div className="p-6">
            <Badge tone={STAGE_TONE[open.stage]}>{isRtl ? STAGE_AR[open.stage] : open.stage}</Badge>

            <SectionLabel className="mt-5">{isRtl ? 'الاشتراك' : 'Subscription'}</SectionLabel>
            <div className="divide-y divide-border border-y border-border">
              <Row label={isRtl ? 'القيمة السنوية' : 'Annual value'}>
                <span className="font-mono">{fmtSar(open.annualValue, lang)}</span>
              </Row>
              <Row label={isRtl ? 'منذ' : 'Since'}>{open.since}</Row>
              <Row label={isRtl ? 'آخر نشاط' : 'Last active'}>
                <span className="font-mono text-[12px]">{open.lastActive}</span>
              </Row>
              <Row label={isRtl ? 'تعاميم عولجت' : 'Letters handled'}>
                <span className="font-mono">{open.announcementsHandled}</span>
              </Row>
              <Row label={isRtl ? 'التزامات مفتوحة' : 'Open obligations'}>
                <span className="font-mono">{open.openObligations}</span>
              </Row>
            </div>

            <SectionLabel className="mt-6">{isRtl ? 'جهة الاتصال' : 'Contact'}</SectionLabel>
            <div className="rounded-lg border border-border bg-surface-2 p-3.5">
              <p className="text-[13.5px] font-semibold">{tb(open.contact)}</p>
              <p className="mt-0.5 text-[12px] text-fg-muted">{tb(open.contactTitle)}</p>
            </div>

            {tenant ? (
              <>
                <SectionLabel className="mt-6">{isRtl ? 'المنشأة' : 'The institution'}</SectionLabel>
                <div className="divide-y divide-border border-y border-border">
                  <Row label={t('inst.city')}>{tb(tenant.city)}</Row>
                  <Row label={t('inst.staff')}>{tenant.staff.toLocaleString('en-US')}</Row>
                  <Row label={t('inst.founded')}>{tenant.founded}</Row>
                  <Row label={t('inst.regulators')}>
                    <span className="inline-flex flex-wrap justify-end gap-1.5">
                      {tenant.regulators.map((r) => (
                        <RegulatorChip key={r} id={r} />
                      ))}
                    </span>
                  </Row>
                </div>
              </>
            ) : null}

            {runs.length > 0 ? (
              <>
                <SectionLabel className="mt-6">{isRtl ? 'جودة الاستخراج لديهم' : 'Extraction quality for them'}</SectionLabel>
                <ul className="flex flex-col gap-2">
                  {runs.map((r) => (
                    <li key={r.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
                      <RegulatorChip id={r.regulator} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[12px] font-medium">{r.announcement}</p>
                        <p className="text-[11px] text-fg-subtle">
                          {r.accepted}/{r.rules} {isRtl ? 'مقبولة' : 'accepted'} · {r.date}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[12px] font-semibold">{r.avgConfidence.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <p className="mt-6 flex items-start gap-2 rounded-lg bg-bg-soft px-3 py-2.5 text-[12px] leading-relaxed text-fg-muted">
              <Lock className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" />
              {isRtl
                ? 'لا نفتح سياسات العميل ولا أدلته من هنا. ما يظهر أعلاه هو بيانات الاشتراك والجودة فقط.'
                : 'We do not open a client’s policies or evidence from here. The above is subscription and quality data only.'}
            </p>

            {tenant ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-fg-subtle">
                <ExternalLink className="size-3.5" />
                {isRtl ? 'مساحة العمل تُفتح بحساب من داخل المنشأة.' : 'Their workspace opens only with an account inside the institution.'}
              </p>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
