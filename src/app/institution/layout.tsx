'use client';

import {
  BookText,
  Check,
  FileCheck2,
  FolderLock,
  Inbox,
  ListChecks,
  Minus,
  Route,
  ShieldCheck,
  SquareCheckBig,
  Users,
} from 'lucide-react';
import { AppShell, type NavGroup } from '@/components/layout/AppShell';
import { Notifications } from '@/components/features/Notifications';
import { LogoMark } from '@/components/layout/Logo';
import { useLang } from '@/lib/i18n/context';
import { useSession, useWorkspaceSession } from '@/lib/session/context';
import { WorkspaceProvider, useWorkspace } from '@/lib/store/workspace';
import type { DictKey } from '@/lib/i18n/dictionary';
import type { Role } from '@/data/tenants';

const navGroups = (pending: number, openTasks: number): NavGroup[] => [
  {
    titleKey: 'nav.group.journey',
    items: [
      { href: '/institution', labelKey: 'nav.flow', icon: Route },
      { href: '/institution/announcements', labelKey: 'nav.announcements', icon: Inbox },
      { href: '/institution/obligations', labelKey: 'nav.obligations', icon: ListChecks, count: pending },
      { href: '/institution/tasks', labelKey: 'nav.tasks', icon: SquareCheckBig, count: openTasks },
      { href: '/institution/evidence', labelKey: 'nav.evidence', icon: FolderLock },
      { href: '/institution/report', labelKey: 'nav.report', icon: FileCheck2 },
    ],
  },
  {
    titleKey: 'nav.group.library',
    items: [
      { href: '/institution/policies', labelKey: 'nav.policies', icon: BookText },
      { href: '/institution/org', labelKey: 'nav.org', icon: Users },
    ],
  },
  {
    titleKey: 'nav.group.readiness',
    items: [{ href: '/institution/inspection', labelKey: 'nav.inspection', icon: ShieldCheck }],
  },
];

/** The workspace is always open; this only waits for storage to be read. */
export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  const { ready, session } = useSession();

  if (!ready || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <LogoMark size={34} className="animate-pulse" />
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <Shell>{children}</Shell>
    </WorkspaceProvider>
  );
}

const PERMS: { key: keyof Role['can']; label: DictKey }[] = [
  { key: 'reviewObligations', label: 'perm.reviewObligations' },
  { key: 'approveObligations', label: 'perm.approveObligations' },
  { key: 'assignTasks', label: 'perm.assignTasks' },
  { key: 'uploadEvidence', label: 'perm.uploadEvidence' },
  { key: 'runInspection', label: 'perm.runInspection' },
  { key: 'sendToRegulator', label: 'perm.sendToRegulator' },
  { key: 'editPolicies', label: 'perm.editPolicies' },
];

function Shell({ children }: { children: React.ReactNode }) {
  const { t, tb } = useLang();
  const { pendingCount, openTaskCount } = useWorkspace();
  const { tenant, user, role } = useWorkspaceSession();

  const permissions = (
    <div className="border-b border-border px-4 py-3">
      <p className="label-xs mb-2">{t('role.permissions')}</p>
      <ul className="flex flex-col gap-1">
        {PERMS.map((p) => {
          const allowed = role.can[p.key];
          return (
            <li key={p.key} className="flex items-center gap-2 text-[12px]">
              {allowed ? (
                <Check className="size-3.5 shrink-0 text-primary dark:text-accent" strokeWidth={3} />
              ) : (
                <Minus className="size-3.5 shrink-0 text-fg-subtle" />
              )}
              <span className={allowed ? 'text-fg' : 'text-fg-subtle line-through decoration-fg-subtle/40'}>{t(p.label)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <AppShell
      nav={navGroups(pendingCount, openTaskCount)}
      workspace={{ name: tb(tenant.name), sub: tb(tenant.licence), hue: tenant.hue }}
      user={{ id: user.id, name: tb(user.name), title: tb(user.title), role: tb(role.name), roleScope: tb(role.scope) }}
      topbarExtra={<Notifications />}
      profileExtra={permissions}
    >
      {children}
    </AppShell>
  );
}
