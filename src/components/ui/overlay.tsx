'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n/context';

function useLockScroll(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
}

/** A side panel that opens from the reading edge, so it feels native in both directions. */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-2xl',
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  const { isRtl } = useLang();
  useLockScroll(open);
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <button
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-accent/40 backdrop-blur-[2px] dark:bg-black/60"
      />
      <div
        className={cn(
          'relative ms-auto flex h-full w-full flex-col bg-surface shadow-pop',
          width,
          isRtl ? 'me-auto ms-0 border-e border-border' : 'border-s border-border',
        )}
        style={{ animation: 'slide-in .32s cubic-bezier(.2,.7,.2,1) both', ['--slide-from' as string]: isRtl ? '-24px' : '24px' }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-[12.5px] text-fg-muted">{subtitle}</p> : null}
          </div>
          <button onClick={onClose} className="focus-ring -me-1 rounded-lg p-2 text-fg-subtle hover:bg-bg-soft hover:text-fg">
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer ? <footer className="border-t border-border bg-surface-2 px-6 py-3">{footer}</footer> : null}
      </div>
    </div>
  );
}

/** A centred dialog for short, decisive moments. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  useLockScroll(open);
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
      <button aria-label="close" onClick={onClose} className="absolute inset-0 animate-fade-in bg-accent/40 backdrop-blur-[2px] dark:bg-black/60" />
      <div className={cn('card relative w-full animate-scale-in overflow-hidden shadow-pop', width)}>
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <button onClick={onClose} className="focus-ring -me-1 rounded-lg p-1.5 text-fg-subtle hover:bg-bg-soft hover:text-fg">
            <X className="size-4" />
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer ? <footer className="border-t border-border bg-surface-2 px-5 py-3">{footer}</footer> : null}
      </div>
    </div>
  );
}
