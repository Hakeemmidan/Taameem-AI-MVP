'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Building2, CircleCheckBig, Radar, TrendingUp } from 'lucide-react';
import { PageHeader, RegulatorChip, SectionLabel } from '@/components/features/atoms';
import { Badge, Card, CardBody, CardHeader, CardTitle, Progress, Stat } from '@/components/ui/primitives';
import { useLang } from '@/lib/i18n/context';
import { REGULATORS } from '@/data/regulators';
import { ANNOUNCEMENTS } from '@/data/announcements';
import { CLIENTS, SOURCE_WATCH } from '@/data/console';
import { fmtDate, fmtSarShort } from '@/lib/utils';

export default function AdminHome() {
  const { tb, lang, isRtl } = useLang();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const arr = CLIENTS.filter((c) => c.stage === 'paying').reduce((n, c) => n + c.annualValue, 0);
  const pipeline = CLIENTS.filter((c) => c.stage !== 'paying').reduce((n, c) => n + c.annualValue, 0);

  return (
    <>
      <PageHeader
        title={isRtl ? 'كونسول تعميم' : 'Taameem console'}
        subtitle={
          isRtl
            ? 'ما نراقبه نحن: مصادر الجهات الرقابية، وجودة الاستخراج، وحالة كل عميل.'
            : 'What we watch: the regulators’ sources, extraction quality, and the health of every client.'
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={isRtl ? 'مصادر مراقَبة' : 'Sources watched'} value={SOURCE_WATCH.length} tone="primary" sub={isRtl ? 'تُفحص كل صباح الساعة 6:00' : 'checked every morning at 06:00'} />
        <Stat label={isRtl ? 'تعاميم هذا الشهر' : 'Announcements this month'} value={ANNOUNCEMENTS.length} sub={`${new Set(ANNOUNCEMENTS.map((a) => a.regulator)).size} ${isRtl ? 'جهات' : 'regulators'}`} />
        <Stat label={isRtl ? 'عملاء يدفعون' : 'Paying clients'} value={CLIENTS.filter((c) => c.stage === 'paying').length} tone="primary" sub={`${fmtSarShort(arr, lang)} ${isRtl ? 'إيراد سنوي متكرر' : 'ARR'}`} />
        <Stat label={isRtl ? 'قيد التفاوض' : 'In the pipeline'} value={CLIENTS.filter((c) => c.stage !== 'paying').length} tone="warn" sub={`${fmtSarShort(pipeline, lang)} ${isRtl ? 'قيمة سنوية محتملة' : 'potential annual value'}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{isRtl ? 'مراقبة المصادر' : 'Source watch'}</CardTitle>
              <p className="mt-0.5 text-[12.5px] text-fg-muted">{isRtl ? 'آخر فحص وما عُثر عليه' : 'Last check and what it found'}</p>
            </div>
            <Link href="/admin/sources" className="shrink-0 text-[12.5px] font-semibold text-primary hover:underline dark:text-accent">
              {isRtl ? 'الكل' : 'All'}
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {SOURCE_WATCH.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link href="/admin/sources" className="flex items-center gap-3 px-5 py-3 transition hover:bg-bg-soft">
                  <RegulatorChip id={s.regulator} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{tb(s.name)}</p>
                    <p className="truncate font-mono text-[11px] text-fg-subtle">{s.url}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11.5px] text-fg-subtle">{s.lastCheck}</span>
                  <Badge tone={s.newItems > 0 ? 'primary' : 'neutral'}>
                    {s.newItems > 0 ? `+${s.newItems}` : '—'}
                  </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{isRtl ? 'العملاء' : 'Clients'}</CardTitle>
              <p className="mt-0.5 text-[12.5px] text-fg-muted">{isRtl ? 'المرحلة والقيمة السنوية' : 'Stage and annual value'}</p>
            </div>
            <Link href="/admin/clients" className="shrink-0 text-[12.5px] font-semibold text-primary hover:underline dark:text-accent">
              {isRtl ? 'الكل' : 'All'}
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {CLIENTS.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link href="/admin/clients" className="flex items-center gap-3 px-5 py-3 transition hover:bg-bg-soft">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-bg-soft text-fg-muted">
                    <Building2 className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{tb(c.name)}</p>
                    <p className="truncate text-[11.5px] text-fg-subtle">{tb(c.segment)}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[12px]">{fmtSarShort(c.annualValue, lang)}</span>
                  <Badge tone={c.stage === 'paying' ? 'primary' : c.stage === 'pilot' ? 'warn' : 'neutral'}>
                      {isRtl ? { paying: 'يدفع', pilot: 'تجربة', talks: 'محادثات' }[c.stage] : c.stage}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <SectionLabel className="mt-8">{isRtl ? 'تغطية الجهات' : 'Regulator coverage'}</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {REGULATORS.map((r) => {
          const watched = SOURCE_WATCH.filter((s) => s.regulator === r.id);
          const live = watched.length > 0;
          return (
            <Card key={r.id} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <RegulatorChip id={r.id} />
                {live ? <CircleCheckBig className="ms-auto size-4 text-primary dark:text-accent" /> : <Radar className="ms-auto size-4 text-fg-subtle" />}
              </div>
              <p className="text-[12.5px] font-medium leading-snug">{tb(r.name)}</p>
              <p className="mt-1 text-[11.5px] text-fg-subtle">
                {watched.length} {isRtl ? 'مصدراً' : 'sources'}
              </p>
              <Progress value={live ? 100 : 25} className="mt-2.5" tone={live ? 'primary' : 'neutral'} />
            </Card>
          );
        })}
      </div>
    </>
  );
}
