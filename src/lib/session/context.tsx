'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { byId } from '@/data/org';
import { ROLES, TENANTS, roleById, sectorById, tenantById, type Role, type Sector, type Tenant } from '@/data/tenants';
import type { Employee } from '@/lib/types';

/**
 * Who is signed in and which institution they belong to. A bank officer and an
 * insurance officer are different accounts: nothing on screen is ever shared
 * between them, so every page reads the tenant from here and filters by it.
 */
export interface Session {
  tenantId: string;
  userId: string;
  at: string;
}

interface SessionValue {
  /** false until localStorage has been read, so nothing renders twice */
  ready: boolean;
  session: Session | null;
  tenant: Tenant | null;
  sector: Sector | null;
  user: Employee | null;
  role: Role | null;
  /** opens a named workspace; used by our own hand-over links */
  signIn: (tenantId: string, userId: string) => void;
  tenants: Tenant[];
  roles: Role[];
}

const Ctx = createContext<SessionValue | null>(null);
const STORAGE = 'tm.session.v2';

/**
 * The workspace is always open. This is a working demo of one compliance
 * team's day, not an account system: there is no sign-in screen and no way to
 * swap identity from the interface. ?as= stays for our own walk-throughs.
 */
export const DEFAULT_SESSION: Session = { tenantId: 'TN-BANK', userId: 'E-001', at: '2026-09-15T08:00:00' };

const valid = (s: Session | null): s is Session => {
  if (!s) return false;
  const person = byId(s.userId);
  return Boolean(person && person.tenantId === s.tenantId);
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const keep = useCallback((next: Session | null) => {
    setSession(next);
    try {
      if (next) localStorage.setItem(STORAGE, JSON.stringify(next));
      else localStorage.removeItem(STORAGE);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    // ?as=E-001 opens a named workspace directly. It is how we hand a screen
    // over internally; nothing in the interface offers it.
    let fromUrl: Session | null = null;
    try {
      const asId = new URLSearchParams(window.location.search).get('as');
      const person = asId ? byId(asId) : undefined;
      if (person) fromUrl = { tenantId: person.tenantId, userId: person.id, at: new Date().toISOString() };
    } catch {
      /* no URL to read */
    }

    let saved: Session | null = null;
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) saved = JSON.parse(raw) as Session;
    } catch {
      /* corrupt or unavailable storage */
    }

    if (valid(fromUrl)) keep(fromUrl);
    else setSession(valid(saved) ? saved : DEFAULT_SESSION);
    setReady(true);
  }, [keep]);

  const signIn = useCallback(
    (tenantId: string, userId: string) => keep({ tenantId, userId, at: new Date().toISOString() }),
    [keep],
  );

  const value = useMemo<SessionValue>(() => {
    const user = session ? byId(session.userId) ?? null : null;
    const tenant = session ? tenantById(session.tenantId) ?? null : null;
    return {
      ready,
      session,
      user,
      tenant,
      sector: tenant ? sectorById(tenant.sector) : null,
      role: user ? roleById(user.role) ?? null : null,
      signIn,
      tenants: TENANTS,
      roles: ROLES,
    };
  }, [ready, session, signIn]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession must be used inside <SessionProvider>');
  return v;
}

/**
 * Inside the institution portal a session always exists, because the layout
 * will not render a page without one. This saves every page a null check.
 */
export function useWorkspaceSession() {
  const s = useSession();
  if (!s.tenant || !s.user || !s.role || !s.sector) {
    throw new Error('useWorkspaceSession used outside a signed-in workspace');
  }
  return { tenant: s.tenant, user: s.user, role: s.role, sector: s.sector, signIn: s.signIn };
}
