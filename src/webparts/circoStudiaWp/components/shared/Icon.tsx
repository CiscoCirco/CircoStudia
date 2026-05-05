import * as React from 'react';

export type IconName =
  | 'home' | 'book' | 'calendar' | 'users' | 'user'
  | 'search' | 'mail' | 'settings' | 'chevronRight' | 'check'
  | 'plus' | 'x' | 'filter' | 'sparkle' | 'logout';

const PATHS: Record<IconName, React.ReactElement> = {
  home: <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>,
  book: <path d="M4 4h10a3 3 0 013 3v13H7a3 3 0 01-3-3V4zm0 13a3 3 0 013 3h10" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
  users: <><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" fill="none"/><circle cx="17" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M3 20c.5-3 3-5 6-5s5.5 2 6 5M15 20c.3-2 1.8-3.6 4-3.6 1.7 0 3 1 4 2.6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></>,
  user: <><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></>,
  search: <><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></>,
  settings: <><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.8" fill="none"/></>,
  chevronRight: <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  check: <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  plus: <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>,
  x: <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>,
  filter: <path d="M4 5h16M7 12h10M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2 2 .8-2 .8L19 22l-.8-2-2-.8 2-.8.8-2z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>,
  logout: <path d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 8l-4 4 4 4M6 12h10" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
};

const Icon: React.FC<{ name: IconName; size?: number; className?: string }> = ({ name, size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: 'block', flexShrink: 0 }}
    className={className}
  >
    {PATHS[name]}
  </svg>
);

export default Icon;

export function avatarColor(id: number): string {
  const hue = (id * 137.508) % 360;
  return `hsl(${hue}, 55%, 52%)`;
}

export function getInitials(name: string): string {
  const parts = (name || '').split(' ').filter(Boolean);
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
}

export function turnoLabel(turno: string): string {
  const map: Record<string, string> = { M: 'Mañana', T: 'Tarde', N: 'Noche' };
  return map[turno] || turno;
}

const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function parseDiasToIndices(diaSemana: string): number[] {
  if (!diaSemana) return [];
  const n = normalize(diaSemana);
  // Each entry: [index, variants to match]
  const dias: [number, string[]][] = [
    [0, ['lunes', 'lun']],
    [1, ['martes', 'mar']],
    [2, ['miercoles', 'mie', 'mié']],
    [3, ['jueves', 'jue']],
    [4, ['viernes', 'vie']],
    [5, ['sabado', 'sab']],
  ];
  return dias
    .filter(([, variants]) => variants.some(v => n.includes(normalize(v))))
    .map(([idx]) => idx);
}

export function turnoToSlotIndex(turno: string): number {
  if (!turno) return -1;
  const n = normalize(turno.trim());
  if (n === 'm' || n.startsWith('man') || n === 'manana' || n === 'mañana') return 0;
  if (n === 't' || n.startsWith('tar') || n === 'tarde' || n === 'v' || n === 'vesp') return 1;
  if (n === 'n' || n.startsWith('noc') || n === 'noche') return 2;
  return -1;
}
