'use client';

import { useState } from 'react';
import { BookText, CircleCheckBig, FileUp, Search } from 'lucide-react';
import { PageHeader, RegulatorChip, SectionLabel } from '@/components/features/atoms';
import { Badge, Button, Card, CardBody, Empty, Stat } from '@/components/ui/primitives';
import { Drawer, Modal } from '@/components/ui/overlay';
import { IngestFlow } from '@/components/features/IngestFlow';
import { UploadedDocView } from '@/components/features/UploadedDocView';
import { useLang } from '@/lib/i18n/context';
import { useWorkspace, type UploadedDoc } from '@/lib/store/workspace';
import { libraryStats, policiesOf, policyClauses } from '@/data/policies';
import { dept as deptOf } from '@/data/org';
import { useWorkspaceSession } from '@/lib/session/context';

import { cn, fmtDate } from '@/lib/utils';
import type { Policy } from '@/lib/types';

export default function PoliciesPage() {
  const { t, tb, lang, isRtl } = useLang();
  const ws = useWorkspace();
  const [open, setOpen] = useState<Policy | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [q, setQ] = useState('');
  const [opened, setOpened] = useState<UploadedDoc | null>(null);
  const { tenant, role } = useWorkspaceSession();

  const POLICIES = policiesOf(tenant.id);
  const stats = libraryStats(tenant.id);

  const list = POLICIES.filter((p) => {
    if (!q.trim()) return true;
    const hay = `${tb(p.title)} ${p.code} ${policyClauses(p).map((c) => tb(c.text)).join(' ')}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <>
      <PageHeader
        title={t('pol.library')}
        subtitle={
          isRtl
            ? 'سياساتكم وبنودها ومالكوها. هذا ما يُقارن به كل تعميم جديد.'
            : 'Your policies, their clauses and their owners. Every new letter is compared against this.'
        }
        actions={
          <Button
            variant="primary"
            disabled={!role.can.editPolicies}
            title={role.can.editPolicies ? undefined : t('perm.denied')}
            onClick={() => setUploadOpen(true)}
          >
            <FileUp className="size-4" />
            {t('pol.upload')}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t('pol.library')} value={stats.policies + ws.extraLibrary.length} sub={isRtl ? 'سياسة مفهرسة' : 'policies indexed'} />
        <Stat label={t('pol.clauses')} value={stats.clauses + ws.extraLibrary.reduce((n, x) => n + x.clauses, 0)} tone="primary" sub={isRtl ? 'قابلة للاستشهاد برقمها' : 'each quotable by its reference'} />
        <Stat label={isRtl ? 'إدارات مالكة' : 'Owning departments'} value={stats.owners} />
        <Stat label={isRtl ? 'جهات رقابية مغطاة' : 'Regulators covered'} value={new Set(POLICIES.flatMap((p) => p.regulators)).size} />
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-surface px-3">
        <Search className="size-4 shrink-0 text-fg-subtle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={isRtl ? 'ابحث في نصوص البنود…' : 'Search inside clause text…'}
          className="h-10 w-full bg-transparent text-[13.5px] outline-none placeholder:text-fg-subtle"
        />
        {q ? <span className="shrink-0 font-mono text-[11.5px] text-fg-subtle">{list.length}</span> : null}
      </div>

      {ws.extraLibrary.length > 0 ? (
        <>
          <SectionLabel>{isRtl ? 'مرفوع في هذه الجلسة' : 'Uploaded this session'}</SectionLabel>
          <Card className="mb-6">
            <CardBody className="p-0">
              <ul className="divide-y divide-border">
                {ws.extraLibrary.map((d) => (
                  <li key={d.id}>
                    <button
                      onClick={() => setOpened(d)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-start transition hover:bg-bg-soft"
                    >
                      <CircleCheckBig className="size-4 shrink-0 text-primary dark:text-accent" />
                      <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{d.name}</span>
                      <span className="shrink-0 text-[12px] text-fg-muted">
                        {d.clauses} {t('pol.clauses')}
                      </span>
                      <span className="shrink-0 text-[12px] font-semibold text-primary dark:text-accent">
                        {isRtl ? 'افحصه' : 'Check it'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </>
      ) : null}

      {list.length === 0 ? (
        <Card><CardBody className="p-0"><Empty title={t('common.noResults')} /></CardBody></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setOpen(p)}
              className="card animate-fade-up flex flex-col p-5 text-start transition hover:-translate-y-0.5 hover:shadow-pop"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary dark:text-accent">
                  <BookText className="size-[18px]" />
                </span>
                <span className="font-mono text-[11px] text-fg-subtle">{p.code}</span>
                <span className="ms-auto flex gap-1">
                  {p.regulators.map((r) => (
                    <RegulatorChip key={r} id={r} />
                  ))}
                </span>
              </div>
              <h3 className="text-[14.5px] font-semibold leading-snug">{tb(p.title)}</h3>
              <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-fg-muted">{tb(p.summary)}</p>
              <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-[11.5px] text-fg-subtle">
                <span>v{p.version}</span>
                <span>{policyClauses(p).length} {t('pol.clauses')}</span>
                <span>{tb(deptOf(tenant.id, p.owner)!.short)}</span>
              </dl>
            </button>
          ))}
        </div>
      )}

      <UploadedDocView doc={opened} onClose={() => setOpened(null)} />

      {/* clause viewer */}
      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? tb(open.title) : ''}
        subtitle={open ? `${open.code} · v${open.version}` : ''}
        width="max-w-3xl"
      >
        {open ? (
          <div className="p-6">
            <dl className="mb-6 grid gap-x-8 gap-y-3 sm:grid-cols-3">
              {[
                { k: t('pol.approvedBy'), v: tb(open.approvedBy) },
                { k: t('pol.effective'), v: fmtDate(open.effective, lang) },
                { k: t('pol.nextReview'), v: fmtDate(open.nextReview, lang) },
              ].map((x) => (
                <div key={x.k}>
                  <dt className="label-xs">{x.k}</dt>
                  <dd className="mt-1 text-[12.5px] font-medium">{x.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mb-6 rounded-lg border border-border bg-surface-2 p-3.5 text-[13px] leading-relaxed text-fg-muted">{tb(open.summary)}</p>

            {open.sections.map((s) => (
              <section key={s.ref} className="mb-6">
                <h3 className="mb-2.5 text-[14px] font-bold">
                  <span className="me-2 font-mono text-fg-subtle">{s.ref}</span>
                  {tb(s.heading)}
                </h3>
                <ul className="flex flex-col gap-2">
                  {s.clauses.map((c) => (
                    <li key={c.ref} className="rounded-lg border border-border bg-surface p-3.5">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-primary dark:text-accent">{c.ref}</span>
                        <span className="text-[12.5px] font-semibold">{tb(c.heading)}</span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-fg-muted">{tb(c.text)}</p>
                      <p
                        dir={isRtl ? 'ltr' : 'rtl'}
                        lang={isRtl ? 'en' : 'ar'}
                        className={cn('mt-1.5 border-t border-border pt-1.5 text-[11.5px] leading-relaxed text-fg-subtle', !isRtl && 'font-ar')}
                      >
                        {isRtl ? c.text.en : c.text.ar}
                      </p>
                      {c.tags.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {c.tags.slice(0, 5).map((tag) => (
                            <span key={tag} className="rounded bg-bg-soft px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : null}
      </Drawer>

      {/* upload + ingest */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title={t('pol.upload')} width="max-w-2xl">
        <p className="mb-4 text-[13px] leading-relaxed text-fg-muted">{t('pol.uploadHint')}</p>
        <IngestFlow
          hint={
            isRtl
              ? 'سياسة داخلية · PDF أو وورد أو نص. اختر ملف .md لترى العدّ الحقيقي للأقسام والبنود.'
              : 'An internal policy · PDF, Word or text. Pick a .md file to see the real section and clause count.'
          }
          samples={[
            {
              label: isRtl ? 'سياسة الشكاوى' : 'Complaints policy',
              path: '/seed-files/01-innovation-bank/01-policies/POL-CMP-004_Customer-Complaints-Handling-Policy_v4.1.md',
            },
            {
              label: isRtl ? 'سياسة الإسناد' : 'Outsourcing policy',
              path: '/seed-files/01-innovation-bank/01-policies/POL-OUT-005_Outsourcing-and-Cloud-Policy_v5.1.md',
            },
          ]}
          runLabel={
            isRtl ? 'اقرأ السياسة، وقسّمها إلى بنود، وافهرسها.' : 'Read the policy, split it into clauses, and index it.'
          }
          doneLabel={t('up.addedTo')}
          onAdded={(doc) => ws.addLibraryDoc({ ...doc, id: `UP-${Date.now()}`, at: new Date().toISOString() })}
        />
      </Modal>
    </>
  );
}
