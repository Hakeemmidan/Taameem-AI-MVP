'use client';

import { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { AiRunner } from './AiRunner';
import { FilePicker, PickedFile, type Sample } from './FilePicker';
import { Button } from '@/components/ui/primitives';
import { useLang } from '@/lib/i18n/context';
import { ingestRun } from '@/lib/ai/ingest';
import type { ParsedDoc } from '@/lib/parse';
import { count } from '@/lib/utils';

type Stage = 'pick' | 'read' | 'done';

/**
 * Pick a file, watch it be read, see it land. Nothing is shown before a file
 * exists, and every number in the result was measured from that file.
 */
export function IngestFlow({
  samples,
  hint,
  runLabel,
  onAdded,
  doneLabel,
}: {
  samples?: Sample[];
  hint?: string;
  runLabel: string;
  /** fires once, when the read finishes */
  onAdded: (doc: ParsedDoc) => void;
  doneLabel: string;
}) {
  const { t, lang, isRtl } = useLang();
  const [stage, setStage] = useState<Stage>('pick');
  const [doc, setDoc] = useState<ParsedDoc | null>(null);

  const reset = () => {
    setDoc(null);
    setStage('pick');
  };

  if (stage === 'pick' || !doc) {
    return (
      <div>
        <FilePicker
          samples={samples}
          hint={hint}
          onPicked={(d) => {
            setDoc(d);
            setStage('read');
          }}
        />
        <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-fg-muted">
          <Lock className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" />
          {t('up.stays')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PickedFile doc={doc} onClear={stage === 'read' ? undefined : reset} />

      {stage === 'read' ? (
        <>
          <p className="text-[12px] text-fg-subtle">{t('up.realNote')}</p>
          <AiRunner
            key={doc.name}
            phases={ingestRun(doc)}
            runLabel={runLabel}
            autoStart
            onDone={() => {
              setStage('done');
              onAdded(doc);
            }}
          />
        </>
      ) : (
        <div className="animate-fade-up rounded-xl border border-primary/40 bg-primary-soft/50 p-4">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-primary dark:text-accent">
            <Check className="size-4" strokeWidth={3} />
            {doneLabel}
          </p>

          {doc.readable ? (
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              {[
                { k: isRtl ? 'أسطر' : 'Lines', v: doc.lines.toLocaleString('en-US') },
                { k: isRtl ? 'بنود مرقمة' : 'Numbered clauses', v: doc.clauses.toLocaleString('en-US') },
                { k: isRtl ? 'تحمل واجباً' : 'Carry a duty', v: doc.duties.toLocaleString('en-US') },
                { k: isRtl ? 'تذكر مدة' : 'Name a period', v: doc.deadlines.toLocaleString('en-US') },
              ].map((x) => (
                <div key={x.k}>
                  <dt className="label-xs">{x.k}</dt>
                  <dd className="mt-0.5 font-mono text-[17px] font-bold">{x.v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-[12.5px] leading-relaxed text-fg-muted">
              {isRtl
                ? 'حُفظ الملف، ولم نطبع أرقاماً لأننا لم نقرأ نصه. جرّب ملف .md لترى القراءة كاملة.'
                : 'The file is stored. We printed no numbers because we did not read its text. Try a .md file to see the full read.'}
            </p>
          )}

          {doc.readable && doc.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11.5px] text-fg-subtle">
                {count(doc.tags.length, lang, 'index tags', 'وسوم فهرسة', 'وسم فهرسة')}:
              </span>
              {doc.tags.slice(0, 10).map((tag) => (
                <span key={tag} className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <Button variant="secondary" size="sm" className="mt-4" onClick={reset}>
            {t('up.again')}
          </Button>
        </div>
      )}
    </div>
  );
}
