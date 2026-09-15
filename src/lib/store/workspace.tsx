'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AnnouncementStatus, Evidence, ObligationStatus, Task, TaskStatus } from '@/lib/types';
import { OBLIGATIONS } from '@/data/obligations';
import { ANNOUNCEMENTS } from '@/data/announcements';
import { EVIDENCE, TASKS, evidenceOf } from '@/data/work';
import { useWorkspaceSession } from '@/lib/session/context';
import { scopeObligations, scopeTasks } from '@/lib/scope';
import type { ParsedDoc } from '@/lib/parse';

/**
 * A file the person uploaded during the session, carrying everything we read
 * out of it, so the upload can be opened and checked rather than taken on
 * trust.
 */
export type UploadedDoc = ParsedDoc & {
  id: string;
  at: string;
};

/**
 * Everything a demo session can change. Seeded from the data files, then kept
 * in localStorage under a key that includes the institution, so a bank session
 * and an insurance session never overwrite each other.
 */
interface WorkspaceState {
  obligationStatus: Record<string, ObligationStatus>;
  confirmedBy: Record<string, { by: string; at: string }>;
  taskStatus: Record<string, TaskStatus>;
  announcementStatus: Record<string, AnnouncementStatus>;
  extraLibrary: UploadedDoc[];
  extraLetters: UploadedDoc[];
  extraEvidence: Evidence[];
  /** tasks raised from a self-inspection finding rather than from a letter */
  extraTasks: Task[];
  /** which findings have already been turned into a task */
  fixedFindings: Record<string, string>;
  reportSentAt: string | null;
  reportSentBy: string | null;
  /** a role that may not send can still put the report up for approval */
  approvalRequestedAt: string | null;
  approvalRequestedBy: string | null;
  inspectionRunAt: string | null;
}

const seed = (): WorkspaceState => ({
  obligationStatus: Object.fromEntries(OBLIGATIONS.map((o) => [o.id, o.status])),
  confirmedBy: {},
  taskStatus: Object.fromEntries(TASKS.map((t) => [t.id, t.status])),
  announcementStatus: Object.fromEntries(ANNOUNCEMENTS.map((a) => [a.id, a.status])),
  extraLibrary: [],
  extraLetters: [],
  extraEvidence: [],
  extraTasks: [],
  fixedFindings: {},
  reportSentAt: null,
  reportSentBy: null,
  approvalRequestedAt: null,
  approvalRequestedBy: null,
  inspectionRunAt: null,
});

interface WorkspaceValue extends WorkspaceState {
  confirmObligation: (id: string) => void;
  rejectObligation: (id: string) => void;
  confirmAll: (ids: string[]) => void;
  setTaskStatus: (id: string, s: TaskStatus) => void;
  setAnnouncementStatus: (id: string, s: AnnouncementStatus) => void;
  addLibraryDoc: (doc: UploadedDoc) => void;
  addLetter: (doc: UploadedDoc) => void;
  addEvidence: (e: Evidence) => void;
  /** raises the task a finding needs, and remembers which finding it came from */
  fixFinding: (findingId: string, task: Task) => void;
  /** every task this person can see, seeded and raised alike */
  allTasks: Task[];
  /** seeded evidence for this institution plus anything uploaded in the demo */
  allEvidence: Evidence[];
  /** closes the case: the letter is marked reported and nothing else may change */
  sendReport: (announcementId: string) => void;
  requestApproval: () => void;
  markInspected: () => void;
  reset: () => void;
  /** obligations in this institution still waiting for a human decision */
  pendingCount: number;
  /** tasks in this institution not yet done */
  openTaskCount: number;
}

const Ctx = createContext<WorkspaceValue | null>(null);
const keyFor = (tenantId: string) => `tm.workspace.v2.${tenantId}`;

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { tenant, user, role } = useWorkspaceSession();
  const storage = keyFor(tenant.id);
  const [state, setState] = useState<WorkspaceState>(seed);

  useEffect(() => {
    let next = seed();
    try {
      const raw = localStorage.getItem(storage);
      if (raw) next = { ...next, ...(JSON.parse(raw) as WorkspaceState) };
    } catch {
      /* ignore a corrupt session */
    }
    setState(next);
  }, [storage]);

  const persist = useCallback(
    (next: WorkspaceState) => {
      setState(next);
      try {
        localStorage.setItem(storage, JSON.stringify(next));
      } catch {
        /* private mode */
      }
    },
    [storage],
  );

  const value = useMemo<WorkspaceValue>(() => {
    const stamp = () => ({ by: user.id, at: new Date().toISOString() });
    // The sidebar badges must count what this person can actually open, or a
    // department head sees a 9 and finds three.
    const mine = scopeObligations(tenant.id, role, user);
    const raised = state.extraTasks.filter(
      (x) => x.tenantId === tenant.id && (!role.can.ownDepartmentOnly || x.dept === user.department),
    );
    const myTasks = [...raised, ...scopeTasks(tenant.id, role, user)];
    const myTaskIds = new Set(myTasks.map((x) => x.id));
    return {
      ...state,
      allEvidence: [...evidenceOf(tenant.id), ...state.extraEvidence.filter((e) => e.tenantId === tenant.id)].filter(
        (e) => !role.can.ownDepartmentOnly || myTaskIds.has(e.taskId),
      ),
      allTasks: myTasks,
      pendingCount: mine.filter((o) => (state.obligationStatus[o.id] ?? o.status) === 'extracted').length,
      openTaskCount: myTasks.filter((t) => (state.taskStatus[t.id] ?? t.status) !== 'done').length,
      confirmObligation: (id) =>
        persist({
          ...state,
          obligationStatus: { ...state.obligationStatus, [id]: 'confirmed' },
          confirmedBy: { ...state.confirmedBy, [id]: stamp() },
        }),
      rejectObligation: (id) =>
        persist({ ...state, obligationStatus: { ...state.obligationStatus, [id]: 'rejected' } }),
      confirmAll: (ids) =>
        persist({
          ...state,
          obligationStatus: { ...state.obligationStatus, ...Object.fromEntries(ids.map((i) => [i, 'confirmed' as const])) },
          confirmedBy: { ...state.confirmedBy, ...Object.fromEntries(ids.map((i) => [i, stamp()])) },
        }),
      setTaskStatus: (id, s) => persist({ ...state, taskStatus: { ...state.taskStatus, [id]: s } }),
      setAnnouncementStatus: (id, s) => persist({ ...state, announcementStatus: { ...state.announcementStatus, [id]: s } }),
      addLibraryDoc: (doc) => persist({ ...state, extraLibrary: [doc, ...state.extraLibrary] }),
      addLetter: (doc) => persist({ ...state, extraLetters: [doc, ...state.extraLetters] }),
      addEvidence: (e) => persist({ ...state, extraEvidence: [e, ...state.extraEvidence] }),
      fixFinding: (findingId, task) =>
        persist({
          ...state,
          extraTasks: [task, ...state.extraTasks],
          taskStatus: { ...state.taskStatus, [task.id]: task.status },
          fixedFindings: { ...state.fixedFindings, [findingId]: task.id },
        }),
      sendReport: (announcementId) =>
        persist({
          ...state,
          reportSentAt: new Date().toISOString(),
          reportSentBy: user.id,
          announcementStatus: { ...state.announcementStatus, [announcementId]: 'reported' },
        }),
      requestApproval: () =>
        persist({ ...state, approvalRequestedAt: new Date().toISOString(), approvalRequestedBy: user.id }),
      markInspected: () => persist({ ...state, inspectionRunAt: new Date().toISOString() }),
      reset: () => {
        try {
          localStorage.removeItem(storage);
        } catch {
          /* ignore */
        }
        setState(seed());
      },
    };
  }, [state, persist, storage, tenant.id, user, role]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return v;
}

/** Seeded evidence for an institution, ignoring the live session. */
export const seededEvidence = (tenantId: string) => EVIDENCE.filter((e) => e.tenantId === tenantId);
