'use client';

import { Building2, LayoutDashboard, Radar, ShieldOff, SlidersHorizontal } from 'lucide-react';
import { AppShell, type NavGroup } from '@/components/layout/AppShell';
import { useLang } from '@/lib/i18n/context';
import { roleById } from '@/data/tenants';

const NAV: NavGroup[] = [
  {
    items: [
      { href: '/admin', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { href: '/admin/sources', labelKey: 'nav.sources', icon: Radar },
      { href: '/admin/extraction', labelKey: 'nav.extraction', icon: SlidersHorizontal },
      { href: '/admin/clients', labelKey: 'nav.clients', icon: Building2 },
    ],
  },
];

/**
 * Our own console. It is a separate product from the institution workspace and
 * shares nothing with it: no navigation, no session, no client data.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isRtl, tb } = useLang();
  const role = roleById('platform');

  return (
    <AppShell
      nav={NAV}
      workspace={{ name: 'Taameem', sub: isRtl ? 'كونسول الفريق' : 'Product console', hue: 168 }}
      user={{
        id: 'TM-001',
        name: isRtl ? 'أريج ناصر المالكي' : 'Areej Nasser Almalki',
        title: isRtl ? 'الرئيس التنفيذي' : 'Chief Executive Officer',
        role: tb(role.name),
        roleScope: tb(role.scope),
      }}
      profileExtra={
        <p className="flex items-start gap-2 border-b border-border px-4 py-3 text-[12px] leading-relaxed text-fg-muted">
          <ShieldOff className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" />
          {isRtl
            ? 'لا يصل فريق تعميم إلى سياسات أي عميل ولا إلى أدلته. ما يظهر هنا هو حالة الاشتراك وجودة الاستخراج فقط.'
            : 'The Taameem team cannot open a client’s policies or evidence. This console shows subscription health and extraction quality only.'}
        </p>
      }
    >
      {children}
    </AppShell>
  );
}
