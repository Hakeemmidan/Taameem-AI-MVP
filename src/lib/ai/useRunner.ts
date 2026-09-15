'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RunLine, RunPhase, SearchHit } from './script';
import { totalMs } from './script';

export type RunState = 'idle' | 'running' | 'done';

const TICK_MS = 50;

/**
 * Plays a phase script on a single animation-frame loop. Lines and search hits
 * appear at their scripted moment, which is what makes the run feel like work
 * rather than a progress bar.
 */
export function useRunner(phases: RunPhase[], onDone?: () => void) {
  const [state, setState] = useState<RunState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const done = useRef(false);
  const total = totalMs(phases);

  const stop = useCallback(() => {
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
  }, []);

  // The script advances by counting its own ticks rather than reading a clock:
  // requestAnimationFrame is suspended in background tabs and headless browsers,
  // and Date.now() does not always advance under a virtualised clock. A fixed
  // step always plays the whole script, wherever it runs.
  const tick = useCallback(() => {
    setElapsed((prev) => {
      const next = prev + TICK_MS;
      if (next >= total) {
        stop();
        setState('done');
        if (!done.current) {
          done.current = true;
          onDone?.();
        }
        return total;
      }
      return next;
    });
  }, [onDone, stop, total]);

  const start = useCallback(() => {
    stop();
    done.current = false;
    setElapsed(0);
    setState('running');
    timer.current = setInterval(tick, TICK_MS);
  }, [stop, tick]);

  const reset = useCallback(() => {
    stop();
    done.current = false;
    setElapsed(0);
    setState('idle');
  }, [stop]);

  const finish = useCallback(() => {
    stop();
    setElapsed(total);
    setState('done');
    if (!done.current) {
      done.current = true;
      onDone?.();
    }
  }, [onDone, stop, total]);

  useEffect(() => stop, [stop]);

  // where are we in the script right now
  let acc = 0;
  let phaseIndex = phases.length;
  let phaseStart = 0;
  for (let i = 0; i < phases.length; i++) {
    if (elapsed < acc + phases[i].ms) {
      phaseIndex = i;
      phaseStart = acc;
      break;
    }
    acc += phases[i].ms;
  }
  if (phaseIndex === phases.length) phaseStart = total;

  const lines: { key: string; line: RunLine; phaseKey: string }[] = [];
  const hits: { key: string; hit: SearchHit }[] = [];
  let offset = 0;
  for (const p of phases) {
    for (let i = 0; i < p.lines.length; i++) {
      if (state !== 'idle' && elapsed >= offset + p.lines[i].at) lines.push({ key: `${p.key}-${i}`, line: p.lines[i], phaseKey: p.key });
    }
    if (p.search) {
      for (let i = 0; i < p.search.hits.length; i++) {
        const h = p.search.hits[i];
        if (state !== 'idle' && elapsed >= offset + h.at) hits.push({ key: `${p.key}-h${i}`, hit: h.hit });
      }
    }
    offset += p.ms;
  }

  const activePhase = phaseIndex < phases.length ? phases[phaseIndex] : undefined;
  const phaseProgress = activePhase ? Math.min(1, (elapsed - phaseStart) / activePhase.ms) : 1;

  return {
    state,
    elapsed,
    phaseIndex,
    phaseProgress,
    progress: total === 0 ? 0 : Math.round((elapsed / total) * 100),
    lines,
    hits,
    activePhase,
    start,
    reset,
    finish,
  };
}
