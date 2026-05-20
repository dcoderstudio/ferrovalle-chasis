export type UserProfile = {
  id: string;
  name: string;
  initials: string;
  color: string;
  password_hash: string;
};

export type Session = {
  userId: string;
  userName: string;
  userColor: string;
  userInitials: string;
};

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
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  localStorage.setItem('ferrovalle-session', JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem('ferrovalle-session');
}
