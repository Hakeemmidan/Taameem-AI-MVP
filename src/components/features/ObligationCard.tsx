'use client';

import { useState } from 'react';
import { CalendarClock, Check, ChevronDown, Sparkles, TriangleAlert, X } from 'lucide-react';
import { Badge, Button } from '@/components/ui/primitives';
import { DeptChip, GapBadge, PersonChip, SectionLabel } from './atoms';
import { useLang } from '@/lib/i18n/context';
import { useWorkspace } from '@/lib/store/workspace';
import { worstGap } from '@/data/obligations';
import { useWorkspaceSession } from '@/lib/session/context';
import { policyById } from '@/data/policies';
import { systemById } from '@/data/systems';
import type { Obligation } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ObligationCard({ o, index }: { o: Obligation; index: number }) {
  const { t, tb, isRtl } = useLang();
  const ws = useWorkspace();
  const { role } = useWorkspaceSession();
  const [open, setOpen] = useState(index === 0);
  const status = ws.obligationStatus[o.id];
  const gap = worstGap(o);
  const low = o.confidence < 0.9;

  return (
    <li
      className={cn(
        'card animate-fade-up overflow-hidden',
        status === 'confirmed' && 'border-primary/40',
        status === 'rejected' && 'opacity-55',
      )}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="flex flex-wrap items-start gap-3 p-4">
        <span className="mt-0.5 shrink-0 rounded-md bg-bg-soft px-2 py-1 font-mono text-[11px] font-bold text-fg-muted">{o.id}</span>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone={o.modality === 'must_not' ? 'danger' : 'primary'}>{t(`mod.${o.modality}` as 'mod.must')}</Badge>
            <GapBadge gap={gap} />
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold', low ? 'bg-warn-soft text-warn' : 'bg-bg-soft text-fg-muted')}>
              {low ? <TriangleAlert className="size-3" /> : null}
              {o.confidence.toFixed(2)}
            </span>
            <span className="font-mono text-[11px] text-fg-subtle">← {o.sourceRef}</span>
          </div>
          <p className="text-[14px] font-medium leading-snug">{tb(o.statement)}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <PersonChip id={o.ownerId} size={20} />
            <DeptChip id={o.ownerDept} />
            <span className="inline-flex items-center gap-1 text-[11.5px] text-fg-subtle">
              <CalendarClock className="size-3.5" />
              {o.mappings.length} {isRtl ? 'ارتباطاً' : 'mappings'}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {status === 'extracted' && role.can.approveObligations ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => ws.rejectObligation(o.id)}>
                <X className="size-3.5" />
                {t('common.reject')}
              </Button>
              <Button size="sm" variant="primary" onClick={() => ws.confirmObligation(o.id)}>
                <Check className="size-3.5" />
                {t('common.approve')}
              </Button>
            </>
          ) : status === 'extracted' ? (
            <Badge tone="warn">{t('obs.extracted')}</Badge>
          ) : (
            <Badge tone={status === 'confirmed' ? 'primary' : 'neutral'}>
              {status === 'confirmed' ? <Check className="size-3" /> : <X className="size-3" />}
              {t(`obs.${status}` as 'obs.confirmed')}
            </Badge>
          )}
          <button onClick={() => setOpen((v) => !v)} className="focus-ring rounded-lg p-1.5 text-fg-subtle hover:bg-bg-soft hover:text-fg" aria-label="details">
            <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface-2 p-4">
          <SectionLabel>{isRtl ? 'أين يقع هذا داخل المنشأة' : 'Where this lands inside the institution'}</SectionLabel>
          <ul className="flex flex-col gap-2.5">
            {o.mappings.map((mp, i) => {
              const target = mp.kind === 'policy' ? policyById(mp.targetId) : mp.kind === 'system' ? systemById(mp.targetId) : undefined;
              const targetName = target ? ('title' in target ? tb(target.title) : tb(target.name)) : mp.targetId;
              return (
                <li key={i} className="rounded-lg border border-border bg-surface p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{mp.kind === 'policy' ? (isRtl ? 'سياسة' : 'Policy') : mp.kind === 'system' ? (isRtl ? 'نظام' : 'System') : isRtl ? 'إجراء' : 'Process'}</Badge>
                    <span className="truncate text-[12.5px] font-semibold">{targetName}</span>
                    <span className="truncate text-[11.5px] text-fg-subtle">· {tb(mp.locator)}</span>
                    <GapBadge gap={mp.gap} className="ms-auto" />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-md border-s-[3px] border-danger/60 bg-danger-soft/40 px-3 py-2">
                      <p className="label-xs text-danger">{isRtl ? 'الوضع الحالي' : 'Today'}</p>
                      <p className="mt-1 text-[12.5px] leading-snug">{tb(mp.current)}</p>
                    </div>
                    <div className="rounded-md border-s-[3px] border-primary/60 bg-primary-soft/50 px-3 py-2">
                      <p className="label-xs text-primary dark:text-accent">{isRtl ? 'المطلوب' : 'Required'}</p>
                      <p className="mt-1 text-[12.5px] leading-snug">{tb(mp.required)}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-fg-muted">
                    <Sparkles className="me-1 inline size-3 -translate-y-px" />
                    {tb(mp.note)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
