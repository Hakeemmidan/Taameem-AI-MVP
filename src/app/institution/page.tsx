'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookText, Check, Inbox, RotateCcw, ShieldCheck } from 'lucide-react';
import { FlowRail } from '@/components/features/Flow';
import { PageHeader } from '@/components/features/atoms';
import { Button, Card, Progress, Stat } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlay';
import { useLang } from '@/lib/i18n/context';
import { useWorkspaceSession } from '@/lib/session/context';
import { useWorkspace } from '@/lib/store/workspace';
import { useProgress } from '@/lib/store/progress';
import { FLOW, stepOf } from '@/lib/flow';
import { LIVE_ANNOUNCEMENT, announcementById } from '@/data/announcements';
import { inspectionSummary } from '@/data/work';
import { libraryStats } from '@/data/policies';
import { scopeObligations, scopeTasks } from '@/lib/scope';
import { count, fmtDate } from '@/lib/utils';

export default function Journey() {
  const { t, tb, isRtl, lang } = useLang();
  const { tenant, user, role } = useWorkspaceSession();
  const ws = useWorkspace();
  const { current, doneCount, total, percent } = useProgress();
  const [resetOpen, setResetOpen] = useState(false);
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const live = announcementById(LIVE_ANNOUNCEMENT[tenant.id])!;
  const summary = inspectionSummary(tenant.id);
  const stats = libraryStats(tenant.id);
  const obligations = scopeObligations(tenant.id, role, user);
  const tasks = ws.allTasks;
  const openTasks = tasks.filter((x) => (ws.taskStatus[x.id] ?? x.status) !== 'done').length;

  const step = stepOf(current);

  return (
    <>
      <PageHeader
        title={t('flow.title')}
        subtitle={`${tb(tenant.name)} · ${isRtl ? 'تابع المسار من الخطوة الأولى إلى السابعة' : 'follow it from step one to step seven'}`}
        actions={
          <Button variant="ghost" size="sm" onClick={() => setResetOpen(true)}>
            <RotateCcw className="size-3.5" />
            {t('flow.restart')}
          </Button>
        }
      />

      {/* where you are, and the one thing to do next */}
      {doneCount === total ? (
        <Card className="mb-6 animate-fade-up overflow-hidden border-primary/50">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 bg-primary-soft/50 p-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-fg">
              <Check className="size-7" strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[19px] font-bold leading-tight text-primary dark:text-accent">{t('flow.complete')}</h2>
              <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-fg-muted">{t('flow.completeWhat')}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link href="/institution/report">
                <Button variant="primary" size="lg">
                  {t('flow.seeReport')}
                  <Arrow className="size-4" />
                </Button>
              </Link>
              <Button variant="secondary" size="lg" onClick={() => setResetOpen(true)}>
                <RotateCcw className="size-4" />
                {t('flow.restart')}
              </Button>
            </div>
          </div>
          <Progress value={100} className="h-1 rounded-none" animate={false} />
        </Card>
      ) : (
        <Card className="mb-6 animate-fade-up overflow-hidden">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 p-5">
            <div className="min-w-0 flex-1">
              <p className="label-xs">
                {t('flow.subtitle')} {step.n} {t('flow.of')} {total}
              </p>
              <h2 className="mt-1.5 text-[19px] font-bold leading-tight">{tb(step.title)}</h2>
              <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-fg-muted">{tb(step.what)}</p>
            </div>

            <div className="flex shrink-0 items-center gap-5">
              <div className="text-center">
                <p className="font-mono text-[26px] font-bold leading-none text-primary dark:text-accent">
                  {doneCount}
                  <span className="text-[15px] text-fg-subtle">/{total}</span>
                </p>
                <p className="mt-1 text-[11px] text-fg-subtle">{t('flow.done')}</p>
              </div>
              <Link href={step.href}>
                <Button variant="primary" size="lg">
                  {t('flow.open')}
                  <Arrow className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
          <Progress value={percent} className="h-1 rounded-none" />
        </Card>
      )}

      {/* the seven steps */}
      <FlowRail />

      {/* the letter this run is about, and the library behind it */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Link
          href="/institution/announcements"
          className="card group flex animate-fade-up items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-pop"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary dark:text-accent">
            <Inbox className="size-[22px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="label-xs">{t('arr.inbox')}</p>
            <p className="mt-1 truncate text-[14.5px] font-semibold">{tb(live.title)}</p>
            <p className="mt-0.5 truncate text-[12px] text-fg-subtle">
              {live.reference} · {fmtDate(live.issued, lang)} · {count(live.pages, lang, 'pages', 'صفحات', 'صفحة')}
            </p>
          </div>
          <Arrow className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </Link>

        <Link
          href="/institution/policies"
          className="card group flex animate-fade-up items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-pop"
          style={{ animationDelay: '80ms' }}
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-bg-soft text-fg-muted">
            <BookText className="size-[22px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="label-xs">{t('flow.setup')}</p>
            <p className="mt-1 truncate text-[14.5px] font-semibold">{t('nav.policies')}</p>
            <p className="mt-0.5 truncate text-[12px] text-fg-subtle">
              {count(stats.policies, lang, 'policies', 'سياسات', 'سياسة')} ·{' '}
              {count(stats.clauses, lang, 'clauses', 'بنود', 'بنداً')}
            </p>
          </div>
          <Arrow className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </Link>
      </div>

      {/* the numbers behind the run */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t('dash.obligations')} value={obligations.length} sub={isRtl ? 'من هذا التعميم' : 'from this letter'} />
        <Stat
          label={isRtl ? 'مهام مفتوحة' : 'Open tasks'}
          value={openTasks}
          tone={openTasks > 6 ? 'warn' : 'neutral'}
          sub={`${new Set(tasks.map((x) => x.dept)).size} ${isRtl ? 'إدارات' : 'departments'}`}
        />
        <Stat label={isRtl ? 'أدلة مختومة' : 'Sealed proofs'} value={ws.allEvidence.length} tone="primary" sub={t('ev.sealed')} />
        <Stat
          label={t('dash.readiness')}
          value={`${summary.readiness}%`}
          sub={
            <Link
              href="/institution/inspection"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline dark:text-accent"
            >
              <ShieldCheck className="size-3.5" />
              {t('nav.inspection')}
            </Link>
          }
        />
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={t('flow.restart')}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                ws.reset();
                setResetOpen(false);
              }}
            >
              <RotateCcw className="size-4" />
              {t('flow.restart')}
            </Button>
          </div>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-fg-muted">{t('flow.restartHint')}</p>
        <ul className="mt-4 flex flex-col gap-1.5 text-[12.5px] text-fg-muted">
          {FLOW.map((s) => (
            <li key={s.key} className="flex items-center gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-bg-soft font-mono text-[10px] font-bold">{s.n}</span>
              {tb(s.title)}
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
