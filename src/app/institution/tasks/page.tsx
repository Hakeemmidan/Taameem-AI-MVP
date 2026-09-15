'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarClock, Check, CircleAlert, FileCheck2, Mail, Send, TriangleAlert } from 'lucide-react';
import { DeptChip, PageHeader, PersonChip, SectionLabel, SourceQuote } from '@/components/features/atoms';
import { FlowBar, NextStep } from '@/components/features/Flow';
import { Badge, Button, Card, CardBody, Empty, Stat } from '@/components/ui/primitives';
import { Drawer } from '@/components/ui/overlay';
import { useLang } from '@/lib/i18n/context';
import { useWorkspace } from '@/lib/store/workspace';
import { useWorkspaceSession } from '@/lib/session/context';
import { scopeObligations } from '@/lib/scope';
import { obligationById } from '@/data/obligations';
import { announcementById } from '@/data/announcements';
import { byId, dept as deptOf } from '@/data/org';
import { cn, daysFromToday, fmtDate, relDays } from '@/lib/utils';
import type { Task, TaskStatus } from '@/lib/types';

const COLUMNS: TaskStatus[] = ['draft', 'sent', 'in_progress', 'done'];

const TONE: Record<TaskStatus, 'neutral' | 'info' | 'warn' | 'primary' | 'danger'> = {
  draft: 'neutral',
  sent: 'info',
  in_progress: 'warn',
  done: 'primary',
  overdue: 'danger',
};

export default function TasksPage() {
  const { t, tb, lang, isRtl } = useLang();
  const ws = useWorkspace();
  const { tenant, user, role } = useWorkspaceSession();
  const [open, setOpen] = useState<Task | null>(null);

  const TASKS = ws.allTasks;
  const status = (x: Task) => ws.taskStatus[x.id] ?? x.status;
  const evidenceFor = (id: string) => ws.allEvidence.filter((e) => e.taskId === id);

  const done = TASKS.filter((x) => status(x) === 'done').length;
  const sent = TASKS.filter((x) => status(x) !== 'draft').length;
  const late = TASKS.filter((x) => status(x) !== 'done' && status(x) !== 'draft' && daysFromToday(x.due) < 0).length;
  const soonest = [...TASKS].filter((x) => status(x) !== 'done' && status(x) !== 'draft').sort((a, b) => a.due.localeCompare(b.due))[0];

  // a task may go out once the rule behind it has been approved; one raised by
  // the self-inspection belongs to no rule and is already out
  const confirmed = new Set(
    scopeObligations(tenant.id, role, user)
      .filter((o) => ws.obligationStatus[o.id] === 'confirmed')
      .map((o) => o.id),
  );
  const drafts = TASKS.filter((x) => status(x) === 'draft');
  const sendable = drafts.filter((x) => !x.obligationId || confirmed.has(x.obligationId));

  const obligation = open ? obligationById(open.obligationId) : undefined;
  const letter = obligation ? announcementById(obligation.announcementId) : undefined;
  const source = letter?.body.find((b) => b.ref === obligation?.sourceRef);
  const assignee = open ? byId(open.assigneeId) : undefined;

  return (
    <>
      <FlowBar />

      <PageHeader
        title={t('nav.tasks')}
        subtitle={
          isRtl
            ? 'كل التزام معتمد يصبح مهمة، ومعها تعليمات مرقّمة يبدأ بها المسؤول فوراً.'
            : 'Every approved obligation becomes a task, with numbered instructions the owner can start on at once.'
        }
        actions={
          sendable.length > 0 ? (
            <Button
              variant="primary"
              disabled={!role.can.assignTasks}
              title={role.can.assignTasks ? undefined : t('perm.denied')}
              onClick={() => ws.dispatchTasks(sendable.map((x) => x.id))}
            >
              <Send className="size-4" />
              {t('send.action')} ({sendable.length})
            </Button>
          ) : null
        }
      />

      {/* nothing can go out until a person has approved the rule behind it */}
      {drafts.length > 0 && sendable.length === 0 ? (
        <div className="mb-6 flex animate-fade-up flex-wrap items-center gap-4 rounded-xl border border-warn/30 bg-warn-soft px-4 py-3">
          <TriangleAlert className="size-4 shrink-0 text-warn" />
          <p className="min-w-0 flex-1 text-[12.5px] font-medium text-warn">{t('send.blocked')}</p>
          <Link
            href="/institution/obligations"
            className="focus-ring shrink-0 rounded-lg bg-warn px-3 py-1.5 text-[12.5px] font-semibold text-white transition hover:brightness-110"
          >
            {t('send.blockedGo')}
          </Link>
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label={isRtl ? 'إجمالي المهام' : 'Total tasks'}
          value={TASKS.length}
          sub={`${new Set(TASKS.map((x) => x.dept)).size} ${isRtl ? 'إدارات' : 'departments'}`}
        />
        <Stat
          label={t('send.sentNow')}
          value={sent}
          tone={sent === 0 ? 'neutral' : 'info'}
          sub={`${isRtl ? 'من' : 'of'} ${TASKS.length}`}
        />
        <Stat label={t('task.done')} value={done} tone="primary" sub={isRtl ? 'بأدلة مرفوعة ومختومة' : 'with evidence sealed'} />
        <Stat label={t('task.in_progress')} value={TASKS.filter((x) => status(x) === 'in_progress').length} tone="warn" />
        <Stat
          label={isRtl ? 'أقرب موعد' : 'Next deadline'}
          value={soonest ? fmtDate(soonest.due, lang) : '—'}
          tone={late ? 'danger' : 'neutral'}
          sub={
            soonest ? (
              <span className="inline-flex items-center gap-1.5">
                <PersonChip id={soonest.assigneeId} size={16} />
                <span className="text-fg-subtle">{relDays(soonest.due, lang)}</span>
              </span>
            ) : undefined
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = TASKS.filter((x) => status(x) === col);
          return (
            <section key={col}>
              <div className="mb-2.5 flex items-center gap-2">
                <span
                  className={cn(
                    'size-2 rounded-full',
                    col === 'done' ? 'bg-primary' : col === 'in_progress' ? 'bg-warn' : col === 'sent' ? 'bg-info' : 'bg-fg-subtle',
                  )}
                />
                <h2 className="text-[13px] font-semibold">{col === 'draft' ? t('send.title') : t(`task.${col}` as 'task.sent')}</h2>
                <span className="font-mono text-[12px] text-fg-subtle">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {items.length === 0 ? (
                  <Card>
                    <CardBody className="p-0">
                      <Empty
                        title={t('send.none')}
                        hint={col === 'draft' ? undefined : col === 'sent' ? t('send.startHere') : undefined}
                      />
                    </CardBody>
                  </Card>
                ) : (
                  items.map((x, i) => {
                    const overdue = status(x) !== 'done' && daysFromToday(x.due) < 0;
                    const ev = evidenceFor(x.id).length;
                    return (
                      <button
                        key={x.id}
                        onClick={() => setOpen(x)}
                        className="card animate-fade-up p-3.5 text-start transition hover:-translate-y-0.5 hover:shadow-pop"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-mono text-[10.5px] font-bold text-fg-subtle">{x.id}</span>
                          <DeptChip id={x.dept} />
                          {ev > 0 ? (
                            <span className="ms-auto inline-flex items-center gap-1 text-[11px] text-primary dark:text-accent">
                              <FileCheck2 className="size-3.5" />
                              {ev}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[13px] font-medium leading-snug">{tb(x.title)}</p>
                        {x.steps?.length ? (
                          <p className="mt-1.5 text-[11.5px] text-fg-subtle">
                            {isRtl ? `${x.steps.length} خطوات موضحة` : `${x.steps.length} steps spelled out`}
                          </p>
                        ) : null}
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                          <PersonChip id={x.assigneeId} size={20} />
                          <span className={cn('inline-flex items-center gap-1 font-mono text-[11px]', overdue ? 'text-danger' : 'text-fg-subtle')}>
                            {overdue ? <CircleAlert className="size-3" /> : <CalendarClock className="size-3" />}
                            {fmtDate(x.due, lang)}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? tb(open.title) : ''}
        subtitle={open ? `${open.id} · ${tb(deptOf(tenant.id, open.dept)!.name)}` : ''}
        footer={
          open ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[12px] text-fg-muted">{relDays(open.due, lang)}</span>
              {ws.taskStatus[open.id] !== 'done' ? (
                <Button
                  variant="primary"
                  disabled={!role.can.uploadEvidence}
                  title={role.can.uploadEvidence ? undefined : t('perm.denied')}
                  onClick={() => {
                    ws.setTaskStatus(open.id, 'done');
                    setOpen(null);
                  }}
                >
                  <Send className="size-4" />
                  {t('task.markDone')}
                </Button>
              ) : (
                <Badge tone="primary">{t('task.done')}</Badge>
              )}
            </div>
          ) : null
        }
      >
        {open ? (
          <div className="p-6">
            {/* the message that actually reached the person */}
            <SectionLabel>{t('task.received')}</SectionLabel>
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-surface-2 px-4 py-2.5">
                <Mail className="size-3.5 shrink-0 text-fg-subtle" />
                <span className="text-[11.5px] text-fg-subtle">{t('task.notify')}</span>
                <PersonChip id={open.assigneeId} size={20} />
                {assignee ? <span className="font-mono text-[11px] text-fg-subtle">{assignee.email}</span> : null}
              </div>
              <div className="p-4">
                <p className="text-[13.5px] font-semibold leading-snug">{tb(open.title)}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{tb(open.detail)}</p>
                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[12px]">
                  <span>
                    <dt className="inline text-fg-subtle">{t('common.due')}: </dt>
                    <dd className="inline font-mono font-medium">
                      {fmtDate(open.due, lang)} · {open.hijri} هـ
                    </dd>
                  </span>
                  <span>
                    <dt className="inline text-fg-subtle">{t('common.source')}: </dt>
                    <dd className="inline font-mono font-medium">
                      {open.obligationId}
                      {letter ? ` · ${letter.reference}` : ''}
                    </dd>
                  </span>
                </dl>
              </div>
            </div>

            {/* exactly what to do */}
            <SectionLabel className="mt-6">{t('task.instructions')}</SectionLabel>
            {open.steps?.length ? (
              <ol className="flex flex-col gap-2.5">
                {open.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex animate-fade-up items-start gap-3 rounded-lg border border-border bg-surface p-3"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft font-mono text-[11px] font-bold text-primary dark:text-accent">
                      {i + 1}
                    </span>
                    <span className="text-[13px] leading-relaxed">{tb(s)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-[12.5px] text-fg-muted">
                {isRtl ? 'لا تعليمات مسجلة لهذه المهمة.' : 'No instructions recorded for this task.'}
              </p>
            )}

            {/* what to hand back */}
            <SectionLabel className="mt-6">{t('task.handBack')}</SectionLabel>
            <p className="flex items-start gap-2.5 rounded-lg border border-primary/40 bg-primary-soft/50 p-3.5 text-[13px] leading-relaxed">
              <Check className="mt-0.5 size-4 shrink-0 text-primary dark:text-accent" strokeWidth={3} />
              {tb(open.expectedEvidence)}
            </p>

            {/* why it landed here */}
            <SectionLabel className="mt-6">{t('task.why')}</SectionLabel>
            {obligation ? (
              <>
                <p className="mb-2.5 text-[13px] leading-relaxed">{tb(obligation.statement)}</p>
                {source ? <SourceQuote ar={source.text.ar} sourceRef={`${letter?.reference} · ${obligation.sourceRef}`} /> : null}
              </>
            ) : null}

            {/* what came back */}
            {evidenceFor(open.id).length > 0 ? (
              <>
                <SectionLabel className="mt-6">{isRtl ? 'المرفوع' : 'Uploaded'}</SectionLabel>
                <ul className="flex flex-col gap-2">
                  {evidenceFor(open.id).map((e) => (
                    <li key={e.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-bg-soft font-mono text-[9px] font-bold uppercase text-fg-muted">
                        {e.kind}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[12px]">{e.fileName}</p>
                        <p className="truncate font-mono text-[10.5px] text-fg-subtle">{e.digest.slice(0, 32)}…</p>
                      </div>
                      <Badge tone="primary">{t('ev.verified')}</Badge>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <div className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-[12px] text-fg-subtle">
              <span>{t('common.status')}</span>
              <Badge tone={TONE[ws.taskStatus[open.id] ?? open.status]}>
                {t(`task.${ws.taskStatus[open.id] ?? open.status}` as 'task.sent')}
              </Badge>
            </div>
          </div>
        ) : null}
      </Drawer>
      <NextStep />
    </>
  );
}
