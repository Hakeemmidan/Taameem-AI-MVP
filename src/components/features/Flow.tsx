'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileCheck2,
  FileSearch,
  FolderLock,
  GitCompareArrows,
  Inbox,
  Send,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { FLOW, STEP_FOR_PATH, stepOf, type FlowStep } from '@/lib/flow';
import { useProgress, type StepState } from '@/lib/store/progress';
import { useLang } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

const ICON: Record<FlowStep['icon'], LucideIcon> = {
  Inbox,
  FileSearch,
  UserCheck,
  GitCompareArrows,
  Send,
  FolderLock,
  FileCheck2,
};

/* ------------------------------------------------------------------- rail */

/**
 * The whole journey on one screen. Done steps are filled, the step you are on
 * is ringed and breathing, the rest are waiting. Clicking any of them goes
 * there, so the diagram is also the navigation.
 */
export function FlowRail() {
  const { tb, isRtl } = useLang();
  const { steps, byKey } = useProgress();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <ol className="relative grid gap-3 lg:grid-cols-7 lg:gap-2">
      {FLOW.map((s, i) => {
        const p = byKey(s.key);
        const Icon = ICON[s.icon];
        return (
          <li key={s.key} className="animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
            <Link
              href={s.href}
              className={cn(
                'group relative flex h-full gap-3 rounded-xl border p-3 transition lg:flex-col lg:gap-0 lg:pt-0',
                p.state === 'active'
                  ? 'border-primary bg-primary-soft/60 shadow-sm'
                  : p.state === 'done'
                    ? 'border-border bg-surface hover:border-border-strong'
                    : 'border-dashed border-border bg-surface/60 hover:bg-surface',
              )}
            >
              <span className="relative shrink-0 lg:mx-auto lg:-mt-[1px]">
                <StepDot n={s.n} state={p.state} icon={Icon} />
              </span>

              <span className="min-w-0 lg:mt-3 lg:text-center">
                <span
                  className={cn(
                    'block text-[13px] font-semibold leading-tight',
                    p.state === 'waiting' && 'text-fg-muted',
                  )}
                >
                  {tb(s.title)}
                </span>
                <span className="mt-1 block text-[11.5px] leading-snug text-fg-subtle">{tb(s.who)}</span>

                {p.of > 1 ? (
                  <span className="mt-2 flex items-center gap-1.5 lg:justify-center">
                    <span className="h-1 w-12 overflow-hidden rounded-full bg-bg-soft">
                      <span
                        className={cn(
                          'block h-full rounded-full transition-[width] duration-700 ease-out',
                          p.state === 'done' ? 'bg-primary' : 'bg-warn',
                        )}
                        style={{ width: `${p.of ? (p.at / p.of) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="font-mono text-[10.5px] text-fg-subtle">
                      {p.at}/{p.of}
                    </span>
                  </span>
                ) : null}

                {p.state === 'active' ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary dark:text-accent lg:justify-center">
                    {isRtl ? 'ابدأ من هنا' : 'Start here'}
                    <Arrow className="size-3 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function StepDot({ n, state, icon: Icon }: { n: number; state: StepState; icon: LucideIcon }) {
  return (
    <span className="relative grid place-items-center">
      {state === 'active' ? (
        <span className="absolute size-[52px] animate-pulse-ring rounded-full border-2 border-primary" aria-hidden />
      ) : null}
      <span
        className={cn(
          'relative grid size-[52px] place-items-center rounded-full border-2 transition',
          state === 'done'
            ? 'border-primary bg-primary text-primary-fg'
            : state === 'active'
              ? 'border-primary bg-surface text-primary dark:text-accent'
              : 'border-border bg-surface text-fg-subtle',
        )}
      >
        {state === 'done' ? <Check className="size-5" strokeWidth={3} /> : <Icon className="size-5" />}
      </span>
      <span
        className={cn(
          'absolute -bottom-1 -end-1 grid size-5 place-items-center rounded-full border font-mono text-[10px] font-bold',
          state === 'waiting' ? 'border-border bg-surface text-fg-subtle' : 'border-border bg-surface text-fg',
        )}
      >
        {n}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------- bar */

/**
 * The thin version that sits at the top of every step page: where you are,
 * what this step is for, and the way on to the next one.
 */
export function FlowBar() {
  const { tb, isRtl } = useLang();
  const pathname = usePathname();
  const { byKey } = useProgress();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const clean = pathname.replace(/\/$/, '');
  const key = STEP_FOR_PATH[clean];
  if (!key) return null;

  const step = stepOf(key);
  const next = FLOW[step.n] ?? null;
  const p = byKey(key);

  return (
    <div className="mb-6 animate-fade-up overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link
          href="/institution"
          className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg text-[12px] font-semibold text-fg-muted transition hover:text-fg"
        >
          <span className="grid size-6 place-items-center rounded-full bg-primary font-mono text-[11px] font-bold text-primary-fg">
            {step.n}
          </span>
          {isRtl ? `الخطوة ${step.n} من ${FLOW.length}` : `Step ${step.n} of ${FLOW.length}`}
        </Link>

        <span className="hidden h-4 w-px bg-border sm:block" />

        <p className="min-w-0 flex-1 truncate text-[13px]">
          <b className="font-semibold">{tb(step.title)}</b>
          <span className="ms-2 text-fg-muted">{tb(step.asks)}</span>
        </p>

        {next ? (
          <Link
            href={next.href}
            className="focus-ring group inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-primary transition hover:bg-primary-soft dark:text-accent"
          >
            {isRtl ? `التالي · ${tb(next.title)}` : `Next · ${tb(next.title)}`}
            <Arrow className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </Link>
        ) : null}
      </div>

      <div className="h-1 bg-bg-soft">
        <span
          className={cn('block h-full transition-[width] duration-700 ease-out', p.state === 'done' ? 'bg-primary' : 'bg-warn')}
          style={{ width: `${p.of ? Math.max(6, (p.at / p.of) * 100) : p.state === 'done' ? 100 : 6}%` }}
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- hand-off */

/**
 * The bottom of a step page. It says what this step produced and opens the
 * next one, so the journey carries itself forward instead of asking the
 * person to find their way back to the map.
 */
export function NextStep() {
  const { tb, isRtl } = useLang();
  const pathname = usePathname();
  const { byKey } = useProgress();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const key = STEP_FOR_PATH[pathname.replace(/\/$/, '')];
  if (!key) return null;

  const step = stepOf(key);
  const next = FLOW[step.n];
  const p = byKey(key);

  if (!next) {
    return (
      <Link
        href="/institution"
        className="card group mt-10 flex animate-fade-up items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-pop"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary dark:text-accent">
          <Check className="size-5" strokeWidth={3} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="label-xs block">{isRtl ? 'نهاية المسار' : 'End of the journey'}</span>
          <span className="mt-1 block text-[15px] font-semibold">{isRtl ? 'ارجع إلى المسار' : 'Back to the journey'}</span>
        </span>
        <Arrow className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
      </Link>
    );
  }

  const NextIcon = ICON[next.icon];

  return (
    <Link
      href={next.href}
      className="card group relative mt-10 flex animate-fade-up items-center gap-4 overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-pop"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 start-0 w-1 bg-primary transition-all duration-300 group-hover:w-1.5"
      />
      <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary dark:text-accent">
        <NextIcon className="size-5" />
        <span className="absolute -bottom-1 -end-1 grid size-5 place-items-center rounded-full border border-border bg-surface font-mono text-[10px] font-bold text-fg">
          {next.n}
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="label-xs block">
          {p.state === 'done'
            ? isRtl
              ? 'انتهت هذه الخطوة · التالي'
              : 'This step is done · next'
            : isRtl
              ? 'الخطوة التالية'
              : 'Next step'}
        </span>
        <span className="mt-1 block text-[15px] font-semibold">{tb(next.title)}</span>
        <span className="mt-1 block max-w-2xl text-[12.5px] leading-relaxed text-fg-muted">{tb(next.asks)}</span>
      </span>

      <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-fg transition group-hover:brightness-110">
        {isRtl ? 'افتحها' : 'Open it'}
        <Arrow className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
      </span>
    </Link>
  );
}
