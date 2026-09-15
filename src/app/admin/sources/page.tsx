'use client';

import { useState } from 'react';
import { Clock, ExternalLink, Radar, RefreshCw } from 'lucide-react';
import { PageHeader, RegulatorChip, Row, SectionLabel } from '@/components/features/atoms';
import { Badge, Button, Card, CardBody, Stat } from '@/components/ui/primitives';
import { Drawer } from '@/components/ui/overlay';
import { useLang } from '@/lib/i18n/context';
import { SOURCE_WATCH, type SourceWatch } from '@/data/console';
import { ANNOUNCEMENTS } from '@/data/announcements';
import { regulatorById } from '@/data/regulators';
import { SECTORS } from '@/data/tenants';
import { fmtDate } from '@/lib/utils';

export default function SourcesPage() {
  const { t, tb, lang, isRtl } = useLang();
  const [open, setOpen] = useState<SourceWatch | null>(null);
  const withNew = SOURCE_WATCH.filter((s) => s.newItems > 0);

  /** The letters this source is where we found them. */
  const foundHere = (s: SourceWatch) => ANNOUNCEMENTS.filter((a) => a.regulator === s.regulator);

  return (
    <>
      <PageHeader
        title={isRtl ? 'المصادر الرقابية' : 'Regulatory sources'}
        subtitle={isRtl ? 'الصفحات الرسمية التي نفحصها كل صباح.' : 'The official pages we check every morning.'}
        actions={
          <Button variant="secondary">
            <RefreshCw className="size-4" />
            {isRtl ? 'افحص الآن' : 'Check now'}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label={isRtl ? 'مصادر مراقَبة' : 'Sources watched'} value={SOURCE_WATCH.length} tone="primary" />
        <Stat
          label={isRtl ? 'جديد هذا الصباح' : 'New this morning'}
          value={withNew.reduce((n, s) => n + s.newItems, 0)}
          tone="warn"
          sub={`${withNew.length} ${isRtl ? 'مصادر' : 'sources'}`}
        />
        <Stat label={isRtl ? 'وقت الفحص' : 'Check time'} value="06:00" sub={isRtl ? 'بتوقيت الرياض، أيام العمل' : 'Riyadh time, working days'} />
      </div>

      <Card>
        <CardBody className="p-0">
          <ul className="divide-y divide-border">
            {SOURCE_WATCH.map((s) => (
              <li key={s.id}>
                <button onClick={() => setOpen(s)} className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-start transition hover:bg-bg-soft">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-bg-soft text-fg-muted">
                    <Radar className="size-4" />
                  </span>
                  <RegulatorChip id={s.regulator} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold">{tb(s.name)}</p>
                    <p className="truncate font-mono text-[11.5px] text-fg-subtle">{s.url}</p>
                  </div>
                  <span className="hidden shrink-0 items-center gap-1.5 font-mono text-[12px] text-fg-subtle sm:inline-flex">
                    <Clock className="size-3.5" />
                    {s.lastCheck}
                  </span>
                  <Badge tone={s.newItems > 0 ? 'primary' : 'neutral'}>
                    {s.newItems > 0 ? `${s.newItems} ${isRtl ? 'جديد' : 'new'}` : isRtl ? 'لا جديد' : 'no change'}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <p className="mt-4 text-[12.5px] leading-relaxed text-fg-muted">
        {isRtl
          ? 'ما يتغير في هذه الصفحات يصل إلى صندوق العميل المعني بقطاعه فقط، قبل أن يفتح بريده.'
          : 'What changes on these pages reaches the inbox of the clients it binds, and only those, before they open their email.'}
      </p>

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? tb(open.name) : ''}
        subtitle={open ? tb(regulatorById(open.regulator).name) : ''}
        width="max-w-xl"
      >
        {open ? (
          <div className="p-6">
            <div className="flex items-center gap-3">
              <RegulatorChip id={open.regulator} showName />
              <Badge tone={open.newItems > 0 ? 'primary' : 'neutral'} className="ms-auto">
                {open.newItems > 0 ? `${open.newItems} ${isRtl ? 'جديد' : 'new'}` : isRtl ? 'لا جديد' : 'no change'}
              </Badge>
            </div>

            <SectionLabel className="mt-6">{isRtl ? 'كيف تُقرأ الصفحة' : 'How the page is read'}</SectionLabel>
            <div className="divide-y divide-border border-y border-border">
              <Row label={isRtl ? 'العنوان' : 'Address'}>
                <a
                  href={`https://${open.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[12px] text-primary hover:underline dark:text-accent"
                >
                  {open.url}
                  <ExternalLink className="size-3" />
                </a>
              </Row>
              <Row label={isRtl ? 'الطريقة' : 'Method'}>{tb(open.method)}</Row>
              <Row label={isRtl ? 'آخر فحص' : 'Last check'}>
                <span className="font-mono text-[12px]">{open.lastCheck}</span>
              </Row>
              <Row label={isRtl ? 'معرّف المصدر' : 'Source id'}>
                <span className="font-mono text-[12px]">{open.id}</span>
              </Row>
            </div>

            <SectionLabel className="mt-6">{isRtl ? 'من يتأثر' : 'Who it reaches'}</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {SECTORS.filter((sec) => sec.primary === open.regulator || open.regulator === 'sdaia' || open.regulator === 'nca').map((sec) => (
                <span key={sec.id} className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-[12.5px]">
                  {tb(sec.name)} · <span className="font-mono">{sec.population}</span>
                </span>
              ))}
            </div>

            <SectionLabel className="mt-6">{isRtl ? 'ما وصل من هذه الجهة' : 'What came from this regulator'}</SectionLabel>
            {foundHere(open).length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-[12.5px] text-fg-muted">
                {isRtl ? 'لا شيء جديد منذ بدء المراقبة.' : 'Nothing new since the watch began.'}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {foundHere(open).map((a) => (
                  <li key={a.id} className="rounded-lg border border-border bg-surface-2 p-3">
                    <p className="text-[12.5px] font-medium leading-snug">{tb(a.title)}</p>
                    <p className="mt-1 font-mono text-[11px] text-fg-subtle">
                      {a.reference} · {fmtDate(a.issued, lang)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <Button variant="secondary" className="mt-6 w-full" onClick={() => setOpen(null)}>
              {t('common.close')}
            </Button>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
