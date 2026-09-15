import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Arabic-Indic digits look wrong inside Latin UI chrome, so numbers stay Western. */
export const fmtNum = (n: number) => n.toLocaleString('en-US');

export const fmtSar = (n: number, lang: 'en' | 'ar' = 'en') =>
  lang === 'ar' ? `${fmtNum(n)} ريال` : `SAR ${fmtNum(n)}`;

export const fmtSarShort = (n: number, lang: 'en' | 'ar' = 'en') => {
  const v = n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}m` : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
  return lang === 'ar' ? `${v} ريال` : `SAR ${v}`;
};

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export const fmtDate = (iso: string, lang: 'en' | 'ar' = 'en') => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = lang === 'ar' ? MONTHS_AR : MONTHS_EN;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const fmtTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** "in 12 days" / "3 days ago", relative to the demo's fixed today. */
export const DEMO_TODAY = new Date('2026-09-14T10:00:00');

export const daysFromToday = (iso: string) =>
  Math.round((new Date(iso).getTime() - DEMO_TODAY.getTime()) / 86_400_000);

export const relDays = (iso: string, lang: 'en' | 'ar' = 'en') => {
  const d = daysFromToday(iso);
  if (lang === 'ar') return d === 0 ? 'اليوم' : d > 0 ? `خلال ${d} يوم` : `متأخر ${Math.abs(d)} يوم`;
  return d === 0 ? 'today' : d > 0 ? `in ${d} days` : `${Math.abs(d)} days overdue`;
};

export const pct = (n: number, of: number) => (of === 0 ? 0 : Math.round((n / of) * 100));

/** Stable pseudo-random from a string, so generated avatars never flicker. */
export const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Arabic counts a noun differently depending on the number: three to ten take
 * the plural ("9 التزامات"), eleven and above take the singular ("134 بنداً").
 * Pass both forms and the right one comes back with the number attached.
 */
export const arCount = (n: number, plural: string, singular: string) =>
  `${n} ${n >= 3 && n <= 10 ? plural : singular}`;

/** The same count in whichever language is on screen. */
export const count = (n: number, lang: 'en' | 'ar', en: string, arPlural: string, arSingular: string) =>
  lang === 'ar' ? arCount(n, arPlural, arSingular) : `${n} ${en}`;
