'use client';

import { Check, Clock, FileWarning, Hash, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Badge, Card, CardBody } from '@/components/ui/primitives';
import { Drawer } from '@/components/ui/overlay';
import { Row, SectionLabel } from './atoms';
import { useLang } from '@/lib/i18n/context';
import type { UploadedDoc } from '@/lib/store/workspace';
import { fmtDate, fmtTime } from '@/lib/utils';

/**
 * What we actually read out of a file the person uploaded. This exists so an
 * upload can be checked rather than trusted: every number here was measured,
 * and the parts listed at the bottom are the real text we split out.
 */
export function UploadedDocView({ doc, onClose }: { doc: UploadedDoc | null; onClose: () => void }) {
  const { lang, isRtl } = useLang();
  if (!doc) return null;

  const pct = Math.round(doc.arabic * 100);

  return (
    <Drawer
      open
      onClose={onClose}
      title={doc.name}
      subtitle={`${doc.sizeKb.toLocaleString('en-US')} KB · ${isRtl ? 'رفعته أنت' : 'you uploaded it'} · ${fmtDate(doc.at, lang)} ${fmtTime(doc.at)}`}
      width="max-w-2xl"
    >
      <div className="p-6">
        {/* did it work */}
        {doc.readable ? (
          <div className="flex items-start gap-3 rounded-xl border border-primary/40 bg-primary-soft/50 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-fg">
              <Check className="size-5" strokeWidth={3} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-primary dark:text-accent">
                {isRtl ? 'قُرئ الملف بالكامل' : 'The file was read in full'}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-fg-muted">
                {isRtl
                  ? 'كل رقم أدناه مقيس من هذا الملف. والأجزاء في الأسفل هي النص الذي استُخرج منه فعلاً.'
                  : 'Every number below was measured from this file. The parts at the bottom are the text actually pulled out of it.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-warn/40 bg-warn-soft p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-warn text-white">
              <FileWarning className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-warn">
                {isRtl ? 'لم نستخرج نصاً من هذا الملف' : 'No text was recovered from this file'}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-fg-muted">
                {isRtl
                  ? `هذا ملف ${doc.kind.toUpperCase()}. في النسخة الإنتاجية يمر على التعرف الضوئي العربي أولاً. ولن نعرض أرقاماً لم نقرأها. جرّب ملف .md أو .txt لترى القراءة كاملة.`
                  : `This is a ${doc.kind.toUpperCase()} file. In production it goes through Arabic OCR first. We will not show numbers we did not read. Try a .md or .txt file to see the full read.`}
              </p>
            </div>
          </div>
        )}

        {/* what was measured */}
        {doc.readable ? (
          <>
            <SectionLabel className="mt-6">{isRtl ? 'ما قِيس من الملف' : 'What was measured'}</SectionLabel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: isRtl ? 'أسطر' : 'Lines', v: doc.lines },
                { k: isRtl ? 'كلمات' : 'Words', v: doc.words },
                { k: isRtl ? 'أقسام' : 'Sections', v: doc.sections },
                { k: isRtl ? 'أجزاء مرقمة' : 'Numbered parts', v: doc.clauses },
              ].map((x) => (
                <Card key={x.k} className="p-3">
                  <p className="label-xs">{x.k}</p>
                  <p className="mt-1 font-mono text-[20px] font-bold leading-none">{x.v.toLocaleString('en-US')}</p>
                </Card>
              ))}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Card className="p-3">
                <p className="label-xs">{isRtl ? 'تحمل واجباً' : 'Carry a duty'}</p>
                <p className="mt-1 font-mono text-[20px] font-bold leading-none text-warn">{doc.duties}</p>
              </Card>
              <Card className="p-3">
                <p className="label-xs">{isRtl ? 'تذكر مدة' : 'Name a period'}</p>
                <p className="mt-1 font-mono text-[20px] font-bold leading-none text-info">{doc.deadlines}</p>
              </Card>
              <Card className="p-3">
                <p className="label-xs">{isRtl ? 'نسبة العربية' : 'Arabic share'}</p>
                <p className="mt-1 font-mono text-[20px] font-bold leading-none">{pct}%</p>
              </Card>
            </div>

            {/* the header, when the file carries one */}
            {doc.code || doc.version || doc.owner || doc.effective || doc.regulators.length ? (
              <>
                <SectionLabel className="mt-6">{isRtl ? 'قُرئ من ترويسة الملف' : 'Read from the file header'}</SectionLabel>
                <div className="divide-y divide-border border-y border-border">
                  {doc.code ? (
                    <Row label={isRtl ? 'الرمز' : 'Code'}>
                      <span className="font-mono text-[12px]">{doc.code}</span>
                    </Row>
                  ) : null}
                  {doc.version ? (
                    <Row label={isRtl ? 'الإصدار' : 'Version'}>
                      <span className="font-mono text-[12px]">{doc.version}</span>
                    </Row>
                  ) : null}
                  {doc.owner ? <Row label={isRtl ? 'المالك' : 'Owner'}>{doc.owner}</Row> : null}
                  {doc.effective ? (
                    <Row label={isRtl ? 'تاريخ السريان' : 'Effective'}>
                      <span className="font-mono text-[12px]">{doc.effective}</span>
                    </Row>
                  ) : null}
                  {doc.regulators.length ? (
                    <Row label={isRtl ? 'الجهات' : 'Regulators'}>{doc.regulators.join('، ')}</Row>
                  ) : null}
                </div>
              </>
            ) : null}

            {/* the parts themselves */}
            {doc.paragraphs.length > 0 ? (
              <>
                <SectionLabel className="mt-6">
                  {isRtl ? `الأجزاء التي استُخرجت · ${doc.paragraphs.length}` : `The parts pulled out · ${doc.paragraphs.length}`}
                </SectionLabel>
                <ul className="flex flex-col gap-2">
                  {doc.paragraphs.map((p, i) => (
                    <li
                      key={`${p.ref}-${i}`}
                      className="animate-fade-up rounded-lg border border-border bg-surface p-3.5"
                      style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded bg-bg-soft px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-fg-muted">
                          <Hash className="size-3" />
                          {p.ref}
                        </span>
                        {p.duty ? (
                          <Badge tone="warn">
                            <ShieldCheck className="size-3" />
                            {isRtl ? 'واجب' : 'duty'}
                          </Badge>
                        ) : null}
                        {p.deadline ? (
                          <Badge tone="info">
                            <Clock className="size-3" />
                            {isRtl ? 'مدة' : 'period'}
                          </Badge>
                        ) : null}
                      </div>
                      {p.ar ? (
                        <p dir="rtl" lang="ar" className="font-ar text-[13px] leading-[1.9] text-fg">
                          {p.ar}
                        </p>
                      ) : null}
                      {p.en ? (
                        <p dir="ltr" lang="en" className="mt-1.5 border-t border-border pt-1.5 text-[11.5px] leading-relaxed text-fg-subtle">
                          {p.en}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-surface-2 p-3.5 text-[12.5px] leading-relaxed text-fg-muted">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn" />
                {isRtl
                  ? 'قرأنا النص لكن لم نجد أجزاءً مرقمة فيه. الملفات المرقمة بـ ### أو بمراجع بين نجمتين تُقسَّم تلقائياً.'
                  : 'We read the text but found no numbered parts in it. Files marked with ### headings or bold references are split automatically.'}
              </p>
            )}

            {/* the index */}
            {doc.tags.length > 0 ? (
              <>
                <SectionLabel className="mt-6">
                  {isRtl ? `وسوم الفهرسة · ${doc.tags.length}` : `Index tags · ${doc.tags.length}`}
                </SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="rounded bg-bg-soft px-2 py-0.5 font-mono text-[10.5px] text-fg-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : null}

        {/* what happens to it now */}
        <Card className="mt-6">
          <CardBody>
            <SectionLabel>{isRtl ? 'وماذا بعد' : 'What happens next'}</SectionLabel>
            <p className="text-[12.5px] leading-relaxed text-fg-muted">
              {isRtl
                ? 'الملف الأصلي يبقى داخل المنشأة، ويُخزَّن الفهرس فقط. وكل قاعدة جديدة تصل بعد اليوم تُقارن بما استُخرج منه.'
                : 'The original file stays inside the institution and only the index is stored. Every new rule that arrives from now on is compared against what was pulled out of it.'}
            </p>
          </CardBody>
        </Card>
      </div>
    </Drawer>
  );
}
