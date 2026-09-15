'use client';

import { FLOW, type FlowKey } from '@/lib/flow';
import { LIVE_ANNOUNCEMENT, announcementsFor } from '@/data/announcements';
import { useWorkspaceSession } from '@/lib/session/context';
import { useWorkspace } from '@/lib/store/workspace';
import { scopeObligations, scopeTasks } from '@/lib/scope';
import { worstGap } from '@/data/obligations';

export type StepState = 'done' | 'active' | 'waiting';

export interface StepProgress {
  key: FlowKey;
  state: StepState;
  /** how far through this step we are, when it has a countable inside */
  at: number;
  of: number;
}

/**
 * How far the live scenario has actually got, read from what the person has
 * clicked rather than from a stored step number. Refreshing or jumping
 * straight to a page therefore never puts the journey out of sync.
 */
export function useProgress() {
  const { tenant, user, role } = useWorkspaceSession();
  const ws = useWorkspace();

  const liveId = LIVE_ANNOUNCEMENT[tenant.id];
  const obligations = scopeObligations(tenant.id, role, user);
  const tasks = scopeTasks(tenant.id, role, user);

  const decided = obligations.filter((o) => {
    const s = ws.obligationStatus[o.id] ?? o.status;
    return s === 'confirmed' || s === 'rejected';
  });
  const confirmed = obligations.filter((o) => (ws.obligationStatus[o.id] ?? o.status) === 'confirmed');
  const withGap = obligations.filter((o) => worstGap(o) !== 'none');
  const tasksDone = tasks.filter((x) => (ws.taskStatus[x.id] ?? x.status) === 'done');
  const tasksWithProof = tasks.filter((x) => ws.allEvidence.some((e) => e.taskId === x.id));

  const read = (ws.announcementStatus[liveId] ?? 'new') !== 'new';
  const letters = announcementsFor(tenant.sector);

  // Sending the report closes the case. Nothing behind it can still be open,
  // so the journey must not go on pointing at an earlier step.
  const closed = ws.reportSentAt !== null;

  /** done-ness of each step, before the single active one is marked */
  const raw: Record<FlowKey, { done: boolean; at: number; of: number }> = {
    arrive: { done: true, at: letters.length, of: letters.length },
    read: { done: closed || read, at: read ? 1 : 0, of: 1 },
    approve: { done: closed || (read && decided.length === obligations.length), at: decided.length, of: obligations.length },
    change: { done: closed || confirmed.length > 0, at: confirmed.length, of: withGap.length },
    assign: { done: closed || (tasks.length > 0 && tasksDone.length === tasks.length), at: tasksDone.length, of: tasks.length },
    // the departments have finished and handed something back
    prove: {
      done: closed || (tasks.length > 0 && tasksDone.length === tasks.length && ws.allEvidence.length > 0),
      at: tasksWithProof.length,
      of: tasks.length,
    },
    report: { done: closed, at: closed ? 1 : 0, of: 1 },
  };

  const firstOpen = FLOW.find((s) => !raw[s.key].done)?.key;

  const steps: StepProgress[] = FLOW.map((s) => ({
    key: s.key,
    state: raw[s.key].done ? 'done' : s.key === firstOpen ? 'active' : 'waiting',
    at: raw[s.key].at,
    of: raw[s.key].of,
  }));

  const doneCount = steps.filter((s) => s.state === 'done').length;

  return {
    steps,
    byKey: (k: FlowKey) => steps.find((s) => s.key === k)!,
    /** the step the person should be looking at right now */
    current: firstOpen ?? 'report',
    doneCount,
    total: FLOW.length,
    percent: Math.round((doneCount / FLOW.length) * 100),
  };
}
