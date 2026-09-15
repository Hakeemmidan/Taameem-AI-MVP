'use client';

import { useState } from 'react';
import { Check, Filter } from 'lucide-react';
import { PageHeader } from '@/components/features/atoms';
import { FlowBar, NextStep } from '@/components/features/Flow';
import { ObligationCard } from '@/components/features/ObligationCard';
import { Button, Card, CardBody, Empty, Stat } from '@/components/ui/primitives';
import { useLang } from '@/lib/i18n/context';
import { useWorkspace } from '@/lib/store/workspace';
import { worstGap } from '@/data/obligations';
import { scopeObligations } from '@/lib/scope';
import { departmentsOf } from '@/data/org';
import { useWorkspaceSession } from '@/lib/session/context';
import { cn } from '@/lib/utils';
import type { GapSeverity } from '@/lib/types';

type Tab = 'all' | 'pending' | 'confirmed' | 'gaps';

export default function ObligationsPage() {
  const { t, tb, isRtl } = useLang();
  const ws = useWorkspace();
  const { tenant, user, role } = useWorkspaceSession();
  const [tab, setTab] = useState<Tab>('all');
  const [dept, setDept] = useState<string>('all');

  const OBLIGATIONS = scopeObligations(tenant.id, role, user);
  const sources = new Set(OBLIGATIONS.map((o) => o.announcementId)).size;

  const pending = OBLIGATIONS.filter((o) => ws.obligationStatus[o.id] === 'extracted');
  const confirmed = OBLIGATIONS.filter((o) => ws.obligationStatus[o.id] === 'confirmed');
  const serious = OBLIGATIONS.filter((o) => worstGap(o) === 'high');

  const list = OBLIGATIONS.filter((o) => {
    if (dept !== 'all' && o.ownerDept !== dept) return false;
    if (tab === 'pending') return ws.obligationStatus[o.id] === 'extracted';
    if (tab === 'confirmed') return ws.obligationStatus[o.id] === 'confirmed';
    if (tab === 'gaps') return (['high', 'medium'] as GapSeverity[]).includes(worstGap(o));
    return true;
  });

  const tabs: { key: Tab; label: string; n: number }[] = [
    { key: 'all', label: t('common.all'), n: OBLIGATIONS.length },
    { key: 'pending', label: t('obs.extracted'), n: pending.length },
    { key: 'confirmed', label: t('obs.confirmed'), n: confirmed.length },
    { key: 'gaps', label: isRtl ? 'فجوات تحتاج عملاً' : 'Gaps needing work', n: OBLIGATIONS.filter((o) => (['high', 'medium'] as GapSeverity[]).includes(worstGap(o))).length },
  ];

  const usedDepts = departmentsOf(tenant.id).filter((d) => OBLIGATIONS.some((o) => o.ownerDept === d.id));

  return (
    <>
      <FlowBar />

      <PageHeader
        title={t('nav.obligations')}
        subtitle={
          isRtl
            ? 'كل قاعدة استخرجها الذكاء الاصطناعي، وأين تقع داخل منشأتكم.'
            : 'Every rule the AI extracted, and where it lands inside your institution.'
        }
        actions={
          pending.length > 0 && role.can.approveObligations ? (
            <Button variant="primary" onClick={() => ws.confirmAll(pending.map((o) => o.id))}>
              <Check className="size-4" />
              {isRtl ? `اعتماد الكل (${pending.length})` : `Approve all (${pending.length})`}
            </Button>
          ) : null
        }
      />

      {!role.can.approveObligations ? (
        <p className="mb-5 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-[12.5px] text-fg-muted">
          {t('perm.denied')} {t('perm.deniedWho')}
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label={t('dash.obligations')}
          value={OBLIGATIONS.length}
          sub={isRtl ? `من ${sources} تعاميم` : `from ${sources} announcements`}
        />
        <Stat label={t('obs.extracted')} value={pending.length} tone="warn" sub={isRtl ? 'بانتظار قرار إنسان' : 'awaiting a human decision'} />
        <Stat label={t('obs.confirmed')} value={confirmed.length} tone="primary" sub={isRtl ? 'مسجلة باسم من اعتمدها' : 'logged with the approver’s name'} />
        <Stat label={t('gap.high')} value={serious.length} tone="danger" sub={isRtl ? 'تحتاج تغييراً جوهرياً' : 'need a material change'} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((x) => (
          <button
            key={x.key}
            onClick={() => setTab(x.key)}
            className={cn(
              'focus-ring rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition',
              tab === x.key ? 'border-primary bg-primary-soft text-primary dark:text-accent' : 'border-border text-fg-muted hover:bg-bg-soft',
            )}
          >
            {x.label} · {x.n}
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <Filter className="size-3.5 text-fg-subtle" />
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="focus-ring h-8 rounded-lg border border-border bg-surface px-2.5 text-[12.5px] text-fg-muted"
        >
          <option value="all">{t('common.department')}: {t('common.all')}</option>
          {usedDepts.map((d) => (
            <option key={d.id} value={d.id}>
              {tb(d.name)}
            </option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardBody className="p-0">
            <Empty title={t('common.noResults')} />
          </CardBody>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((o, i) => (
            <ObligationCard key={o.id} o={o} index={i} />
          ))}
        </ul>
      )}
      <NextStep />
    </>
  );
}
