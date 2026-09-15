'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, CircleCheckBig, FileText } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle } from '@/components/ui/primitives';
import { RegulatorChip, SectionLabel } from './atoms';
import { ObligationCard } from './ObligationCard';
import { AiRunner } from './AiRunner';
import { useLang } from '@/lib/i18n/context';
import { useWorkspace } from '@/lib/store/workspace';
import { extractionRun } from '@/lib/ai/script';
import { obligationsFor } from '@/data/obligations';
import { useWorkspaceSession } from '@/lib/session/context';
import type { Announcement } from '@/lib/types';
import { arCount, cn, count, fmtDate, relDays } from '@/lib/utils';

export function AnnouncementDetail({ a, onBack, autoRun = false }: { a: Announcement; onBack: () => void; autoRun?: boolean }) {
  const { t, tb, lang, isRtl } = useLang();
  const Back = isRtl ? ArrowRight : ArrowLeft;
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const ws = useWorkspace();
  const { tenant, role } = useWorkspaceSession();
  const [extracted, setExtracted] = useState(() => !autoRun && ws.announcementStatus[a.id] !== 'new');

  const obligations = useMemo(() => obligationsFor(a.id).filter((o) => o.tenantId === tenant.id), [a.id, tenant.id]);
  const pending = obligations.filter((o) => ws.obligationStatus[o.id] === 'extracted');
  const confirmed = obligations.filter((o) => ws.obligationStatus[o.id] === 'confirmed');
  const sourceRefs = new Set(obligations.map((o) => o.sourceRef));

  const onRunDone = () => {
    setExtracted(true);
    if (ws.announcementStatus[a.id] === 'new') ws.setAnnouncementStatus(a.id, 'review');
  };

  return (
    <>
      <button onClick={onBack} className="focus-ring mb-4 inline-flex items-center gap-1.5 rounded-lg text-[13px] font-medium text-fg-muted hover:text-fg">
        <Back className="size-4" />
        {t('nav.announcements')}
      </button>

      {/* meta */}
      <Card className="mb-6">
        <CardBody className="flex flex-wrap items-start gap-x-8 gap-y-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <RegulatorChip id={a.regulator} showName />
              <Badge tone={ws.announcementStatus[a.id] === 'new' ? 'danger' : 'primary'}>
                {t(`ann.${ws.announcementStatus[a.id]}` as 'ann.new')}
              </Badge>
            </div>
            <h1 className="mt-2.5 text-[20px] font-bold leading-snug">{tb(a.title)}</h1>
            <p className="mt-1 font-mono text-[12px] text-fg-subtle">
              {a.reference} · {count(a.pages, lang, 'pages', 'صفحات', 'صفحة')}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{tb(a.appliesTo)}</p>
          </div>
          <dl className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            {[
              { k: isRtl ? 'صدر في' : 'Issued', v: fmtDate(a.issued, lang) },
              { k: isRtl ? 'وصل' : 'Received', v: fmtDate(a.received, lang) },
              { k: isRtl ? 'يسري في' : 'Effective', v: fmtDate(a.deadline, lang), hi: true },
            ].map((x) => (
              <div key={x.k}>
                <dt className="label-xs">{x.k}</dt>
                <dd className={cn('mt-1 font-mono text-[13px] font-semibold', x.hi && 'text-warn')}>{x.v}</dd>
                {x.hi ? <dd className="text-[11.5px] text-fg-subtle">{relDays(a.deadline, lang)}</dd> : null}
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* the letter itself */}
        <div className="order-2 xl:order-1">
          <SectionLabel>{isRtl ? 'نص التعميم كما ورد' : 'The letter as it arrived'}</SectionLabel>
          <Card>
            <CardHeader className="py-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0 text-fg-subtle" />
                <span className="truncate font-mono text-[11.5px] text-fg-muted">{a.sourceFile}</span>
              </div>
            </CardHeader>
            <CardBody className="max-h-[720px] overflow-y-auto p-0">
              <ol className="divide-y divide-border">
                {a.body.map((p) => {
                  const produced = extracted && sourceRefs.has(p.ref);
                  return (
                    <li key={p.ref} className={cn('px-4 py-3.5 transition-colors', produced && 'bg-primary-soft/45')}>
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="font-mono text-[10.5px] font-bold text-fg-subtle">{p.ref}</span>
                        {produced ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-primary dark:text-accent">
                            <CircleCheckBig className="size-3" />
                            {isRtl ? 'استُخرج منها التزام' : 'rule extracted'}
                          </span>
                        ) : null}
                      </div>
                      <p dir="rtl" lang="ar" className="font-ar text-[13.5px] leading-[1.95] text-fg">
                        {p.text.ar}
                      </p>
                      {lang === 'en' ? <p className="mt-1.5 text-[12px] leading-relaxed text-fg-subtle">{p.text.en}</p> : null}
                    </li>
                  );
                })}
              </ol>
            </CardBody>
          </Card>
        </div>

        {/* the run, then what it produced */}
        <div className="order-1 flex flex-col gap-6 xl:order-2">
          {!extracted ? (
            <AiRunner
              phases={extractionRun(a.id, tenant.id)}
              runLabel={
                isRtl
                  ? 'اقرأ التعميم، تحقق من المصادر الرسمية، وطابقه على سياسات المنشأة وأنظمتها.'
                  : 'Read the letter, check the official sources, and map it onto your policies and systems.'
              }
              onDone={onRunDone}
              autoStart={autoRun}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-bold">
                    {isRtl
                      ? `${arCount(obligations.length, 'التزامات مستخرجة', 'التزاماً مستخرجاً')}`
                      : `${obligations.length} obligations extracted`}
                  </h2>
                  <p className="mt-0.5 text-[12.5px] text-fg-muted">
                    {isRtl
                      ? `${confirmed.length} مؤكد · ${pending.length} بانتظار قرارك`
                      : `${confirmed.length} confirmed · ${pending.length} awaiting your decision`}
                  </p>
                </div>
                {pending.length > 0 && role.can.approveObligations ? (
                  <Button variant="primary" onClick={() => ws.confirmAll(pending.map((o) => o.id))}>
                    <Check className="size-4" />
                    {isRtl ? `اعتماد ${pending.length}` : `Approve ${pending.length}`}
                  </Button>
                ) : (
                  <Link href="/institution/tasks">
                    <Button variant="primary">
                      {t('nav.tasks')}
                      <Arrow className="size-4" />
                    </Button>
                  </Link>
                )}
              </div>

              <ul className="flex flex-col gap-3">
                {obligations.map((o, i) => (
                  <ObligationCard key={o.id} o={o} index={i} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
}
