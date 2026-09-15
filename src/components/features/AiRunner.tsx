'use client';

import { useEffect, useRef } from 'react';
import {
  BookOpenText,
  Check,
  CircleCheckBig,
  ExternalLink,
  FileSearch,
  GitCompareArrows,
  Globe,
  PenLine,
  Search,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { Button, Progress } from '@/components/ui/primitives';
import { useLang } from '@/lib/i18n/context';
import type { RunPhase } from '@/lib/ai/script';
import { useRunner } from '@/lib/ai/useRunner';
import { cn } from '@/lib/utils';

const PHASE_ICON = {
  read: BookOpenText,
  search: Search,
  match: GitCompareArrows,
  draft: PenLine,
  check: CircleCheckBig,
} as const;

const LINE_TONE = {
  ok: 'text-fg',
  muted: 'text-fg-subtle',
  warn: 'text-warn',
  active: 'text-primary dark:text-accent',
} as const;

export function AiRunner({
  phases,
  runLabel,
  onDone,
  autoStart = false,
  className,
  footerNote,
}: {
  phases: RunPhase[];
  runLabel: string;
  onDone?: () => void;
  autoStart?: boolean;
  className?: string;
  footerNote?: string;
}) {
  const { t, tb } = useLang();
  const r = useRunner(phases, onDone);
  const started = useRef(false);

  useEffect(() => {
    if (autoStart && !started.current) {
      started.current = true;
      r.start();
    }
  }, [autoStart, r]);

  const searchPhase = phases.find((p) => p.search);
  const searching = r.activePhase?.search !== undefined;

  return (
    <div className={cn('card overflow-hidden', className)}>
      {/* header */}
      <div className="flex items-center gap-3 border-b border-border bg-surface-2 px-5 py-3.5">
        <span className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-fg">
          <Sparkles className="size-4" />
          {r.state === 'running' ? (
            <span className="absolute inset-0 animate-pulse-ring rounded-lg border-2 border-primary" aria-hidden />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold leading-tight">{t('ai.title')}</p>
          <p className="truncate text-[12px] text-fg-muted">
            {r.state === 'idle' ? runLabel : r.state === 'done' ? t('ai.done') : tb(r.activePhase?.label)}
          </p>
        </div>
        {r.state === 'idle' ? (
          <Button variant="primary" size="sm" onClick={r.start}>
            <Sparkles className="size-4" />
            {t('ai.run')}
          </Button>
        ) : r.state === 'running' ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] font-bold tabular-nums text-primary dark:text-accent">{r.progress}%</span>
            <Button variant="ghost" size="sm" onClick={r.finish}>
              {t('common.next')}
            </Button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[12px] font-semibold text-primary dark:text-accent">
            <Check className="size-3.5" />
            {t('ai.done')}
          </span>
        )}
      </div>

      {r.state !== 'idle' ? <Progress value={r.progress} animate={false} className="h-1 rounded-none" /> : null}

      <div className="grid gap-0 md:grid-cols-[210px_1fr]">
        {/* phase rail */}
        <ol className="flex gap-3 overflow-x-auto border-b border-border p-4 md:flex-col md:gap-0 md:overflow-visible md:border-b-0 md:border-e">
          {phases.map((p, i) => {
            const Icon = PHASE_ICON[p.icon];
            const active = r.state === 'running' && i === r.phaseIndex;
            const complete = r.state === 'done' || i < r.phaseIndex;
            return (
              <li key={p.key} className="flex shrink-0 items-start gap-2.5 md:py-1.5">
                <span className="relative flex flex-col items-center">
                  <span
                    className={cn(
                      'grid size-7 shrink-0 place-items-center rounded-full border-2 transition',
                      complete
                        ? 'border-primary bg-primary text-primary-fg'
                        : active
                          ? 'border-primary bg-primary-soft text-primary dark:text-accent'
                          : 'border-border bg-surface text-fg-subtle',
                    )}
                  >
                    {complete ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                    {active ? <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-primary" aria-hidden /> : null}
                  </span>
                  {i < phases.length - 1 ? (
                    <span className={cn('hidden w-0.5 flex-1 md:block', complete ? 'bg-primary' : 'bg-border')} style={{ minHeight: 18 }} />
                  ) : null}
                </span>
                <span
                  className={cn(
                    'pt-1 text-[12.5px] font-medium leading-tight',
                    complete || active ? 'text-fg' : 'text-fg-subtle',
                  )}
                >
                  {tb(p.label)}
                </span>
              </li>
            );
          })}
        </ol>

        {/* log */}
        <div className="min-h-[248px] p-4">
          {r.state === 'idle' ? (
            <div className="grid h-full place-items-center px-6 py-8 text-center">
              <div>
                <FileSearch className="mx-auto size-7 text-fg-subtle" />
                <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-fg-muted">{runLabel}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {r.lines.map(({ key, line }) => (
                <p key={key} className={cn('animate-fade-up text-[12.5px] leading-relaxed', LINE_TONE[line.tone ?? 'ok'])}>
                  <span className="me-2 inline-block font-mono text-[10.5px] text-fg-subtle">›</span>
                  {line.tone === 'warn' ? <TriangleAlert className="me-1 inline size-3.5 -translate-y-px" /> : null}
                  {tb(line.text)}
                </p>
              ))}

              {/* the search block: looks like a real lookup, because that is what it stands for */}
              {searchPhase && r.hits.length > 0 ? (
                <div className="mt-2 rounded-lg border border-border bg-surface-2 p-3">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <Globe className={cn('size-3.5 text-fg-subtle', searching && 'animate-spin')} style={{ animationDuration: '2.4s' }} />
                    <span className="truncate font-mono text-[11.5px] text-fg-muted">{tb(searchPhase.search!.query)}</span>
                  </div>
                  <ul className="mt-2 flex flex-col gap-2">
                    {r.hits.map(({ key, hit }) => (
                      <li key={key} className="animate-slide-in rounded-md px-1 py-1">
                        <div className="flex items-center gap-1.5">
                          <span className="grid size-4 place-items-center rounded-[4px] bg-primary-soft text-[8px] font-bold text-primary dark:text-accent">
                            {hit.domain[0].toUpperCase()}
                          </span>
                          <span className="font-mono text-[11px] text-fg-subtle">{hit.domain}</span>
                          <ExternalLink className="size-3 text-fg-subtle" />
                        </div>
                        <p className="mt-0.5 text-[12.5px] font-semibold leading-snug text-info">{tb(hit.title)}</p>
                        <p className="mt-0.5 text-[11.5px] leading-snug text-fg-muted">{tb(hit.snippet)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-surface-2 px-5 py-2.5">
        <CircleCheckBig className="size-3.5 shrink-0 text-primary dark:text-accent" />
        <p className="text-[11.5px] text-fg-muted">{footerNote ?? t('ai.humanApproves')}</p>
      </div>
    </div>
  );
}
