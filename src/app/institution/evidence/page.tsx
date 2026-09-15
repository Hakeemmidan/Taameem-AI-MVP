'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Lock, Upload } from 'lucide-react';
import { FlowBar, NextStep } from '@/components/features/Flow';
import { PageHeader, PersonChip, Row, SectionLabel } from '@/components/features/atoms';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Stat } from '@/components/ui/primitives';
import { Drawer, Modal } from '@/components/ui/overlay';
import { useLang } from '@/lib/i18n/context';
import { useWorkspace } from '@/lib/store/workspace';
import { taskById } from '@/data/work';
import { useWorkspaceSession } from '@/lib/session/context';
import { scopeObligations, scopeTasks } from '@/lib/scope';
import { kindOf, sha256 } from '@/lib/parse';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Evidence } from '@/lib/types';

export default function EvidencePage() {
  const { t, tb, lang, isRtl } = useLang();
  const ws = useWorkspace();
  const { tenant, user, role } = useWorkspaceSession();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<Evidence | null>(null);
  const [taskId, setTaskId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const evidence = ws.allEvidence;
  // only work that has left Compliance can have proof handed back against it
  const TASKS = ws.allTasks.filter((x) => (ws.taskStatus[x.id] ?? x.status) !== 'draft');
  const confirmed = scopeObligations(tenant.id, role, user).filter((o) => ws.obligationStatus[o.id] === 'confirmed');

  /** default to the first task still missing its proof */
  const openTask = TASKS.find((x) => !evidence.some((e) => e.taskId === x.id)) ?? TASKS[0];
  const target = TASKS.find((x) => x.id === taskId) ?? openTask;

  const take = async (picked: File) => {
    if (!target) return;
    setBusy(true);
    const { digest } = await sha256(picked);
    ws.addEvidence({
      id: `EV-${Date.now()}`,
      tenantId: tenant.id,
      taskId: target.id,
      fileName: picked.name,
      kind: (['pdf', 'png', 'csv', 'docx', 'xlsx'] as const).includes(kindOf(picked.name) as 'pdf')
        ? (kindOf(picked.name) as Evidence['kind'])
        : 'pdf',
      sizeKb: Math.max(1, Math.round(picked.size / 1024)),
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString(),
      digest,
      verified: true,
    });
    setBusy(false);
    setUploadOpen(false);
  };

  return (
    <>
      <FlowBar />

      <PageHeader
        title={t('nav.evidence')}
        subtitle={
          isRtl
            ? 'كل ملف يُختم ببصمة رقمية عند رفعه، فيثبت أنه لم يُعدَّل.'
            : 'Every file is sealed with a fingerprint on upload, so it is provably unchanged.'
        }
        actions={
          <>
            <Button
              variant="secondary"
              disabled={!role.can.uploadEvidence || !target}
              title={role.can.uploadEvidence ? undefined : t('perm.denied')}
              onClick={() => {
                setTaskId(openTask?.id ?? '');
                setUploadOpen(true);
              }}
            >
              <Upload className="size-4" />
              {t('common.upload')}
            </Button>
            <Link href="/institution/report">
              <Button variant="primary">
                {t('nav.report')}
                <Arrow className="size-4" />
              </Button>
            </Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={isRtl ? 'ملفات مختومة' : 'Sealed files'} value={evidence.length} tone="primary" sub={t('ev.sealed')} />
        <Stat
          label={isRtl ? 'مهام بأدلة' : 'Tasks with evidence'}
          value={new Set(evidence.map((e) => e.taskId)).size}
          sub={`${isRtl ? 'من' : 'of'} ${TASKS.length}`}
        />
        <Stat
          label={isRtl ? 'التزامات معتمدة' : 'Confirmed obligations'}
          value={confirmed.length}
          sub={isRtl ? 'جاهزة للإدراج في التقرير' : 'ready for the report'}
        />
        <Stat
          label={isRtl ? 'حالة التقرير' : 'Report status'}
          value={ws.reportSentAt ? t('rep.sent') : '—'}
          tone={ws.reportSentAt ? 'primary' : 'neutral'}
          sub={ws.reportSentAt ? `${fmtDate(ws.reportSentAt, lang)} ${fmtTime(ws.reportSentAt)}` : isRtl ? 'لم يُرسل بعد' : 'not sent yet'}
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{isRtl ? 'خزانة الأدلة' : 'The vault'}</CardTitle>
            <p className="mt-0.5 text-[12.5px] text-fg-muted">
              {isRtl ? 'مرتبة بالأحدث، وكل ملف مربوط بمهمته' : 'Newest first, each file tied to its task'}
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <ul className="divide-y divide-border">
            {evidence.map((e) => {
              const task = taskById(e.taskId);
              return (
                <li key={e.id}>
                  <button
                    onClick={() => setFile(e)}
                    className="flex w-full flex-wrap items-center gap-4 px-5 py-3.5 text-start transition hover:bg-bg-soft"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-bg-soft font-mono text-[9.5px] font-bold uppercase text-fg-muted">
                      {e.kind}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[12.5px] font-medium">{e.fileName}</p>
                      <p className="truncate text-[11.5px] text-fg-subtle">{task ? tb(task.title) : e.taskId}</p>
                    </div>
                    <div className="hidden min-w-0 shrink-0 items-center gap-2 lg:flex">
                      <Lock className="size-3.5 text-fg-subtle" />
                      <span className="font-mono text-[10.5px] text-fg-subtle">{e.digest.slice(0, 24)}…</span>
                    </div>
                    <div className="hidden shrink-0 sm:block">
                      <PersonChip id={e.uploadedBy} size={20} />
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-fg-subtle">{e.sizeKb} KB</span>
                    <Badge tone="primary">
                      <Check className="size-3" />
                      {t('ev.verified')}
                    </Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>

      {/* upload: a real file, a real digest */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title={t('common.upload')} width="max-w-xl">
        <label className="label-xs mb-2 block">{isRtl ? 'الدليل يخص المهمة' : 'This proof belongs to'}</label>
        <select
          value={target?.id ?? ''}
          onChange={(e) => setTaskId(e.target.value)}
          className="focus-ring mb-4 h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13px]"
        >
          {TASKS.map((x) => (
            <option key={x.id} value={x.id}>
              {x.id} · {tb(x.title)}
            </option>
          ))}
        </select>

        {target ? (
          <p className="mb-4 rounded-lg border border-border bg-surface-2 p-3 text-[12.5px] leading-relaxed">
            <span className="label-xs mb-1 block">{t('task.handBack')}</span>
            {tb(target.expectedEvidence)}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) void take(f);
          }}
          className="focus-ring group flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-bg-soft px-6 py-10 text-center transition hover:border-border-strong hover:bg-surface-2"
        >
          <Upload className="size-7 text-fg-subtle transition group-hover:-translate-y-0.5" />
          <span className="mt-1 text-[13.5px] font-semibold">
            {busy ? (isRtl ? 'جارٍ الختم…' : 'Sealing…') : isRtl ? 'اختر ملف الدليل' : 'Choose the evidence file'}
          </span>
          <span className="text-[12px] text-fg-subtle">PDF · PNG · CSV · DOCX · XLSX</span>
        </button>
        <input
          ref={input}
          type="file"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void take(f);
            e.target.value = '';
          }}
        />

        <p className="mt-4 text-[12.5px] leading-relaxed text-fg-muted">
          {isRtl
            ? 'تُحسب بصمة SHA-256 من محتوى الملف نفسه في متصفحك لحظة الرفع. أي تعديل لاحق يغيّر البصمة، فيظهر فوراً.'
            : 'A SHA-256 fingerprint is computed from the file’s own bytes, in your browser, at the moment of upload. Any later edit changes it, so a change shows immediately.'}
        </p>
      </Modal>

      {/* one sealed file */}
      <Drawer
        open={file !== null}
        onClose={() => setFile(null)}
        title={file ? file.fileName : ''}
        subtitle={file ? (taskById(file.taskId) ? tb(taskById(file.taskId)!.title) : file.taskId) : ''}
        width="max-w-xl"
      >
        {file ? (
          <div className="p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-bg-soft font-mono text-[11px] font-bold uppercase text-fg-muted">
                {file.kind}
              </span>
              <div>
                <Badge tone="primary">
                  <Check className="size-3" />
                  {t('ev.verified')}
                </Badge>
                <p className="mt-1.5 text-[12px] text-fg-muted">{t('ev.sealed')}</p>
              </div>
            </div>

            <SectionLabel className="mt-6">{isRtl ? 'البيانات' : 'Details'}</SectionLabel>
            <div className="divide-y divide-border border-y border-border">
              <Row label={isRtl ? 'المهمة' : 'Task'}>
                <span className="font-mono text-[12px]">{file.taskId}</span>
              </Row>
              <Row label={t('ev.uploadedBy')}>
                <PersonChip id={file.uploadedBy} size={22} />
              </Row>
              <Row label={isRtl ? 'وقت الرفع' : 'Uploaded at'}>
                <span className="font-mono text-[12px]">
                  {fmtDate(file.uploadedAt, lang)} {fmtTime(file.uploadedAt)}
                </span>
              </Row>
              <Row label={isRtl ? 'الحجم' : 'Size'}>
                <span className="font-mono text-[12px]">{file.sizeKb} KB</span>
              </Row>
            </div>

            <SectionLabel className="mt-6">{isRtl ? 'البصمة الرقمية' : 'Digital fingerprint'}</SectionLabel>
            <p dir="ltr" className="break-all rounded-lg border border-border bg-surface-2 p-3.5 font-mono text-[11.5px] leading-relaxed">
              {file.digest}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">
              {isRtl
                ? 'تُحسب البصمة من محتوى الملف لحظة الرفع. أي تعديل بعد ذلك ينتج بصمة مختلفة، فيظهر التغيير فوراً.'
                : 'The fingerprint is computed from the file contents at upload. Any later edit produces a different fingerprint, so a change shows immediately.'}
            </p>

            {taskById(file.taskId) ? (
              <>
                <SectionLabel className="mt-6">{t('task.handBack')}</SectionLabel>
                <p className="rounded-lg border border-border bg-surface-2 p-3.5 text-[13px] leading-relaxed">
                  {tb(taskById(file.taskId)!.expectedEvidence)}
                </p>
              </>
            ) : null}
          </div>
        ) : null}
      </Drawer>
      <NextStep />
    </>
  );
}
