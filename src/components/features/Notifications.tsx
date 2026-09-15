'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, CircleAlert, FileCheck2, FolderLock, Inbox, Send, UserCheck, type LucideIcon } from 'lucide-react';
import { useLang } from '@/lib/i18n/context';
import { useNotifications, type NoteKind } from '@/lib/store/notifications';
import { fmtDate, fmtTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const ICON: Record<NoteKind, LucideIcon> = {
  letter: Inbox,
  approved: UserCheck,
  task: Send,
  evidence: FolderLock,
  due: CircleAlert,
  approval: CheckCheck,
  sent: FileCheck2,
};

/** The bell. It reports only what the workspace state can prove happened. */
export function Notifications() {
  const { tb, lang, isRtl } = useLang();
  const { notes, unread } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={isRtl ? 'الإشعارات' : 'Notifications'}
        aria-expanded={open}
        className={cn(
          'focus-ring relative grid size-9 place-items-center rounded-lg text-fg-muted transition hover:bg-bg-soft hover:text-fg',
          open && 'bg-bg-soft text-fg',
        )}
      >
        <Bell className="size-[18px]" />
        {unread > 0 ? (
          <span className="absolute -end-0.5 -top-0.5 grid size-[18px] place-items-center">
            <span className="absolute size-[18px] animate-pulse-ring rounded-full bg-danger" aria-hidden />
            <span className="relative grid size-[18px] place-items-center rounded-full bg-danger font-mono text-[10px] font-bold text-white">
              {unread}
            </span>
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="card absolute end-0 top-[calc(100%+8px)] z-50 w-[330px] animate-scale-in overflow-hidden p-0 shadow-pop">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <p className="text-[13px] font-semibold">{isRtl ? 'الإشعارات' : 'Notifications'}</p>
            <span className="ms-auto font-mono text-[11px] text-fg-subtle">{notes.length}</span>
          </div>

          <ul className="max-h-[380px] divide-y divide-border overflow-y-auto">
            {notes.map((n, i) => {
              const Icon = ICON[n.kind];
              return (
                <li key={n.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-4 py-3 transition hover:bg-bg-soft"
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg',
                        n.urgent ? 'bg-danger-soft text-danger' : 'bg-bg-soft text-fg-muted',
                      )}
                    >
                      <Icon className="size-[15px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold leading-snug">{tb(n.title)}</span>
                      <span className="mt-0.5 block truncate text-[11.5px] text-fg-muted">{tb(n.body)}</span>
                      <span className="mt-1 block font-mono text-[10.5px] text-fg-subtle">
                        {fmtDate(n.at, lang)} {fmtTime(n.at)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="border-t border-border bg-surface-2 px-4 py-2.5 text-[11px] leading-relaxed text-fg-subtle">
            {isRtl
              ? 'كل إشعار مبني على حالة فعلية في مساحة العمل، لا على رسالة مجدولة.'
              : 'Every note here is built from real workspace state, not a scheduled message.'}
          </p>
        </div>
      ) : null}
    </div>
  );
}
