'use client';

import { Languages, Monitor, Moon, Sun } from 'lucide-react';
import { useLang } from '@/lib/i18n/context';
import { useTheme, type ThemeChoice } from '@/lib/theme/context';
import { cn } from '@/lib/utils';

export function LangToggle({ className }: { className?: string }) {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      className={cn(
        'focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-[13px] font-medium text-fg-muted transition hover:bg-bg-soft hover:text-fg',
        className,
      )}
      title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Languages className="size-4" />
      <span className={lang === 'ar' ? 'font-sans' : 'font-ar'}>{lang === 'ar' ? 'EN' : 'ع'}</span>
    </button>
  );
}

const OPTIONS: { key: ThemeChoice; icon: typeof Sun }[] = [
  { key: 'light', icon: Sun },
  { key: 'dark', icon: Moon },
  { key: 'system', icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();
  return (
    <div className={cn('inline-flex h-9 items-center gap-0.5 rounded-lg border border-border p-0.5', className)}>
      {OPTIONS.map(({ key, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          aria-pressed={theme === key}
          title={t(`common.${key}` as 'common.light')}
          className={cn(
            'focus-ring grid size-8 place-items-center rounded-[7px] transition',
            theme === key ? 'bg-primary-soft text-primary dark:text-accent' : 'text-fg-subtle hover:bg-bg-soft hover:text-fg',
          )}
        >
          <Icon className="size-[15px]" />
        </button>
      ))}
    </div>
  );
}
