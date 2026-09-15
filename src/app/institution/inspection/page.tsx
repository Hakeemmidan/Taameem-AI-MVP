'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, CircleCheckBig, Download, Quote, ShieldCheck, TriangleAlert, Wrench } from 'lucide-react';
import { DeptChip, PageHeader, PersonChip, RegulatorChip, Row, SectionLabel } from '@/components/features/atoms';
import { AiRunner } from '@/components/features/AiRunner';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Progress, Stat } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlay';
import { useLang } from '@/lib/i18n/context';
import { useWorkspace } from '@/lib/store/workspace';
import { inspectionRun } from '@/lib/ai/script';
import { RULES_BY_REGULATOR, findingsOf, inspectionSummary } from '@/data/work';
import { useWorkspaceSession } from '@/lib/session/context';
import { regulatorById } from '@/data/regulators';
import { libraryStats } from '@/data/policies';
import { systemsOf } from '@/data/systems';
import { headOf } from '@/data/org';
import { taskFromFinding } from '@/lib/fix';
import { fmtDate } from '@/lib/utils';
import type { Finding } from '@/lib/types';
import { cn, count, fmtSarShort } from '@/lib/utils';


export default function InspectionPage() {
  const { t, tb, lang, isRtl } = useLang();
  const ws = useWorkspace();
  const { tenant, role } = useWorkspaceSession();
  const [done, setDone] = useState(() => ws.inspectionRunAt !== null);
  const [fixing, setFixing] = useState<Finding | null>(null);
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const FINDINGS = findingsOf(tenant.id);
  const summary = inspectionSummary(tenant.id);
  const stats = libraryStats(tenant.id);
  const systems = systemsOf(tenant.id);
  const rulesByReg = RULES_BY_REGULATOR[tenant.id] ?? [];

  const low = FINDINGS.reduce((n, f) => n + f.exposureLow, 0);
  const high = FINDINGS.reduce((n, f) => n + f.exposureHigh, 0);
  const serious = FINDINGS.filter((f) => f.severity === 'high');

  return (
    <>
      <PageHeader
        title={t('insp.title')}
        subtitle={
          isRtl
            ? `ضغطة واحدة تفحص كل قواعد ${tenant.regulators.map((r) => regulatorById(r).short.ar).join(' و')} على سياساتكم وأدلتكم.`
            : `One click checks every rule of ${tenant.regulators.map((r) => regulatorById(r).short.en).join(', ')} against your policies and proof.`
        }
      />

      {!role.can.runInspection ? (
        <Card>
          <CardBody>
            <p className="flex items-center gap-2 text-[13px] text-fg-muted">
              <ShieldCheck className="size-4 shrink-0 text-fg-subtle" />
              {t('perm.denied')} {t('perm.deniedWho')}
            </p>
          </CardBody>
        </Card>
      ) : !done ? (
        <AiRunner
          phases={inspectionRun(tenant.id)}
          runLabel={
            isRtl
              ? 'يقرأ كتب الأنظمة السارية ويختبر كل قاعدة على سياساتكم وأدلتكم، ثم يكتب ما سيجده المفتش.'
              : 'Reads the current rulebooks, tests every rule against your policies and evidence, then writes what an inspector would find.'
          }
          onDone={() => {
            setDone(true);
            ws.markInspected();
          }}
          footerNote={
            isRtl
              ? 'لا يخرج شيء من هذا الفحص خارج المنشأة. النتيجة لكم وحدكم.'
              : 'Nothing from this inspection leaves the institution. The result is yours alone.'
          }
        />
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat
              label={t('dash.readiness')}
              value={`${summary.readiness}%`}
              tone="primary"
              sub={
                <>
                  <Progress value={summary.readiness} className="mb-2 mt-0.5" />
                  {isRtl
                    ? `${summary.inOrder} من ${summary.rulesChecked} قاعدة سليمة`
                    : `${summary.inOrder} of ${summary.rulesChecked} rules in order`}
                </>
              }
            />
            <Stat
              label={t('insp.exposure')}
              value={`≈ ${fmtSarShort(high, lang)}`}
              tone="danger"
              sub={`${fmtSarShort(low, lang)} – ${fmtSarShort(high, lang)} · ${t('insp.estimate')}`}
            />
            <Stat label={t('insp.wouldFind')} value={FINDINGS.length} tone="warn" sub={`${serious.length} ${isRtl ? 'منها جوهرية' : 'of them serious'}`} />
            <Stat
              label={isRtl ? 'ما فُحص' : 'What was checked'}
              value={summary.rulesChecked}
              sub={[
                count(stats.clauses, lang, 'clauses', 'بنود', 'بنداً'),
                count(systems.length, lang, 'systems', 'أنظمة', 'نظاماً'),
                count(summary.proofsChecked, lang, 'proofs', 'أدلة', 'دليلاً'),
              ].join(' · ')}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
            {/* what was checked */}
            <div>
              <SectionLabel>{t('insp.checked')}</SectionLabel>
              <Card>
                <CardBody className="flex flex-col gap-3.5">
                  {rulesByReg.map(({ regulator, rules }) => (
                    <div key={regulator} className="flex items-center gap-3">
                      <RegulatorChip id={regulator} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold">
                          {count(rules, lang, 'rules', 'قواعد', 'قاعدة')}
                        </p>
                        <p className="truncate text-[11.5px] text-fg-subtle">{tb(regulatorById(regulator).name)}</p>
                      </div>
                      <CircleCheckBig className="size-4 shrink-0 text-primary dark:text-accent" />
                    </div>
                  ))}
                  <div className="mt-1 border-t border-border pt-3 text-[12.5px] leading-relaxed text-fg-muted">
                    {isRtl
                      ? `${summary.rulesChecked} قاعدة قوبلت بـ ${stats.clauses} بنداً و${summary.proofsChecked} دليلاً · ${summary.inOrder} سليمة`
                      : `${summary.rulesChecked} rules checked against ${stats.clauses} clauses and ${summary.proofsChecked} proofs · ${summary.inOrder} in order`}
                  </div>
                </CardBody>
              </Card>

              <Card className="mt-4 border-primary/40 bg-primary-soft/50">
                <CardBody>
                  <p className="text-[13px] font-semibold leading-snug text-primary dark:text-accent">{t('insp.fixAll')}</p>
                  <Button variant="primary" className="mt-3 w-full">
                    <Download className="size-4" />
                    {t('insp.pack')}
                  </Button>
                </CardBody>
              </Card>
            </div>

            {/* findings */}
            <div>
              <SectionLabel>{t('insp.wouldFind')} · {FINDINGS.length}</SectionLabel>
              <ul className="flex flex-col gap-3">
                {FINDINGS.map((f, i) => (
                  <li
                    key={f.id}
                    className={cn(
                      'card animate-fade-up overflow-hidden border-s-[4px]',
                      f.severity === 'high' ? 'border-s-danger' : f.severity === 'medium' ? 'border-s-warn' : 'border-s-info',
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <RegulatorChip id={f.regulator} />
                        <span className="text-[13.5px] font-semibold">{tb(f.area)}</span>
                        <Badge tone={f.severity === 'high' ? 'danger' : f.severity === 'medium' ? 'warn' : 'info'} className="ms-auto">
                          {t(`gap.${f.severity}` as 'gap.high')}
                        </Badge>
                      </div>
                      <p className="text-[13px] leading-relaxed">{tb(f.statement)}</p>

                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-bg-soft px-3 py-2.5">
                        <Quote className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" />
                        <div className="min-w-0">
                          <p className="label-xs">{t('insp.wouldAsk')}</p>
                          <p className="mt-0.5 text-[12.5px] italic leading-snug">{tb(f.inspectorWouldAsk)}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                        <span className="inline-flex items-center gap-1.5 text-fg-muted">
                          <TriangleAlert className="size-3.5" />
                          <span className="font-mono text-danger">
                            ≈ {fmtSarShort(f.exposureLow, lang)} – {fmtSarShort(f.exposureHigh, lang)}
                          </span>
                          <span className="text-fg-subtle">· {t('insp.estimate')}</span>
                        </span>
                        <span className="text-fg-muted">
                          {t('insp.fixWithin')} <b className="font-mono">{f.fixWithinDays}</b> {t('insp.days')}
                        </span>
                        <DeptChip id={f.ownerDept} />
                      </div>
                    </div>

                    {/* the finding becomes work you can actually walk */}
                    <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface-2 px-4 py-3">
                      {ws.fixedFindings[f.id] ? (
                        <>
                          <Badge tone="primary">
                            <Check className="size-3" strokeWidth={3} />
                            {t('fix.raised')} · {ws.fixedFindings[f.id]}
                          </Badge>
                          <PersonChip id={headOf(tenant.id, f.ownerDept)?.id ?? ''} size={22} />
                          <Link
                            href="/institution/tasks"
                            className="focus-ring ms-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-primary transition hover:bg-primary-soft dark:text-accent"
                          >
                            {t('fix.open')}
                            <Arrow className="size-3.5" />
                          </Link>
                        </>
                      ) : (
                        <>
                          <span className="text-[12px] text-fg-muted">
                            {t('fix.owner')} {tb(headOf(tenant.id, f.ownerDept)?.name ?? { en: '', ar: '' })}
                          </span>
                          <Button
                            size="sm"
                            variant="primary"
                            className="ms-auto"
                            disabled={!role.can.assignTasks}
                            title={role.can.assignTasks ? undefined : t('perm.denied')}
                            onClick={() => setFixing(f)}
                          >
                            <Wrench className="size-3.5" />
                            {t('fix.start')}
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* a finding becomes a task on the board */}
      <Modal
        open={fixing !== null}
        onClose={() => setFixing(null)}
        title={t('fix.title')}
        footer={
          fixing ? (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setFixing(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  ws.fixFinding(fixing.id, taskFromFinding(fixing, tenant.id));
                  setFixing(null);
                }}
              >
                <Wrench className="size-4" />
                {t('fix.raise')}
              </Button>
            </div>
          ) : null
        }
      >
        {fixing ? (
          (() => {
            const task = taskFromFinding(fixing, tenant.id);
            return (
              <>
                <p className="text-[13px] leading-relaxed text-fg-muted">{t('fix.what')}</p>

                <p className="mt-4 rounded-lg border border-border bg-surface-2 p-3.5 text-[13px] font-medium leading-snug">
                  {tb(task.title)}
                </p>

                <div className="mt-4 divide-y divide-border border-y border-border">
                  <Row label={t('fix.owner')}>
                    <PersonChip id={task.assigneeId} size={22} />
                  </Row>
                  <Row label={t('common.department')}>
                    <DeptChip id={task.dept} />
                  </Row>
                  <Row label={t('fix.due')}>
                    <span className="font-mono text-[12px]">
                      {fmtDate(task.due, lang)} · {task.hijri} هـ
                    </span>
                  </Row>
                </div>

                <SectionLabel className="mt-5">{t('task.instructions')}</SectionLabel>
                <ol className="flex flex-col gap-2">
                  {(task.steps ?? []).map((st, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed">
                      <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft font-mono text-[10.5px] font-bold text-primary dark:text-accent">
                        {i + 1}
                      </span>
                      {tb(st)}
                    </li>
                  ))}
                </ol>

                <SectionLabel className="mt-5">{t('fix.proof')}</SectionLabel>
                <p className="rounded-lg border border-primary/40 bg-primary-soft/50 p-3.5 text-[12.5px] leading-relaxed">
                  {tb(task.expectedEvidence)}
                </p>
              </>
            );
          })()
        ) : null}
      </Modal>
    </>
  );
}
