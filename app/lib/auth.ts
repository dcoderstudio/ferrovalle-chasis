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

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// sessionStorage: session lives only while the browser tab is open.
// Closing the tab or browser always requires logging in again.
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = sessionStorage.getItem('ferrovalle-session');
    if (!s) return null;
    const parsed = JSON.parse(s);
    return { ...parsed, userRole: parsed.userRole ?? 'admin' };
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  // Also clear any old localStorage session from previous versions
  try { localStorage.removeItem('ferrovalle-session'); } catch {}
  sessionStorage.setItem('ferrovalle-session', JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem('ferrovalle-session');
}
