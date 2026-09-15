'use client';

import { useMemo, useState } from 'react';
import { Check, Clock, Copy, Download, FileSpreadsheet, Lock, Send, TriangleAlert } from 'lucide-react';
import { FlowBar, NextStep } from '@/components/features/Flow';
import { PageHeader, PersonChip, RegulatorChip, SectionLabel } from '@/components/features/atoms';
import { Badge, Button, Card, CardBody, Stat } from '@/components/ui/primitives';
import { useLang } from '@/lib/i18n/context';
import { useWorkspace } from '@/lib/store/workspace';
import { useWorkspaceSession } from '@/lib/session/context';
import { LIVE_ANNOUNCEMENT, announcementById } from '@/data/announcements';
import { regulatorById } from '@/data/regulators';
import { byId, peopleOf } from '@/data/org';
import { scopeObligations, scopeTasks } from '@/lib/scope';
import { buildEvidenceCsv, buildReport, download } from '@/lib/report';
import { fmtDate, fmtTime } from '@/lib/utils';

export default function ReportPage() {
  const { t, tb, lang, isRtl } = useLang();
  const ws = useWorkspace();
  const { tenant, user, role } = useWorkspaceSession();
  const [copied, setCopied] = useState(false);

  const announcement = announcementById(LIVE_ANNOUNCEMENT[tenant.id])!;
  const reg = regulatorById(announcement.regulator);
  const obligations = scopeObligations(tenant.id, role, user);
  const tasks = ws.allTasks;
  const evidence = ws.allEvidence;

  const confirmed = obligations.filter((o) => ws.obligationStatus[o.id] === 'confirmed');
  const pending = obligations.filter((o) => (ws.obligationStatus[o.id] ?? o.status) === 'extracted');
  const tasksDone = tasks.filter((x) => (ws.taskStatus[x.id] ?? x.status) === 'done');

  const sent = ws.reportSentAt !== null;
  const canSend = role.can.sendToRegulator;
  const approver = peopleOf(tenant.id).find((p) => p.role === 'cco');
  const requester = ws.approvalRequestedBy ? byId(ws.approvalRequestedBy) : undefined;
  const sender = ws.reportSentBy ? byId(ws.reportSentBy) : undefined;

  const text = useMemo(
    () =>
      buildReport(
        {
          tenant,
          announcement,
          obligations,
          status: ws.obligationStatus,
          confirmedBy: ws.confirmedBy,
          tasks,
          taskStatus: ws.taskStatus,
          evidence,
          signedBy: ws.reportSentBy ?? user.id,
          sentAt: ws.reportSentAt,
        },
        lang,
      ),
    [
      tenant,
      announcement,
      obligations,
      tasks,
      evidence,
      user.id,
      lang,
      ws.obligationStatus,
      ws.confirmedBy,
      ws.taskStatus,
      ws.reportSentAt,
      ws.reportSentBy,
    ],
  );

  const stem = `${announcement.reference.replace(/\//g, '-')}_${isRtl ? 'تقرير-التنفيذ' : 'implementation-report'}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard blocked: fall back to a file so the report is never trapped
      download(`${stem}.txt`, text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <>
      <FlowBar />

      <PageHeader
        title={t('rep.pageTitle')}
        subtitle={t('rep.pageSub')}
        actions={
          sent ? (
            <Badge tone="primary">
              <Lock className="size-3" />
              {t('rep.locked')}
            </Badge>
          ) : canSend ? (
            <Button
              variant="primary"
              disabled={pending.length > 0}
              title={pending.length > 0 ? t('rep.notReady') : undefined}
              onClick={() => ws.sendReport(announcement.id)}
            >
              <Send className="size-4" />
              {t('rep.approveSend')}
            </Button>
          ) : ws.approvalRequestedAt ? (
            <Badge tone="warn">
              <Clock className="size-3" />
              {t('rep.requested')}
            </Badge>
          ) : (
            <Button variant="primary" disabled={pending.length > 0} title={pending.length > 0 ? t('rep.notReady') : undefined} onClick={() => ws.requestApproval()}>
              <Send className="size-4" />
              {t('rep.requestApproval')}
            </Button>
          )
        }
      />

      {/* the case is closed */}
      {sent ? (
        <Card className="mb-6 animate-fade-up overflow-hidden border-primary/50">
          <CardBody className="flex flex-wrap items-center gap-x-5 gap-y-3 bg-primary-soft/50 p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-fg">
              <Check className="size-6" strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-bold leading-tight text-primary dark:text-accent">{t('rep.closed')}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{t('rep.closedWhat')}</p>
            </div>
            <div className="shrink-0 text-end">
              <p className="label-xs">{t('rep.sentBy')}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <PersonChip id={ws.reportSentBy ?? user.id} size={24} />
              </div>
              <p className="mt-1 font-mono text-[11.5px] text-fg-subtle">
                {fmtDate(ws.reportSentAt!, lang)} {fmtTime(ws.reportSentAt!)}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* why the send button is not yours */}
      {!sent && !canSend ? (
        <Card className="mb-6 animate-fade-up">
          <CardBody className="flex flex-wrap items-center gap-4 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-warn-soft text-warn">
              <Lock className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">{t('rep.cannotSend')}</p>
              {ws.approvalRequestedAt ? (
                <p className="mt-1 text-[12.5px] text-fg-muted">
                  {t('rep.requested')} · {requester ? tb(requester.name) : ''} · {fmtTime(ws.approvalRequestedAt)} ·{' '}
                  {t('rep.pendingApproval')}
                </p>
              ) : (
                <p className="mt-1 text-[12.5px] text-fg-muted">
                  {t('rep.awaiting')} {approver ? tb(approver.name) : ''}
                </p>
              )}
            </div>
            {approver ? <PersonChip id={approver.id} size={28} showTitle /> : null}
          </CardBody>
        </Card>
      ) : null}

      {/* the approver sees who put it up */}
      {!sent && canSend && ws.approvalRequestedAt ? (
        <p className="mb-6 flex animate-fade-up items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-[12.5px]">
          <Clock className="size-4 shrink-0 text-fg-subtle" />
          {t('rep.requested')} · {requester ? tb(requester.name) : ''} · {fmtTime(ws.approvalRequestedAt)}
        </p>
      ) : null}

      {!sent && pending.length > 0 ? (
        <p className="mb-5 flex items-center gap-2 rounded-lg border border-warn/30 bg-warn-soft px-4 py-2.5 text-[12.5px] text-warn">
          <TriangleAlert className="size-4 shrink-0" />
          {t('rep.notReady')}
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t('obs.confirmed')} value={confirmed.length} tone="primary" sub={`${isRtl ? 'من' : 'of'} ${obligations.length}`} />
        <Stat label={t('task.done')} value={tasksDone.length} sub={`${isRtl ? 'من' : 'of'} ${tasks.length}`} />
        <Stat label={isRtl ? 'أدلة مرفقة' : 'Evidence attached'} value={evidence.length} sub={t('ev.sealed')} />
        <Stat
          label={isRtl ? 'الحالة' : 'Status'}
          value={sent ? t('rep.sent') : pending.length ? '—' : ws.approvalRequestedAt ? t('rep.requested') : t('rep.ready')}
          tone={sent ? 'primary' : pending.length ? 'neutral' : 'warn'}
          sub={sent ? `${fmtDate(ws.reportSentAt!, lang)} ${fmtTime(ws.reportSentAt!)}` : tb(reg.name)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* the report itself */}
        <Card className="animate-fade-up overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
            <RegulatorChip id={announcement.regulator} showName />
            <span className="font-mono text-[11.5px] text-fg-subtle">{announcement.reference}</span>
            <Badge tone={sent ? 'primary' : 'accent'} className="ms-auto">
              {sent ? t('rep.sent') : t('rep.aiDrafted')}
            </Badge>
          </div>
          <CardBody className="p-0">
            <pre
              dir="ltr"
              className="max-h-[560px] overflow-auto px-5 py-4 font-mono text-[11.5px] leading-[1.75] text-fg"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {text}
            </pre>
          </CardBody>
        </Card>

        {/* what you can take away */}
        <div className="flex flex-col gap-4">
          <Card className="animate-fade-up" style={{ animationDelay: '80ms' }}>
            <CardBody className="flex flex-col gap-2.5">
              <SectionLabel className="mb-0">{isRtl ? 'خذه معك' : 'Take it with you'}</SectionLabel>

              <Button variant="primary" onClick={copy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? t('rep.copied') : t('rep.copy')}
              </Button>

              <Button variant="secondary" onClick={() => download(`${stem}.txt`, text)}>
                <Download className="size-4" />
                {t('rep.download')}
              </Button>

              <Button
                variant="secondary"
                onClick={() => download(`${stem}_evidence.csv`, buildEvidenceCsv(evidence, tasks), 'text/csv;charset=utf-8')}
              >
                <FileSpreadsheet className="size-4" />
                {t('rep.downloadEvidence')}
              </Button>

              <p className="mt-1 flex items-start gap-2 text-[11.5px] leading-relaxed text-fg-subtle">
                <Lock className="mt-0.5 size-3.5 shrink-0" />
                {isRtl ? 'الملفات تُبنى في متصفحك ولا تمر بأي خادم.' : 'The files are built in your browser and pass through no server.'}
              </p>
            </CardBody>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: '150ms' }}>
            <CardBody>
              <SectionLabel>{t('rep.attachments')}</SectionLabel>
              {evidence.length === 0 ? (
                <p className="text-[12.5px] text-fg-muted">{isRtl ? 'لا أدلة مرفوعة بعد.' : 'No evidence uploaded yet.'}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {evidence.map((e) => (
                    <li key={e.id} className="flex items-center gap-2 text-[11.5px]">
                      <span className="grid size-6 shrink-0 place-items-center rounded bg-bg-soft font-mono text-[8.5px] font-bold uppercase text-fg-muted">
                        {e.kind}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-mono">{e.fileName}</span>
                      <Check className="size-3.5 shrink-0 text-primary dark:text-accent" />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: '220ms' }}>
            <CardBody>
              <SectionLabel>{sent ? t('rep.sentBy') : isRtl ? 'يعتمده ويرسله' : 'Approves and sends'}</SectionLabel>
              <PersonChip id={sent ? (ws.reportSentBy ?? user.id) : (approver?.id ?? user.id)} size={32} showTitle />
              <p className="mt-3 text-[11.5px] leading-relaxed text-fg-subtle">
                {sent && sender ? t('rep.closedWhat') : t('rep.nothingAuto')}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
      <NextStep />
    </>
  );
}
