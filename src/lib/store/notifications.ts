'use client';

import type { Bi } from '@/lib/types';
import { LIVE_ANNOUNCEMENT, announcementById } from '@/data/announcements';
import { byId } from '@/data/org';
import { useWorkspaceSession } from '@/lib/session/context';
import { useWorkspace } from '@/lib/store/workspace';
import { scopeObligations, scopeTasks } from '@/lib/scope';
import { daysFromToday } from '@/lib/utils';

export type NoteKind = 'letter' | 'approved' | 'task' | 'evidence' | 'due' | 'approval' | 'sent';

export interface Note {
  id: string;
  kind: NoteKind;
  at: string;
  title: Bi;
  body: Bi;
  href: string;
  /** an unread note is one the session has not opened the bell on since it happened */
  urgent?: boolean;
}

const bi = (en: string, ar: string): Bi => ({ en, ar });

/**
 * What a compliance officer would actually be told about. Every note is
 * derived from the same state the pages read, so the bell can never disagree
 * with the screen behind it.
 */
export function useNotifications(): { notes: Note[]; unread: number } {
  const { tenant, user, role } = useWorkspaceSession();
  const ws = useWorkspace();

  const letter = announcementById(LIVE_ANNOUNCEMENT[tenant.id])!;
  const obligations = scopeObligations(tenant.id, role, user);
  const tasks = scopeTasks(tenant.id, role, user);

  const confirmed = obligations.filter((o) => ws.obligationStatus[o.id] === 'confirmed');
  const open = tasks.filter((x) => (ws.taskStatus[x.id] ?? x.status) !== 'done');
  const overdue = open.filter((x) => daysFromToday(x.due) < 0);
  const soon = open.filter((x) => daysFromToday(x.due) >= 0 && daysFromToday(x.due) <= 14);

  const notes: Note[] = [];

  notes.push({
    id: 'n-letter',
    kind: 'letter',
    at: letter.received,
    title: bi('A new letter arrived', 'وصل تعميم جديد'),
    body: bi(`${letter.reference} · ${letter.title.en}`, `${letter.reference} · ${letter.title.ar}`),
    href: '/institution/announcements',
    urgent: (ws.announcementStatus[letter.id] ?? letter.status) === 'new',
  });

  if (confirmed.length > 0) {
    const last = confirmed
      .map((o) => ws.confirmedBy[o.id])
      .filter(Boolean)
      .sort((a, b) => b.at.localeCompare(a.at))[0];
    const person = last ? byId(last.by) : undefined;
    notes.push({
      id: 'n-approved',
      kind: 'approved',
      at: last?.at ?? letter.received,
      title: bi(`${confirmed.length} obligations confirmed`, `اعتماد ${confirmed.length} التزاماً`),
      body: person
        ? bi(`Approved by ${person.name.en}`, `اعتمدها ${person.name.ar}`)
        : bi('Logged with the approver’s name', 'مسجلة باسم من اعتمدها'),
      href: '/institution/obligations',
    });
  }

  if (tasks.length > 0) {
    notes.push({
      id: 'n-tasks',
      kind: 'task',
      at: letter.received,
      title: bi(`${tasks.length} tasks are with the departments`, `${tasks.length} مهمة لدى الإدارات`),
      body: bi(
        `${open.length} still open across ${new Set(tasks.map((x) => x.dept)).size} departments`,
        `${open.length} مفتوحة في ${new Set(tasks.map((x) => x.dept)).size} إدارات`,
      ),
      href: '/institution/tasks',
    });
  }

  if (overdue.length > 0) {
    notes.push({
      id: 'n-overdue',
      kind: 'due',
      at: new Date().toISOString(),
      title: bi(`${overdue.length} tasks are past their date`, `${overdue.length} مهام تجاوزت موعدها`),
      body: bi('These are what an inspector asks about first.', 'هذه أول ما يسأل عنه المفتش.'),
      href: '/institution/tasks',
      urgent: true,
    });
  } else if (soon.length > 0) {
    notes.push({
      id: 'n-soon',
      kind: 'due',
      at: new Date().toISOString(),
      title: bi(`${soon.length} tasks are due inside 14 days`, `${soon.length} مهام مستحقة خلال 14 يوماً`),
      body: bi('Chase them before the effective date.', 'تابعها قبل تاريخ السريان.'),
      href: '/institution/tasks',
    });
  }

  const uploaded = ws.extraEvidence.filter((e) => e.tenantId === tenant.id);
  if (uploaded.length > 0) {
    const last = uploaded[0];
    const person = byId(last.uploadedBy);
    notes.push({
      id: `n-ev-${last.id}`,
      kind: 'evidence',
      at: last.uploadedAt,
      title: bi('New evidence sealed', 'دليل جديد مختوم'),
      body: person ? bi(`${last.fileName} · ${person.name.en}`, `${last.fileName} · ${person.name.ar}`) : bi(last.fileName, last.fileName),
      href: '/institution/evidence',
    });
  }

  if (ws.approvalRequestedAt && !ws.reportSentAt) {
    const person = ws.approvalRequestedBy ? byId(ws.approvalRequestedBy) : undefined;
    notes.push({
      id: 'n-approval',
      kind: 'approval',
      at: ws.approvalRequestedAt,
      title: bi('The report is up for approval', 'التقرير مرفوع للاعتماد'),
      body: person ? bi(`Submitted by ${person.name.en}`, `رفعه ${person.name.ar}`) : bi('Waiting on the CCO', 'بانتظار رئيس إدارة الالتزام'),
      href: '/institution/report',
      urgent: role.can.sendToRegulator,
    });
  }

  if (ws.reportSentAt) {
    const person = ws.reportSentBy ? byId(ws.reportSentBy) : undefined;
    notes.push({
      id: 'n-sent',
      kind: 'sent',
      at: ws.reportSentAt,
      title: bi('The report was sent and the case closed', 'أُرسل التقرير وأُغلقت الدورة'),
      body: person ? bi(`Sent by ${person.name.en}`, `أرسله ${person.name.ar}`) : bi(letter.reference, letter.reference),
      href: '/institution/report',
    });
  }

  notes.sort((a, b) => b.at.localeCompare(a.at));
  return { notes, unread: notes.filter((n) => n.urgent).length };
}
