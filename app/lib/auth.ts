export type UserProfile = {
  id: string;
  name: string;
  initials: string;
  color: string;
  password_hash: string;
  role?: 'admin' | 'diagnostico';
};

export type Session = {
  userId: string;
  userName: string;
  userColor: string;
  userInitials: string;
  userRole: 'admin' | 'diagnostico';
};

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = localStorage.getItem('ferrovalle-session');
    if (!s) return null;
    const parsed = JSON.parse(s);
    // Expire sessions older than 8 hours
    if (parsed.createdAt && Date.now() - parsed.createdAt > SESSION_TTL_MS) {
      localStorage.removeItem('ferrovalle-session');
      return null;
    }
    return { ...parsed, userRole: parsed.userRole ?? 'admin' };
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  localStorage.setItem('ferrovalle-session', JSON.stringify({
    ...session,
    createdAt: Date.now(),
  }));
}

export function clearSession(): void {
  localStorage.removeItem('ferrovalle-session');
}
