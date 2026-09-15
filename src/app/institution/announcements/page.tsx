'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, Radar, TriangleAlert, Upload } from 'lucide-react';
import { PageHeader, RegulatorChip } from '@/components/features/atoms';
import { AnnouncementDetail } from '@/components/features/AnnouncementDetail';
import { FlowBar, NextStep } from '@/components/features/Flow';
import { IngestFlow } from '@/components/features/IngestFlow';
import { UploadedDocView } from '@/components/features/UploadedDocView';
import { Badge, Button, Card, CardBody } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlay';
import { useLang } from '@/lib/i18n/context';
import { useWorkspace, type UploadedDoc } from '@/lib/store/workspace';
import { LIVE_ANNOUNCEMENT, announcementById, announcementsFor } from '@/data/announcements';
import { useWorkspaceSession } from '@/lib/session/context';
import { obligationsFor } from '@/data/obligations';
import { SOURCE_WATCH } from '@/data/console';
import { count, fmtDate, fmtTime, relDays } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AnnouncementsPage() {
  const { t, tb, lang, isRtl } = useLang();
  const ws = useWorkspace();
  const { tenant, sector } = useWorkspaceSession();
  const letters = announcementsFor(sector.id);
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [selected, setSelected] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const [opened, setOpened] = useState<UploadedDoc | null>(null);

  // ?story=1 opens the live letter and starts the read, so the whole flow can
  // be handed over as a single link
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('story')) {
      setSelected(LIVE_ANNOUNCEMENT[tenant.id]);
      setAutoRun(true);
    }
  }, [tenant.id]);

  const current = selected ? announcementById(selected) : null;
  if (current) return <AnnouncementDetail a={current} autoRun={autoRun} onBack={() => setSelected(null)} />;

  const live = announcementById(LIVE_ANNOUNCEMENT[tenant.id])!;
  const watched = SOURCE_WATCH.filter((s) => tenant.regulators.includes(s.regulator));
  const unread = letters.filter((a) => (ws.announcementStatus[a.id] ?? a.status) === 'new').length;

  return (
    <>
      <FlowBar />

      <PageHeader
        title={t('arr.title')}
        subtitle={isRtl ? 'طريقتان لا ثالث لهما. كلاهما ينتهي بنفس القراءة.' : 'Two ways in, and only two. Both end in the same read.'}
      />

      {/* the two ways a letter reaches this desk */}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        {/* 1 · it came on its own */}
        <Card className="relative flex animate-fade-up flex-col overflow-hidden border-primary/40">
          <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-primary" />

          <CardBody className="flex flex-1 flex-col p-5">
            <div className="flex items-center gap-2">
              <span className="relative grid size-2.5 place-items-center">
                <span className="absolute size-2.5 animate-pulse-ring rounded-full bg-primary" />
                <span className="size-2 rounded-full bg-primary" />
              </span>
              <h2 className="text-[15px] font-semibold">{t('arr.auto')}</h2>
              <Badge tone="primary" className="ms-auto">
                {t('arr.justNow')} · {live.received.slice(11, 16)}
              </Badge>
            </div>

            <p className="mt-2 text-[12.5px] leading-relaxed text-fg-muted">{t('arr.autoWhat')}</p>

            {/* the letter itself, not a list of plumbing */}
            <div className="mt-4 rounded-xl border border-border bg-bg-soft p-4">
              <RegulatorChip id={live.regulator} showName />
              <p className="mt-2.5 text-[15px] font-semibold leading-snug">{tb(live.title)}</p>
              <p className="mt-1.5 font-mono text-[11.5px] text-fg-subtle">
                {live.reference} · {count(live.pages, lang, 'pages', 'صفحات', 'صفحة')}
              </p>
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 border-t border-border pt-3 text-[12px]">
                <span>
                  <dt className="inline text-fg-subtle">{isRtl ? 'صدر' : 'Issued'}: </dt>
                  <dd className="inline font-mono font-medium">{fmtDate(live.issued, lang)}</dd>
                </span>
                <span>
                  <dt className="inline text-fg-subtle">{isRtl ? 'يسري' : 'Effective'}: </dt>
                  <dd className="inline font-mono font-medium text-warn">{fmtDate(live.deadline, lang)}</dd>
                  <dd className="inline text-fg-subtle"> · {relDays(live.deadline, lang)}</dd>
                </span>
              </dl>
            </div>

            <Button variant="primary" size="lg" className="mt-4 w-full" onClick={() => setSelected(live.id)}>
              {t('arr.openAuto')}
              <Arrow className="size-4" />
            </Button>

            <p className="mt-auto flex items-center gap-2 pt-4 text-[11.5px] text-fg-subtle">
              <Radar className="size-3.5 shrink-0" />
              {watched.length} {t('arr.watching')} {watched[0]?.lastCheck ?? '06:00'}
              <Clock className="size-3 shrink-0" />
            </p>
          </CardBody>
        </Card>

        {/* 2 · you attach one */}
        <Card className="flex animate-fade-up flex-col overflow-hidden" style={{ animationDelay: '90ms' }}>
          <CardBody className="flex flex-1 flex-col p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-bg-soft text-fg-muted">
                <Upload className="size-4" />
              </span>
              <h2 className="text-[15px] font-semibold">{t('arr.manual')}</h2>
            </div>

            <p className="mt-2 text-[12.5px] leading-relaxed text-fg-muted">{t('arr.manualWhat')}</p>

            <ol className="mt-4 flex flex-col gap-2.5">
              {[
                isRtl ? 'تختار ملف الخطاب من جهازك' : 'You choose the letter file from your machine',
                isRtl ? 'يُقرأ ويُقسَّم إلى قواعد أمامك' : 'It is read and split into rules in front of you',
                isRtl ? 'يدخل الصندوق مع بقية التعاميم' : 'It joins the inbox with the rest',
              ].map((line, i) => (
                <li key={line} className="flex items-start gap-2.5 text-[13px]">
                  <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-bg-soft font-mono text-[10.5px] font-bold text-fg-muted">
                    {i + 1}
                  </span>
                  {line}
                </li>
              ))}
            </ol>

            {ws.extraLetters.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4">
                {ws.extraLetters.map((d) => (
                  <li key={d.id}>
                    <button
                      onClick={() => setOpened(d)}
                      className="focus-ring flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-[12px] transition hover:bg-bg-soft"
                    >
                      <Check className="size-3.5 shrink-0 text-primary dark:text-accent" />
                      <span className="min-w-0 flex-1 truncate text-start font-mono">{d.name}</span>
                      <span className="shrink-0 font-semibold text-primary dark:text-accent">{isRtl ? 'افحصه' : 'Check'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <Button variant="secondary" size="lg" className="mt-auto w-full" onClick={() => setUploadOpen(true)}>
              <Upload className="size-4" />
              {t('arr.uploadNow')}
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* the inbox */}
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="label-xs">
          {t('arr.inbox')} · {tb(sector.name)}
        </p>
        {unread > 0 ? (
          <p className="text-[12px] text-fg-subtle">
            {count(unread, lang, 'not opened yet', 'لم تُفتح بعد', 'لم يُفتح بعد')}
          </p>
        ) : null}
      </div>

      <Card>
        <CardBody className="p-0">
          <ul className="divide-y divide-border">
            {ws.extraLetters.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => setOpened(d)}
                  className="flex w-full items-center gap-4 bg-primary-soft/30 px-5 py-4 text-start transition hover:bg-primary-soft/60"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface font-mono text-[9.5px] font-bold uppercase text-fg-muted">
                    {d.kind}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[13px] font-medium">{d.name}</p>
                    <p className="truncate text-[11.5px] text-fg-subtle">
                      {isRtl ? 'رفعته أنت' : 'You uploaded it'} · {fmtDate(d.at, lang)} {fmtTime(d.at)}
                      {d.readable ? ` · ${count(d.duties, lang, 'carry a duty', 'أجزاء تحمل واجباً', 'جزءاً يحمل واجباً')}` : ''}
                    </p>
                  </div>
                  {d.readable ? (
                    <Badge tone="primary">
                      <Check className="size-3" />
                      {count(d.clauses, lang, 'parts read', 'أجزاء مقروءة', 'جزءاً مقروءاً')}
                    </Badge>
                  ) : (
                    <Badge tone="warn">
                      <TriangleAlert className="size-3" />
                      {isRtl ? 'لم يُقرأ نصه' : 'text not read'}
                    </Badge>
                  )}
                  <span className="shrink-0 text-[12px] font-semibold text-primary dark:text-accent">
                    {isRtl ? 'افحصه' : 'Check it'}
                  </span>
                  <Arrow className="size-4 shrink-0 text-fg-subtle" />
                </button>
              </li>
            ))}

            {letters.map((a) => {
              const status = ws.announcementStatus[a.id] ?? a.status;
              const n = obligationsFor(a.id).filter((o) => o.tenantId === tenant.id).length;
              return (
                <li key={a.id}>
                  <button
                    onClick={() => setSelected(a.id)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-start transition hover:bg-bg-soft"
                  >
                    <RegulatorChip id={a.regulator} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">{tb(a.title)}</p>
                      <p className="mt-0.5 truncate text-[12px] text-fg-subtle">
                        {a.reference} · {fmtDate(a.issued, lang)}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-end md:block">
                      <p className="font-mono text-[11.5px] text-fg-muted">{fmtDate(a.deadline, lang)}</p>
                      <p className="text-[11px] text-fg-subtle">{relDays(a.deadline, lang)}</p>
                    </div>
                    {n > 0 ? (
                      <span className="hidden shrink-0 font-mono text-[12px] text-fg-subtle sm:inline">
                        {count(n, lang, 'rules', 'قواعد', 'قاعدة')}
                      </span>
                    ) : null}
                    <Badge tone={status === 'new' ? 'danger' : status === 'archived' ? 'neutral' : 'primary'}>
                      {t(`ann.${status}` as 'ann.new')}
                    </Badge>
                    <Arrow className="size-4 shrink-0 text-fg-subtle" />
                  </button>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>

      <UploadedDocView doc={opened} onClose={() => setOpened(null)} />

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title={t('arr.uploadNow')} width="max-w-2xl">
        <IngestFlow
          hint={
            isRtl
              ? 'خطاب الجهة الرقابية · PDF أو وورد أو نص. اختر ملف .md أو .txt لترى القراءة الحقيقية سطراً بسطر.'
              : 'A regulator letter · PDF, Word or text. Pick a .md or .txt file to watch the real read, line by line.'
          }
          samples={[
            {
              label: isRtl ? 'تعميم ساما 2026/41' : 'SAMA circular 2026/41',
              path: '/seed-files/01-innovation-bank/03-announcements/SAMA_BC_2026_41_Customer-Complaints-Instructions-2nd-Edition_AR.md',
            },
          ]}
          runLabel={
            isRtl
              ? 'اقرأ الخطاب، وقسّمه إلى قواعد، وأدخله الصندوق.'
              : 'Read the letter, split it into rules, and put it in the inbox.'
          }
          doneLabel={isRtl ? 'دخل الصندوق' : 'It is in the inbox'}
          onAdded={(doc) => ws.addLetter({ ...doc, id: `LT-${Date.now()}`, at: new Date().toISOString() })}
        />
      </Modal>
      <NextStep />
    </>
  );
}
