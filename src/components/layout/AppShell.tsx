'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X, type LucideIcon } from 'lucide-react';
import { Logo, LogoMark } from './Logo';
import { LangToggle, ThemeToggle } from './Toggles';
import { Avatar, Badge } from '@/components/ui/primitives';
import { useLang } from '@/lib/i18n/context';
import type { DictKey } from '@/lib/i18n/dictionary';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  labelKey: DictKey;
  icon: LucideIcon;
  /** a number badge, e.g. items awaiting review */
  count?: number;
}

export interface NavGroup {
  titleKey?: DictKey;
  items: NavItem[];
}

export interface ShellUser {
  id: string;
  name: string;
  title: string;
  /** the role name, shown next to the person everywhere */
  role: string;
  /** one line describing what the role may do */
  roleScope?: string;
}

export function AppShell({
  nav,
  workspace,
  user,
  topbarExtra,
  profileExtra,
  children,
}: {
  nav: NavGroup[];
  workspace: { name: string; sub: string; hue?: number };
  user: ShellUser;
  /** slotted into the top bar, left of the toggles */
  topbarExtra?: React.ReactNode;
  /** rows appended inside the profile menu, e.g. the permission list */
  profileExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t, isRtl } = useLang();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname === `${href}/` || (href !== '/institution' && href !== '/admin' && pathname.startsWith(`${href}/`));

  const Chevron = isRtl ? ChevronRight : ChevronLeft;

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto px-3 py-4">
      {nav.map((group, gi) => (
        <div key={gi} className={cn(gi > 0 && 'mt-5')}>
          {group.titleKey && !collapsed ? <p className="label-xs mb-2 px-2.5">{t(group.titleKey)}</p> : null}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? t(item.labelKey) : undefined}
                    className={cn(
                      'focus-ring group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition',
                      active ? 'bg-primary-soft text-primary dark:text-accent' : 'text-fg-muted hover:bg-bg-soft hover:text-fg',
                      collapsed && 'justify-center px-0',
                    )}
                  >
                    {active ? (
                      <span className="absolute inset-y-1.5 -start-3 w-[3px] rounded-e-full bg-primary dark:bg-accent" aria-hidden />
                    ) : null}
                    <Icon className={cn('size-[17px] shrink-0', active && 'text-primary dark:text-accent')} />
                    {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                    {!collapsed && item.count ? (
                      <span className="ms-auto inline-grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 font-mono text-[11px] font-bold text-white">
                        {item.count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      {/* desktop sidebar */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 border-e border-border bg-surface transition-[width] duration-200 lg:block',
          collapsed ? 'w-[68px]' : 'w-[248px]',
        )}
      >
        <div className={cn('flex h-14 items-center border-b border-border px-4', collapsed && 'justify-center px-0')}>
          {collapsed ? <LogoMark size={24} /> : <Logo />}
        </div>
        <div className="h-[calc(100vh-3.5rem)]">{sidebar}</div>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="focus-ring absolute -end-3 top-[72px] grid size-6 place-items-center rounded-full border border-border bg-surface text-fg-subtle shadow-sm hover:text-fg"
          aria-label="toggle sidebar"
        >
          <Chevron className={cn('size-3.5 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* mobile sidebar */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="close menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 animate-fade-in bg-accent/40 backdrop-blur-[2px] dark:bg-black/60" />
          <div
            className="relative h-full w-[268px] border-e border-border bg-surface"
            style={{ animation: 'slide-in .28s cubic-bezier(.2,.7,.2,1) both', ['--slide-from' as string]: isRtl ? '24px' : '-24px' }}
          >
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="focus-ring rounded-lg p-2 text-fg-subtle hover:bg-bg-soft">
                <X className="size-4" />
              </button>
            </div>
            <div className="h-[calc(100vh-3.5rem)]">{sidebar}</div>
          </div>
        </div>
      ) : null}

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur-md lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="focus-ring -ms-1 rounded-lg p-2 text-fg-muted hover:bg-bg-soft lg:hidden">
            <Menu className="size-5" />
          </button>
          <span
            className="hidden size-8 shrink-0 place-items-center rounded-lg text-[13px] font-bold sm:grid"
            style={{
              background: `hsl(${workspace.hue ?? 200} 42% 88%)`,
              color: `hsl(${workspace.hue ?? 200} 55% 26%)`,
            }}
            aria-hidden
          >
            {workspace.name.trim()[0]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold leading-tight">{workspace.name}</p>
            <p className="truncate text-[11.5px] text-fg-subtle">{workspace.sub}</p>
          </div>
          <div className="ms-auto flex items-center gap-2">
            {topbarExtra}
            <LangToggle />
            <ThemeToggle className="hidden sm:inline-flex" />
            <ProfileMenu user={user} extra={profileExtra} />
          </div>
        </header>
        <main key={pathname} className="page-enter min-w-0 flex-1 px-4 py-6 lg:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- profile menu */

function ProfileMenu({ user, extra }: { user: ShellUser; extra?: React.ReactNode }) {
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
        aria-expanded={open}
        className={cn(
          'focus-ring flex items-center gap-2 rounded-full border border-border py-1 pe-2 ps-1 transition hover:bg-bg-soft',
          open && 'bg-bg-soft',
        )}
      >
        <Avatar name={user.name} id={user.id} size={28} />
        <span className="hidden min-w-0 text-start md:block">
          <span className="block max-w-[150px] truncate text-[12.5px] font-semibold leading-tight">{user.name}</span>
          <span className="block max-w-[150px] truncate text-[10.5px] leading-tight text-fg-subtle">{user.role}</span>
        </span>
        <ChevronDown className={cn('size-3.5 shrink-0 text-fg-subtle transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <div className="card absolute end-0 top-[calc(100%+8px)] z-50 w-[288px] animate-scale-in overflow-hidden p-0 shadow-pop">
          <div className="flex items-start gap-3 border-b border-border p-4">
            <Avatar name={user.name} id={user.id} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold leading-tight">{user.name}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-fg-muted">{user.title}</p>
              <Badge tone="primary" className="mt-2">
                {user.role}
              </Badge>
            </div>
          </div>

          {user.roleScope ? (
            <p className="border-b border-border bg-surface-2 px-4 py-3 text-[12px] leading-relaxed text-fg-muted">{user.roleScope}</p>
          ) : null}

          {extra}

        </div>
      ) : null}
    </div>
  );
}
