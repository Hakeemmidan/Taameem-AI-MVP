'use client';

import { forwardRef, useEffect, useState } from 'react';
import { cn, hash } from '@/lib/utils';

/* ------------------------------------------------------------------ button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
type ButtonSize = 'sm' | 'md' | 'lg';

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg hover:brightness-110 active:brightness-95 shadow-sm',
  secondary: 'bg-surface text-fg border border-border-strong hover:bg-surface-2',
  ghost: 'text-fg-muted hover:bg-bg-soft hover:text-fg',
  danger: 'bg-danger text-white hover:brightness-110',
  subtle: 'bg-primary-soft text-primary hover:brightness-105 dark:text-accent',
};
const BTN_SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'secondary', size = 'md', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'focus-ring sheen inline-flex shrink-0 select-none items-center justify-center font-medium transition-[background,filter,box-shadow,transform] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45',
        BTN_VARIANT[variant],
        BTN_SIZE[size],
        className,
      )}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------- card */

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('card', className)} {...props} />
);

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-start justify-between gap-4 border-b border-border px-5 py-4', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-[15px] font-semibold leading-tight', className)} {...props} />
);

export const CardBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5', className)} {...props} />
);

/* ------------------------------------------------------------------- badge */

export type Tone = 'neutral' | 'primary' | 'warn' | 'danger' | 'info' | 'accent';

const TONE: Record<Tone, string> = {
  neutral: 'bg-bg-soft text-fg-muted border-border',
  primary: 'bg-primary-soft text-primary border-primary/25 dark:text-accent',
  warn: 'bg-warn-soft text-warn border-warn/30',
  danger: 'bg-danger-soft text-danger border-danger/30',
  info: 'bg-info-soft text-info border-info/30',
  accent: 'bg-accent text-accent-fg border-transparent',
};

export const Badge = ({
  tone = 'neutral',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold leading-5',
      TONE[tone],
      className,
    )}
    {...props}
  />
);

/** A tiny coloured dot, for legends and status rows. */
export const Dot = ({ tone = 'neutral', className }: { tone?: Tone; className?: string }) => (
  <span
    className={cn(
      'inline-block size-2 shrink-0 rounded-full',
      tone === 'primary' && 'bg-primary',
      tone === 'warn' && 'bg-warn',
      tone === 'danger' && 'bg-danger',
      tone === 'info' && 'bg-info',
      tone === 'accent' && 'bg-accent',
      tone === 'neutral' && 'bg-fg-subtle',
      className,
    )}
  />
);

/* ---------------------------------------------------------------- progress */

export const Progress = ({
  value,
  tone = 'primary',
  className,
  animate = true,
}: {
  value: number;
  tone?: Tone;
  className?: string;
  animate?: boolean;
}) => (
  <div className={cn('h-2 w-full overflow-hidden rounded-full bg-bg-soft', className)}>
    <div
      className={cn(
        'h-full rounded-full transition-[width] duration-700 ease-out',
        tone === 'primary' && 'bg-primary',
        tone === 'warn' && 'bg-warn',
        tone === 'danger' && 'bg-danger',
        tone === 'info' && 'bg-info',
        tone === 'accent' && 'bg-accent',
        tone === 'neutral' && 'bg-fg-subtle',
        animate && 'origin-left animate-bar-grow',
      )}
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

/* ------------------------------------------------------------------ avatar */

export const Avatar = ({
  name,
  id,
  size = 36,
  className,
}: {
  name: string;
  id?: string;
  size?: number;
  className?: string;
}) => {
  const hue = (hash(id ?? name) % 360) as number;
  const letters = name
    .split(' ')
    .filter((p) => !/^(al|bin|bint)-?$/i.test(p))
    .slice(0, 2)
    .map((p) => p.replace(/^Al-/, '')[0])
    .join('')
    .toUpperCase();
  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center rounded-full font-semibold', className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `hsl(${hue} 42% 88%)`,
        color: `hsl(${hue} 55% 26%)`,
        boxShadow: `inset 0 0 0 1px hsl(${hue} 40% 74%)`,
      }}
      aria-hidden
    >
      {letters}
    </span>
  );
};

/* -------------------------------------------------------------------- stat */

/**
 * Counts a number up to its value once, on first paint. A figure that lands
 * rather than appears reads as measured, and it draws the eye to what changed.
 * Anything that is not a plain number is rendered as given.
 */
function Counted({ value }: { value: React.ReactNode }) {
  const target = typeof value === 'number' ? value : null;
  const [n, setN] = useState(target === null ? 0 : 0);

  useEffect(() => {
    if (target === null) return;
    if (target === 0) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setN(target);
      return;
    }
    // counted in its own ticks rather than against the wall clock, so the
    // figure always arrives at the target even where time is virtualised
    const steps = 32;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      const p = i / steps;
      // ease out, so it decelerates into the final figure
      setN(i >= steps ? target : Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (i >= steps) clearInterval(id);
    }, 20);
    return () => {
      clearInterval(id);
      setN(target);
    };
  }, [target]);

  if (target === null) return <>{value}</>;
  return <>{n.toLocaleString('en-US')}</>;
}

export const Stat = ({
  label,
  value,
  sub,
  tone = 'neutral',
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: Tone;
  className?: string;
}) => (
  <div className={cn('card p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-pop', className)}>
    <p className="label-xs">{label}</p>
    <p
      className={cn(
        'mt-1.5 font-mono text-[28px] font-bold leading-none tracking-tight',
        tone === 'primary' && 'text-primary',
        tone === 'warn' && 'text-warn',
        tone === 'danger' && 'text-danger',
        tone === 'info' && 'text-info',
      )}
    >
      <Counted value={value} />
    </p>
    {sub ? <p className="mt-2 text-[12.5px] leading-snug text-fg-muted">{sub}</p> : null}
  </div>
);

/* --------------------------------------------------------------- separator */

export const Separator = ({ className }: { className?: string }) => (
  <div className={cn('h-px w-full bg-border', className)} />
);

/* ---------------------------------------------------------------- skeleton */

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('shimmer-track rounded-md bg-bg-soft', className)} />
);

/* ------------------------------------------------------------- empty state */

export const Empty = ({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) => (
  <div className="grid place-items-center gap-2 px-6 py-14 text-center">
    {icon ? <div className="text-fg-subtle">{icon}</div> : null}
    <p className="text-sm font-medium text-fg-muted">{title}</p>
    {hint ? <p className="max-w-sm text-[12.5px] text-fg-subtle">{hint}</p> : null}
  </div>
);
