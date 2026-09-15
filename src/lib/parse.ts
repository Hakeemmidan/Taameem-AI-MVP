/**
 * Reads a file the user actually picked. Everything the upload screen reports
 * is measured here from the bytes in front of it; nothing is assumed. If the
 * file is not text, we say so rather than inventing a result for it.
 */

export type DocKind = 'md' | 'txt' | 'csv' | 'json' | 'pdf' | 'docx' | 'xlsx' | 'image' | 'other';

export interface ParsedDoc {
  name: string;
  sizeKb: number;
  kind: DocKind;
  /** true when we could read the characters, so the numbers below are real */
  readable: boolean;
  lines: number;
  words: number;
  /** share of letters that are Arabic, 0 to 1 */
  arabic: number;
  /** "## 3. Heading" style sections */
  sections: number;
  /** "### 3.2 Heading" style numbered clauses */
  clauses: number;
  /** clauses whose text carries an obligation */
  duties: number;
  /** clauses that name a period */
  deadlines: number;
  /** from the header table of a Taameem policy file, when present */
  code?: string;
  version?: string;
  owner?: string;
  effective?: string;
  regulators: string[];
  tags: string[];
  /** the numbered parts we actually split out, so the read can be checked */
  paragraphs: Paragraph[];
}

export interface Paragraph {
  ref: string;
  ar: string;
  en: string;
  /** the text carries an obligation */
  duty: boolean;
  /** the text names a period */
  deadline: boolean;
}

export const kindOf = (name: string): DocKind => {
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (ext === 'md' || ext === 'markdown') return 'md';
  if (ext === 'txt') return 'txt';
  if (ext === 'csv') return 'csv';
  if (ext === 'json') return 'json';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'docx';
  if (ext === 'xls' || ext === 'xlsx') return 'xlsx';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'tif', 'tiff'].includes(ext)) return 'image';
  return 'other';
};

export const isTextKind = (k: DocKind) => k === 'md' || k === 'txt' || k === 'csv' || k === 'json';

/** Arabic letters, excluding punctuation and digits. */
const AR = /[ء-ي]/g;
const LATIN = /[A-Za-z]/g;

/** Words that make a clause a duty rather than a description, in both languages. */
const DUTY = /(shall|must|may not|is prohibited|يجب|تلتزم|يلتزم|لا يجوز|يحظر|على الشركة|على البنك|تُلزم)/i;

/** A stated period. Catches "five working days" and "خمسة أيام عمل" alike. */
const PERIOD =
  /(\d+\s*(working\s+)?(day|days|month|months|year|years|hour|hours)|(يوم|أيام|شهر|أشهر|سنة|سنوات|ساعة|ساعات)\s*(عمل)?|خلال|within|no later than|قبل انقضاء)/i;

const tableValue = (text: string, keys: string[]) => {
  for (const key of keys) {
    const m = text.match(new RegExp(`^\\|\\s*${key}\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, 'im'));
    if (m) return m[1].trim();
  }
  return undefined;
};

export function parseDoc(name: string, bytes: number, text: string | null): ParsedDoc {
  const kind = kindOf(name);
  const base: ParsedDoc = {
    name,
    sizeKb: Math.max(1, Math.round(bytes / 1024)),
    kind,
    readable: false,
    lines: 0,
    words: 0,
    arabic: 0,
    sections: 0,
    clauses: 0,
    duties: 0,
    deadlines: 0,
    regulators: [],
    tags: [],
    paragraphs: [],
  };

  if (!text) return base;

  const lines = text.split(/\r?\n/);
  const arabicLetters = (text.match(AR) ?? []).length;
  const latinLetters = (text.match(LATIN) ?? []).length;
  const letters = arabicLetters + latinLetters;

  // A policy marks its parts with markdown headings: "## 2. Title" is a section
  // and "### 2.1 Title" is a clause. A regulator letter instead marks each
  // article with a bold reference of its own, "**م-3-أ**". Both are counted.
  const headingSections = lines.filter((l) => /^##\s+\S/.test(l) && !/^###/.test(l)).length;
  const clauseHeads = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /^###\s+\d/.test(l) || /^\*\*[^*]{1,24}\*\*\s*$/.test(l));
  const sections = headingSections || (clauseHeads.length ? 1 : 0);

  // the body under each clause heading, up to the next heading, kept so the
  // person can read back exactly what we split out of their file
  let duties = 0;
  let deadlines = 0;
  const paragraphs: Paragraph[] = [];

  for (let c = 0; c < clauseHeads.length; c++) {
    const from = clauseHeads[c].i + 1;
    const to = c + 1 < clauseHeads.length ? clauseHeads[c + 1].i : lines.length;
    const body = lines.slice(from, to).join(' ');
    const duty = DUTY.test(body);
    const deadline = PERIOD.test(body);
    if (duty) duties++;
    if (deadline) deadlines++;

    const ref = clauseHeads[c].l
      .replace(/^###\s+/, '')
      .replace(/^\*\*|\*\*$/g, '')
      .trim();

    // the Arabic and the English each sit on their own line in these files
    const parts = lines
      .slice(from, to)
      .map((l) => l.replace(/^[*_`]+|[*_`]+$/g, '').trim())
      .filter((l) => l && !l.startsWith('tags:') && !l.startsWith('|'));

    const arabicShare = (l: string) => {
      const a = (l.match(AR) ?? []).length;
      const t = a + (l.match(LATIN) ?? []).length;
      return t ? a / t : 0;
    };
    const ar = parts.filter((l) => arabicShare(l) > 0.5).sort((a, b) => b.length - a.length)[0] ?? '';
    const en = parts.filter((l) => arabicShare(l) <= 0.5).sort((a, b) => b.length - a.length)[0] ?? '';

    paragraphs.push({ ref, ar, en, duty, deadline });
  }

  const tags = Array.from(
    new Set(
      (text.match(/`tags:\s*([^`]+)`/g) ?? []).flatMap((m) =>
        m
          .replace(/`tags:\s*/, '')
          .replace(/`$/, '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ),
  );

  const regulators = Array.from(
    new Set((tableValue(text, ['Regulators', 'الجهات']) ?? '').split(/[,،]/).map((r) => r.trim()).filter(Boolean)),
  );

  return {
    ...base,
    readable: true,
    lines: lines.length,
    words: text.split(/\s+/).filter(Boolean).length,
    arabic: letters ? arabicLetters / letters : 0,
    sections,
    clauses: clauseHeads.length,
    duties,
    deadlines,
    code: tableValue(text, ['Code', 'الرمز']),
    version: tableValue(text, ['Version', 'الإصدار']),
    owner: tableValue(text, ['Owner', 'المالك']),
    effective: tableValue(text, ['Effective', 'السريان']),
    regulators,
    tags,
    paragraphs,
  };
}

/** Reads the file the browser handed us, as text when we can make sense of it. */
export async function readFile(file: File): Promise<ParsedDoc> {
  const kind = kindOf(file.name);
  if (!isTextKind(kind)) return parseDoc(file.name, file.size, null);
  try {
    const text = await file.text();
    return parseDoc(file.name, file.size, text);
  } catch {
    return parseDoc(file.name, file.size, null);
  }
}

/** Pulls one of the shipped seed files so the read can be shown end to end. */
export async function readSample(path: string): Promise<ParsedDoc> {
  const res = await fetch(withBase(path));
  if (!res.ok) throw new Error(`could not fetch ${path}`);
  const text = await res.text();
  const name = decodeURIComponent(path.split('/').pop() ?? path);
  return parseDoc(name, new Blob([text]).size, text);
}

/**
 * The real SHA-256 of the file, which is what the vault seals. Browsers only
 * expose SubtleCrypto in a secure context; localhost counts, so the demo gets
 * a genuine digest rather than a decorative one.
 */
export async function sha256(file: File): Promise<{ digest: string; real: boolean }> {
  try {
    const buf = await file.arrayBuffer();
    const hash = await crypto.subtle.digest('SHA-256', buf);
    const digest = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return { digest, real: true };
  } catch {
    const digest = Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
    return { digest, real: false };
  }
}

/**
 * Prefixes a public asset path with the base the site is served from. Empty in
 * development and in the packaged demo; "/<repo>" on GitHub Pages.
 */
export const withBase = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
