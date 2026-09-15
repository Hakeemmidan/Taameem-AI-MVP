'use client';

import { Avatar, Badge, type Tone } from '@/components/ui/primitives';
import { useLang } from '@/lib/i18n/context';
import { useSession } from '@/lib/session/context';
import { byId, dept } from '@/data/org';
import { roleById } from '@/data/tenants';
import { regulatorById } from '@/data/regulators';
import type { GapSeverity, RegulatorId } from '@/lib/types';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------ page header */

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  /** one short line. Anything longer belongs in the page, not the header. */
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="text-[22px] font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-fg-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------- regulator chip */

export function RegulatorChip({ id, showName = false }: { id: RegulatorId; showName?: boolean }) {
  const { tb } = useLang();
  const r = regulatorById(id);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="grid h-5 shrink-0 place-items-center rounded-[5px] px-1.5 font-mono text-[10px] font-bold text-white"
        style={{ background: r.colour }}
      >
        {r.short.en}
      </span>
      {showName ? <span className="truncate text-[12.5px] text-fg-muted">{tb(r.name)}</span> : null}
    </span>
  );
}

/* ---------------------------------------------------------------- gap tag */

const GAP_TONE: Record<GapSeverity, Tone> = { none: 'primary', low: 'info', medium: 'warn', high: 'danger' };

export function GapBadge({ gap, className }: { gap: GapSeverity; className?: string }) {
  const { t } = useLang();
  return (
    <Badge tone={GAP_TONE[gap]} className={className}>
      {t(`gap.${gap}` as 'gap.none')}
    </Badge>
  );
}

export const gapTone = (gap: GapSeverity) => GAP_TONE[gap];

/* ------------------------------------------------------------ person chip */

export function PersonChip({
  id,
  size = 24,
  showTitle = false,
  onClick,
}: {
  id: string;
  size?: number;
  showTitle?: boolean;
  /** makes the chip a button, used to open the person drawer */
  onClick?: (id: string) => void;
}) {
  const { tb } = useLang();
  const p = byId(id);
  if (!p) return null;

  const inner = (
    <>
      <Avatar name={tb(p.name)} id={p.id} size={size} />
      <span className="min-w-0 text-start">
        <span className="block truncate text-[12.5px] font-medium leading-tight">{tb(p.name)}</span>
        {showTitle ? <span className="block truncate text-[11px] text-fg-subtle">{tb(p.title)}</span> : null}
      </span>
    </>
  );

  if (!onClick) return <span className="inline-flex min-w-0 items-center gap-2">{inner}</span>;

  return (
    <button
      onClick={() => onClick(id)}
      className="focus-ring -mx-1 inline-flex min-w-0 items-center gap-2 rounded-lg px-1 py-0.5 transition hover:bg-bg-soft"
    >
      {inner}
    </button>
  );
}

/* --------------------------------------------------------------- role tag */

export function RoleBadge({ id, className }: { id: string; className?: string }) {
  const { tb } = useLang();
  const p = byId(id);
  if (!p) return null;
  return (
    <Badge tone="neutral" className={className}>
      {tb(roleById(p.role).name)}
    </Badge>
  );
}

/* -------------------------------------------------------------- dept chip */

/** Department ids repeat across institutions, so this reads the tenant from the session. */
export function DeptChip({ id, tenantId }: { id: string; tenantId?: string }) {
  const { tb } = useLang();
  const { tenant } = useSession();
  const d = dept(tenantId ?? tenant?.id ?? '', id);
  if (!d) return null;
  return (
    <span className="inline-flex items-center rounded-md bg-bg-soft px-2 py-0.5 text-[11.5px] font-medium text-fg-muted">
      {tb(d.short)}
    </span>
  );
}

/* --------------------------------------------------------- section label */

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('label-xs mb-2.5', className)}>{children}</p>;
}

/* ---------------------------------------------------------- detail rows */

/** A label/value pair. Keeps every drawer reading the same way. */
export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2">
      <span className="shrink-0 text-[12px] text-fg-subtle">{label}</span>
      <span className="min-w-0 text-end text-[13px] font-medium">{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------ Arabic quote */

/** A quoted sentence from the regulator's own letter, always rendered RTL. */
export function SourceQuote({ ar, sourceRef }: { ar: string; sourceRef?: string }) {
  return (
    <div className="rounded-lg border-s-[3px] border-accent bg-bg-soft px-3.5 py-2.5">
      {sourceRef ? <p className="mb-1 font-mono text-[10.5px] font-bold text-fg-subtle">{sourceRef}</p> : null}
      <p dir="rtl" lang="ar" className="font-ar text-[13.5px] leading-[1.9] text-fg">
        {ar}
      </p>
    </div>
  );
}
