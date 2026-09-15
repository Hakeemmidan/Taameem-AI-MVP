'use client';

import { useRef, useState } from 'react';
import { FileText, Loader2, UploadCloud } from 'lucide-react';
import { useLang } from '@/lib/i18n/context';
import { readFile, readSample, type ParsedDoc } from '@/lib/parse';
import { cn } from '@/lib/utils';

export interface Sample {
  label: string;
  path: string;
}

/**
 * A real file input. Whatever comes back is read from the bytes the person
 * chose, so nothing downstream is invented. Samples point at files that ship
 * with the demo, for when there is nothing to hand.
 */
export function FilePicker({
  accept = '.md,.txt,.csv,.json,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg',
  samples = [],
  hint,
  onPicked,
}: {
  accept?: string;
  samples?: Sample[];
  hint?: string;
  onPicked: (doc: ParsedDoc) => void;
}) {
  const { isRtl } = useLang();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const take = async (file: File) => {
    setBusy(true);
    try {
      onPicked(await readFile(file));
    } finally {
      setBusy(false);
    }
  };

  const takeSample = async (path: string) => {
    setBusy(true);
    try {
      onPicked(await readSample(path));
    } catch {
      /* the sample is missing; the picker simply stays where it is */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void take(f);
        }}
        disabled={busy}
        className={cn(
          'focus-ring group relative flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition',
          over ? 'scale-[1.01] border-primary bg-primary-soft' : 'border-border bg-bg-soft hover:border-border-strong hover:bg-surface-2',
        )}
      >
        <span
          className={cn(
            'grid size-12 place-items-center rounded-full bg-surface text-fg-subtle shadow-sm transition',
            over ? 'text-primary' : 'group-hover:-translate-y-0.5 group-hover:text-fg-muted',
          )}
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <UploadCloud className="size-5" />}
        </span>
        <span className="mt-1 text-[14px] font-semibold">
          {over
            ? isRtl
              ? 'أفلته هنا'
              : 'Drop it here'
            : isRtl
              ? 'اسحب الملف هنا، أو اضغط لاختياره'
              : 'Drag the file here, or click to choose it'}
        </span>
        {hint ? <span className="max-w-sm text-[12px] leading-relaxed text-fg-subtle">{hint}</span> : null}
      </button>

      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void take(f);
          e.target.value = '';
        }}
      />

      {samples.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-fg-subtle">{isRtl ? 'أو جرّب ملفاً جاهزاً:' : 'Or try a file we ship:'}</span>
          {samples.map((s) => (
            <button
              key={s.path}
              type="button"
              disabled={busy}
              onClick={() => void takeSample(s.path)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium transition hover:border-border-strong hover:bg-surface-2 disabled:opacity-50"
            >
              <FileText className="size-3.5 text-fg-subtle" />
              {s.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** The card shown once a file is in hand, above the read. */
export function PickedFile({ doc, onClear }: { doc: ParsedDoc; onClear?: () => void }) {
  const { isRtl } = useLang();
  return (
    <div className="flex animate-fade-up items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-bg-soft font-mono text-[10px] font-bold uppercase text-fg-muted">
        {doc.kind}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[12.5px] font-medium">{doc.name}</p>
        <p className="truncate text-[11.5px] text-fg-subtle">
          {doc.sizeKb.toLocaleString('en-US')} KB
          {doc.readable ? ` · ${doc.lines.toLocaleString('en-US')} ${isRtl ? 'سطر' : 'lines'}` : ''}
        </p>
      </div>
      {onClear ? (
        <button
          onClick={onClear}
          className="focus-ring shrink-0 rounded-lg px-2 py-1 text-[12px] font-medium text-fg-muted hover:bg-bg-soft hover:text-fg"
        >
          {isRtl ? 'غيّر الملف' : 'Change'}
        </button>
      ) : null}
    </div>
  );
}
