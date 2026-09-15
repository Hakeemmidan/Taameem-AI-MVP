'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  FileCheck2,
  FileSearch,
  FolderLock,
  GitCompareArrows,
  Inbox,
  Send,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { LangToggle, ThemeToggle } from '@/components/layout/Toggles';
import { useLang } from '@/lib/i18n/context';
import { FLOW, type FlowStep } from '@/lib/flow';

const ICON: Record<FlowStep['icon'], LucideIcon> = {
  Inbox,
  FileSearch,
  UserCheck,
  GitCompareArrows,
  Send,
  FolderLock,
  FileCheck2,
};

export default function Cover() {
  const { tb, isRtl } = useLang();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[460px] opacity-[0.5] blur-3xl"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgb(var(--primary) / .30), transparent 70%)' }}
      />

      <header className="relative mx-auto flex w-full max-w-5xl items-center gap-3 px-6 py-6">
        <Logo />
        <div className="ms-auto flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-16">
        <div className="max-w-3xl animate-fade-up">
          <h1 className="text-balance text-3xl font-bold leading-[1.2] tracking-tight sm:text-[42px]">
            {isRtl ? 'من قاعدة جديدة إلى إثبات تنفيذها' : 'From a new rule to proof it was done'}
          </h1>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-fg-muted sm:text-base">
            {isRtl
              ? 'يصل التعميم، يقرأه الذكاء الاصطناعي بالعربية، ويطابقه على سياساتكم وأنظمتكم، ويحوّل كل فجوة إلى مهمة بمسؤول وموعد ودليل. سبع خطوات، والقرار للإنسان في كل واحدة.'
              : 'A letter arrives, the AI reads the Arabic, maps it onto your own policies and systems, and turns every gap into a task with an owner, a deadline and proof. Seven steps, and a person decides at each one.'}
          </p>
        </div>

        {/* the seven steps, exactly as the product is built */}
        <ol className="mt-10 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((s, i) => {
            const Icon = ICON[s.icon];
            return (
              <li
                key={s.key}
                className="card flex animate-fade-up items-start gap-3 p-4"
                style={{ animationDelay: `${120 + i * 80}ms` }}
              >
                <span className="relative grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary dark:text-accent">
                  <Icon className="size-[18px]" />
                  <span className="absolute -bottom-1 -end-1 grid size-[18px] place-items-center rounded-full border border-border bg-surface font-mono text-[9.5px] font-bold text-fg">
                    {s.n}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold leading-tight">{tb(s.title)}</span>
                  <span className="mt-1 block text-[11.5px] leading-snug text-fg-subtle">{tb(s.asks)}</span>
                </span>
              </li>
            );
          })}

          <li
            className="animate-fade-up rounded-xl border border-dashed border-border p-4 text-[12px] leading-relaxed text-fg-subtle"
            style={{ animationDelay: `${120 + FLOW.length * 80}ms` }}
          >
            {isRtl ? 'كل خطوة تفتح كما هي في المنتج. جرّبها بنفسك.' : 'Every step opens exactly as it works in the product. Try it.'}
          </li>
        </ol>

        <div className="mt-10 flex animate-fade-up items-center" style={{ animationDelay: '820ms' }}>
          <Link
            href="/institution"
            className="focus-ring group inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-fg shadow-sm transition hover:brightness-110"
          >
            {isRtl ? 'ابدأ من الخطوة الأولى' : 'Start at step one'}
            <Arrow className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
