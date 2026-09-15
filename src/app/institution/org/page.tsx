'use client';

import { useState } from 'react';
import { Building2, Search, Server, ShieldCheck, Users } from 'lucide-react';
import { PageHeader, RegulatorChip, Row, SectionLabel } from '@/components/features/atoms';
import { Avatar, Badge, Button, Card, CardBody, Empty, Stat } from '@/components/ui/primitives';
import { Drawer } from '@/components/ui/overlay';
import { useLang } from '@/lib/i18n/context';
import { useWorkspaceSession } from '@/lib/session/context';
import { useWorkspace } from '@/lib/store/workspace';
import { byId, dept as deptOf, departmentsOf, inDept, peopleOf } from '@/data/org';
import { systemsOf } from '@/data/systems';
import { roleById } from '@/data/tenants';
import { obligationsOf } from '@/data/obligations';
import { tasksOf } from '@/data/work';
import { cn, count, fmtDate } from '@/lib/utils';
import type { BankSystem, Employee } from '@/lib/types';

type Tab = 'people' | 'systems' | 'institution';

const CRIT_TONE = { critical: 'danger', high: 'warn', medium: 'info', low: 'neutral' } as const;

export default function OrgPage() {
  const { t, tb, lang, isRtl } = useLang();
  const { tenant, sector, user } = useWorkspaceSession();
  const { taskStatus } = useWorkspace();
  const [tab, setTab] = useState<Tab>('people');
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('all');
  const [person, setPerson] = useState<Employee | null>(null);
  const [system, setSystem] = useState<BankSystem | null>(null);

  const DEPARTMENTS = departmentsOf(tenant.id);
  const EMPLOYEES = peopleOf(tenant.id);
  const SYSTEMS = systemsOf(tenant.id);
  const TASKS = tasksOf(tenant.id);
  const OBLIGATIONS = obligationsOf(tenant.id);

  const people = EMPLOYEES.filter((e) => {
    if (dept !== 'all' && e.department !== dept) return false;
    if (!q.trim()) return true;
    return `${tb(e.name)} ${tb(e.title)} ${e.email}`.toLowerCase().includes(q.toLowerCase());
  });

  const systems = SYSTEMS.filter((s) => {
    if (dept !== 'all' && s.ownerDept !== dept) return false;
    if (!q.trim()) return true;
    return `${tb(s.name)} ${s.vendor} ${tb(s.purpose)}`.toLowerCase().includes(q.toLowerCase());
  });

  const tasksOfPerson = (id: string) => TASKS.filter((x) => x.assigneeId === id);
  const rulesOnSystem = (id: string) => OBLIGATIONS.filter((o) => o.mappings.some((m) => m.kind === 'system' && m.targetId === id));

  const TABS: { key: Tab; label: string; icon: typeof Users; n?: number }[] = [
    { key: 'people', label: t('org.people'), icon: Users, n: EMPLOYEES.length },
    { key: 'systems', label: t('org.systems'), icon: Server, n: SYSTEMS.length },
    { key: 'institution', label: isRtl ? 'المنشأة' : 'Institution', icon: Building2 },
  ];

  return (
    <>
      <PageHeader
        title={t('nav.org')}
        subtitle={isRtl ? 'من يملك ماذا، وأين تقع كل قاعدة فعلياً.' : 'Who owns what, and where each rule actually lands.'}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t('org.departments')} value={DEPARTMENTS.length} sub={`${tenant.staff.toLocaleString('en-US')} ${isRtl ? 'موظفاً' : 'staff'}`} />
        <Stat
          label={isRtl ? 'مسؤولون مسمّون' : 'Named owners'}
          value={EMPLOYEES.length}
          tone="primary"
          sub={`${EMPLOYEES.filter((e) => e.approver).length} ${isRtl ? 'لهم صلاحية اعتماد' : 'can sign off'}`}
        />
        <Stat
          label={t('org.systems')}
          value={SYSTEMS.length}
          sub={`${SYSTEMS.filter((s) => s.criticality === 'critical').length} ${isRtl ? 'حرجة' : 'critical'}`}
        />
        <Stat
          label={isRtl ? 'بيانات شخصية' : 'Personal data'}
          value={SYSTEMS.filter((s) => s.holdsPersonalData).length}
          tone="info"
          sub={isRtl ? 'أنظمة تحتفظ ببيانات أفراد' : 'systems holding individual data'}
        />
      </div>

      {/* tabs and filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map(({ key, label, icon: Icon, n }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'focus-ring inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition',
              tab === key ? 'border-primary bg-primary-soft text-primary dark:text-accent' : 'border-border text-fg-muted hover:bg-bg-soft',
            )}
          >
            <Icon className="size-3.5" />
            {label}
            {n !== undefined ? <span className="font-mono">{n}</span> : null}
          </button>
        ))}

        {tab !== 'institution' ? (
          <>
            <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="focus-ring h-8 rounded-lg border border-border bg-surface px-2.5 text-[12.5px] text-fg-muted"
            >
              <option value="all">
                {t('common.department')}: {t('common.all')}
              </option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {tb(d.name)}
                </option>
              ))}
            </select>
            <div className="ms-auto flex min-w-[220px] items-center gap-2 rounded-lg border border-border bg-surface px-3">
              <Search className="size-3.5 shrink-0 text-fg-subtle" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('common.search')}
                className="h-8 w-full bg-transparent text-[12.5px] outline-none placeholder:text-fg-subtle"
              />
            </div>
          </>
        ) : null}
      </div>

      {/* people */}
      {tab === 'people' ? (
        <Card>
          <CardBody className="p-0">
            {people.length === 0 ? (
              <Empty title={t('common.noResults')} />
            ) : (
              <ul className="divide-y divide-border">
                {people.map((e) => (
                  <li key={e.id}>
                    <button
                      onClick={() => setPerson(e)}
                      className="flex w-full flex-wrap items-center gap-4 px-5 py-3 text-start transition hover:bg-bg-soft"
                    >
                      <Avatar name={tb(e.name)} id={e.id} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold">
                          {tb(e.name)}
                          {e.id === user.id ? <span className="ms-2 text-[11px] font-normal text-primary dark:text-accent">({isRtl ? 'أنت' : 'you'})</span> : null}
                        </p>
                        <p className="truncate text-[12px] text-fg-muted">{tb(e.title)}</p>
                      </div>
                      <span className="hidden w-40 shrink-0 truncate text-[12px] text-fg-muted lg:block">{tb(deptOf(tenant.id, e.department)!.name)}</span>
                      <Badge tone={e.role === 'cco' || e.role === 'manager' ? 'primary' : 'neutral'} className="shrink-0">
                        {tb(roleById(e.role).name)}
                      </Badge>
                      <span className="hidden shrink-0 font-mono text-[11px] text-fg-subtle sm:block">{fmtDate(e.joined, lang)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      ) : null}

      {/* systems */}
      {tab === 'systems' ? (
        <Card>
          <CardBody className="p-0">
            {systems.length === 0 ? (
              <Empty title={t('common.noResults')} />
            ) : (
              <ul className="divide-y divide-border">
                {systems.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setSystem(s)}
                      className="flex w-full flex-wrap items-start gap-4 px-5 py-3.5 text-start transition hover:bg-bg-soft"
                    >
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-bg-soft text-fg-muted">
                        <Server className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] text-fg-subtle">{s.id}</span>
                          <p className="truncate text-[13.5px] font-semibold">{tb(s.name)}</p>
                          <Badge tone={CRIT_TONE[s.criticality]}>{s.criticality}</Badge>
                          {s.holdsPersonalData ? <Badge tone="info">{isRtl ? 'بيانات شخصية' : 'personal data'}</Badge> : null}
                        </div>
                        <p className="mt-1 line-clamp-1 text-[12.5px] leading-snug text-fg-muted">{tb(s.purpose)}</p>
                      </div>
                      <span className="hidden shrink-0 text-[11.5px] text-fg-subtle md:block">{s.vendor}</span>
                      {rulesOnSystem(s.id).length > 0 ? (
                        <Badge tone="warn" className="shrink-0">
                          {count(rulesOnSystem(s.id).length, lang, 'rules', 'قواعد', 'قاعدة')}
                        </Badge>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      ) : null}

      {/* institution profile */}
      {tab === 'institution' ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <span
                  className="grid size-12 place-items-center rounded-xl text-lg font-bold"
                  style={{ background: `hsl(${tenant.hue} 42% 88%)`, color: `hsl(${tenant.hue} 55% 26%)` }}
                >
                  {tb(tenant.shortName).trim()[0]}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold">{tb(tenant.name)}</p>
                  <p className="truncate text-[12px] text-fg-muted">{tb(tenant.licence)}</p>
                </div>
              </div>

              <p className="mt-4 text-[13px] leading-relaxed text-fg-muted">{tb(tenant.activity)}</p>

              <div className="mt-4 divide-y divide-border border-t border-border">
                <Row label={t('inst.sector')}>{tb(sector.name)}</Row>
                <Row label={t('inst.city')}>{tb(tenant.city)}</Row>
                <Row label={t('inst.founded')}>{tenant.founded}</Row>
                <Row label={t('inst.staff')}>{tenant.staff.toLocaleString('en-US')}</Row>
                {tenant.network ? <Row label={t('inst.network')}>{tb(tenant.network)}</Row> : null}
                <Row label={t('inst.regulators')}>
                  <span className="inline-flex flex-wrap justify-end gap-1.5">
                    {tenant.regulators.map((r) => (
                      <RegulatorChip key={r} id={r} />
                    ))}
                  </span>
                </Row>
              </div>

              <p className="mt-4 flex items-start gap-2 rounded-lg bg-bg-soft px-3 py-2.5 text-[12px] leading-relaxed text-fg-muted">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" />
                {isRtl
                  ? `${tb(sector.name)}: ${sector.population} منشأة في المملكة. ${tb(sector.populationNote)}`
                  : `${tb(sector.name)}: ${sector.population} in the Kingdom. ${tb(sector.populationNote)}`}
              </p>
            </CardBody>
          </Card>

          <div>
            <SectionLabel>{isRtl ? 'الهيكل التنظيمي' : 'The org chart'}</SectionLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              {DEPARTMENTS.map((d, i) => {
                const head = byId(d.headId);
                return (
                  <button
                    key={d.id}
                    onClick={() => head && setPerson(head)}
                    className="card animate-fade-up p-4 text-start transition hover:-translate-y-0.5 hover:shadow-pop"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <p className="text-[13.5px] font-semibold">{tb(d.name)}</p>
                    <p className="mt-0.5 text-[11.5px] text-fg-subtle">
                      {count(d.headcount, lang, 'staff', 'موظفين', 'موظفاً')} ·{' '}
                      {count(inDept(tenant.id, d.id).length, lang, 'registered', 'مسجلين', 'مسجلاً')}
                    </p>
                    {head ? (
                      <div className="mt-3 flex items-center gap-2.5 border-t border-border pt-3">
                        <Avatar name={tb(head.name)} id={head.id} size={28} />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-medium">{tb(head.name)}</p>
                          <p className="truncate text-[11px] text-fg-subtle">{tb(head.title)}</p>
                        </div>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* person drawer */}
      <Drawer
        open={person !== null}
        onClose={() => setPerson(null)}
        title={person ? tb(person.name) : ''}
        subtitle={person ? tb(person.title) : ''}
        width="max-w-xl"
      >
        {person ? (
          <div className="p-6">
            <div className="flex items-center gap-4">
              <Avatar name={tb(person.name)} id={person.id} size={56} />
              <div className="min-w-0">
                <Badge tone="primary">{tb(roleById(person.role).name)}</Badge>
                <p className="mt-2 text-[12.5px] leading-relaxed text-fg-muted">{tb(roleById(person.role).scope)}</p>
              </div>
            </div>

            <SectionLabel className="mt-6">{isRtl ? 'البيانات' : 'Details'}</SectionLabel>
            <div className="divide-y divide-border border-y border-border">
              <Row label={t('common.department')}>{tb(deptOf(tenant.id, person.department)!.name)}</Row>
              <Row label={t('org.email')}>
                <span className="font-mono text-[12px]">{person.email}</span>
              </Row>
              <Row label={t('org.phone')}>
                <span className="font-mono text-[12px]" dir="ltr">
                  {person.phone}
                </span>
              </Row>
              <Row label={t('org.joined')}>{fmtDate(person.joined, lang)}</Row>
              <Row label={t('org.approver')}>{person.approver ? (isRtl ? 'نعم' : 'Yes') : isRtl ? 'لا' : 'No'}</Row>
              <Row label={isRtl ? 'رقم الموظف' : 'Employee number'}>
                <span className="font-mono text-[12px]">{person.id}</span>
              </Row>
            </div>

            <SectionLabel className="mt-6">
              {t('org.openTasks')} · {tasksOfPerson(person.id).length}
            </SectionLabel>
            {tasksOfPerson(person.id).length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-[12.5px] text-fg-muted">
                {isRtl ? 'لا مهام مسندة لهذا الشخص حالياً.' : 'No tasks are assigned to this person right now.'}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {tasksOfPerson(person.id).map((x) => (
                  <li key={x.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3">
                    <span className="mt-0.5 font-mono text-[10.5px] font-bold text-fg-subtle">{x.id}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-medium leading-snug">{tb(x.title)}</p>
                      <p className="mt-1 font-mono text-[11px] text-fg-subtle">{fmtDate(x.due, lang)}</p>
                    </div>
                    <Badge tone={(taskStatus[x.id] ?? x.status) === 'done' ? 'primary' : 'warn'}>
                      {t(`task.${taskStatus[x.id] ?? x.status}` as 'task.sent')}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </Drawer>

      {/* system drawer */}
      <Drawer
        open={system !== null}
        onClose={() => setSystem(null)}
        title={system ? tb(system.name) : ''}
        subtitle={system ? `${system.id} · ${system.vendor}` : ''}
        width="max-w-xl"
      >
        {system ? (
          <div className="p-6">
            <p className="text-[13.5px] leading-relaxed text-fg-muted">{tb(system.purpose)}</p>

            <SectionLabel className="mt-6">{isRtl ? 'البيانات' : 'Details'}</SectionLabel>
            <div className="divide-y divide-border border-y border-border">
              <Row label={t('org.vendor')}>{system.vendor}</Row>
              <Row label={t('common.owner')}>{tb(deptOf(tenant.id, system.ownerDept)!.name)}</Row>
              <Row label={t('org.criticality')}>
                <Badge tone={CRIT_TONE[system.criticality]}>{system.criticality}</Badge>
              </Row>
              <Row label={t('org.hosting')}>{tb(system.hosting)}</Row>
              <Row label={t('org.personalData')}>{system.holdsPersonalData ? (isRtl ? 'نعم' : 'Yes') : isRtl ? 'لا' : 'No'}</Row>
            </div>

            <SectionLabel className="mt-6">
              {t('org.rulesLanding')} · {rulesOnSystem(system.id).length}
            </SectionLabel>
            {rulesOnSystem(system.id).length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-[12.5px] text-fg-muted">
                {isRtl ? 'لا قاعدة مفتوحة تقع على هذا النظام.' : 'No open rule lands on this system.'}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {rulesOnSystem(system.id).map((o) => {
                  const mp = o.mappings.find((m) => m.kind === 'system' && m.targetId === system.id)!;
                  return (
                    <li key={o.id} className="rounded-lg border border-border bg-surface-2 p-3">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="font-mono text-[10.5px] font-bold text-fg-subtle">{o.id}</span>
                        <Badge tone={mp.gap === 'high' ? 'danger' : mp.gap === 'medium' ? 'warn' : 'info'}>{t(`gap.${mp.gap}` as 'gap.high')}</Badge>
                      </div>
                      <p className="text-[12.5px] leading-snug">{tb(o.statement)}</p>
                      <p className="mt-1.5 text-[11.5px] text-fg-subtle">{tb(mp.locator)}</p>
                    </li>
                  );
                })}
              </ul>
            )}

            <Button variant="secondary" className="mt-6 w-full" onClick={() => setSystem(null)}>
              {t('common.close')}
            </Button>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
