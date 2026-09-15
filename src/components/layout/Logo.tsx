import { cn } from '@/lib/utils';

/** The Taameem mark: two stacked leaves forming a folded document. */
export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={cn('shrink-0', className)} aria-hidden>
      <defs>
        <linearGradient id="tm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2FCFA3" />
          <stop offset="100%" stopColor="#0B6F62" />
        </linearGradient>
      </defs>
      <path
        d="M30 4H14a10 10 0 0 0-10 10v10a4 4 0 0 0 4 4h6v-8a6 6 0 0 1 6-6h14V8a4 4 0 0 0-4-4Z"
        fill="url(#tm-g)"
      />
      <path
        d="M40 20H26a6 6 0 0 0-6 6v18h14a10 10 0 0 0 10-10V24a4 4 0 0 0-4-4Z"
        fill="url(#tm-g)"
        opacity="0.72"
      />
    </svg>
  );
}

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={compact ? 24 : 28} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight">Taameem</span>
          <span className="mt-0.5 text-[10px] font-medium tracking-[0.2em] text-fg-subtle">تعميم</span>
        </span>
      )}
    </span>
  );
}
