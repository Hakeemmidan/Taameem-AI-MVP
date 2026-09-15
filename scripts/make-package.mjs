/**
 * Assembles the folder we hand over: the exported site, the seed files, a
 * zero-dependency server, a launcher and an Arabic read-me whose numbers are
 * read from the data rather than typed by hand.
 *
 *   node scripts/make-package.mjs ["C:\\path\\to\\folder"]
 *
 * Run `npm run build` and `npm run seed` first.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData } from './_bundle.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const OUT = join(repo, 'out');
const SEED = join(repo, 'public', 'seed-files');
const DEST = process.argv[2] ?? join(process.env.USERPROFILE ?? process.env.HOME ?? '.', 'Desktop', 'Taameem-FINAL', '6-App-Demo');

if (!existsSync(OUT)) {
  console.error('No export found. Run:  npm run build');
  process.exit(1);
}
if (!existsSync(SEED)) {
  console.error('No seed files found. Run:  npm run seed');
  process.exit(1);
}

const d = await loadData();
const { TENANTS, SECTORS, DEPARTMENTS, EMPLOYEES, SYSTEMS, POLICIES, ANNOUNCEMENTS, OBLIGATIONS, TASKS, ROLES } = d;


/** Arabic counts 3-10 with the plural and 11+ with the singular. */
const ar = (n, plural, singular) => `${n} ${n >= 3 && n <= 10 ? plural : singular}`;

const of = (list, t) => list.filter((x) => x.tenantId === t.id);
const clauses = (t) => d.libraryStats(t.id).clauses;

/* ------------------------------------------------------------------ copy */
// Empty the folder rather than deleting it: Windows refuses to remove a
// directory that Explorer or a previous server still has open.
mkdirSync(DEST, { recursive: true });
for (const entry of readdirSync(DEST)) rmSync(join(DEST, entry), { recursive: true, force: true });
cpSync(OUT, join(DEST, 'site'), { recursive: true });
cpSync(SEED, join(DEST, 'seed-files'), { recursive: true });
cpSync(join(here, 'serve.mjs'), join(DEST, 'serve.mjs'));

/* --------------------------------------------------------------- launcher */
writeFileSync(
  join(DEST, 'START-DEMO.bat'),
  [
    '@echo off',
    'title Taameem demo',
    'echo.',
    'echo   Starting the Taameem demo...',
    'echo   If port 3100 is busy the server picks the next free one -',
    'echo   read the address printed below.',
    'echo.',
    'start "" http://localhost:3100',
    'node "%~dp0serve.mjs" 3100',
    'pause',
    '',
  ].join('\r\n'),
  'utf8',
);

/* ---------------------------------------------------------------- read me */
const bank = TENANTS.find((t) => t.id === 'TN-BANK');
const bankCco = of(EMPLOYEES, bank).find((e) => e.role === 'cco');

const roleLines = ROLES.filter((r) => r.id !== 'platform')
  .map((r) => `  ${r.name.ar.padEnd(22, ' ')} ${r.scope.ar}`)
  .join('\n');

const tenantLines = TENANTS.map((t) => {
  const sector = SECTORS.find((s) => s.id === t.sector);
  return `  ${t.name.ar.padEnd(26, ' ')} ${sector.name.ar.padEnd(24, ' ')} ${ar(of(POLICIES, t).length, 'سياسات', 'سياسة')} · ${ar(clauses(t), 'بنود', 'بنداً')}`;
}).join('\n');

writeFileSync(
  join(DEST, 'README.txt'),
  `Taameem · تعميم — النسخة التجريبية الكاملة من التطبيق
========================================================

التشغيل
-------
اضغط مرتين على  START-DEMO.bat
يفتح المتصفح على  http://localhost:3100
(يحتاج Node.js مثبتاً. لإيقافه: أغلق النافذة السوداء.)


الفكرة في سطر واحد
------------------
يصل التعميم، يقرأه الذكاء الاصطناعي بالعربية، ويطابقه على سياسات المنشأة
وأنظمتها، ويحوّل كل فجوة إلى مهمة بمسؤول وموعد ودليل، ثم تقرير للجهة الرقابية.


المسار: سبع خطوات
-----------------
الصفحة الأولى هي المسار نفسه. كل خطوة مربع تضغط عليه فيفتح المكان الحقيقي في
المنتج، والمربعات تتلوّن مع تقدمك، فتعرف دائماً أين أنت وما الخطوة التالية.

  1) وصول التعميم         بطريقتين: يجلبه تعميم من موقع الجهة، أو ترفعه أنت
  2) الذكاء يقرأه         يقرأ العربي، ويبحث في المصادر الرسمية، ويستخرج القواعد
  3) شخص يعتمده           لا شيء يدخل السجل قبل قرار إنسان، ويُسجَّل باسمه
  4) ما الذي يجب تغييره   كل قاعدة مقابل بند سياستكم وشاشة نظامكم
  5) المهام تصل للإدارات  مهمة بمسؤول وموعد وتعليمات مرقّمة يبدأ بها فوراً
  6) جمع الإثبات          كل ملف يُختم ببصمة SHA-256 محسوبة من الملف نفسه
  7) التقرير يخرج         تقرير جاهز، انسخه كاملاً أو نزّله مع قائمة الأدلة


الرفع حقيقي، لا تمثيل
---------------------
عند رفع سياسة أو خطاب: اختر ملفاً من جهازك، أو اضغط أحد الملفات الجاهزة،
وسيُقرأ الملف فعلياً في متصفحك. الأرقام التي تظهر — الأسطر والأقسام والبنود
والبنود التي تحمل واجباً أو تذكر مدة — كلها مقيسة من الملف الذي اخترته.
وإن كان الملف PDF أو صورة قلناها صراحة ولم نطبع أرقاماً لم نقرأها.
بعد القراءة يُضاف الملف إلى القائمة أمامك.

وبصمة الأدلة تُحسب بخوارزمية SHA-256 من محتوى الملف نفسه داخل المتصفح.


الأدوار
-------
المستخدم الحالي: ${bankCco.name.ar} — ${ROLES.find((r) => r.id === bankCco.role).name.ar}
تفتح مساحة العمل مباشرة دون تسجيل دخول.
الدور يحدد ما يظهر وما يُقفل: زر الاعتماد، والإرسال للجهة الرقابية، ونطاق ما يراه
رئيس الإدارة.

${roleLines}


المنصة متعددة المنشآت
---------------------
البنية تفصل كل منشأة عن الأخرى تماماً: سياساتها وموظفوها وأنظمتها والتعاميم التي
تخص قطاعها وحدها. البيانات الجاهزة تغطي ثلاث منشآت، وهذه النسخة تفتح مساحة عمل
البنك:

${tenantLines}


كونسول تعميم
------------
جانبنا نحن: المصادر التي نراقبها، وجودة الاستخراج مقاسة بما فعله موظف الالتزام،
وحالة العملاء. لا يصل فريقنا إلى سياسات أي عميل ولا إلى أدلته.


المجلدات
--------
site\\         التطبيق نفسه (ملفات ثابتة، يشتغل بدون إنترنت)
seed-files\\   ما يرفعه موظف الالتزام ليتعلم النظام، مجلد لكل منشأة
serve.mjs     خادم صغير بدون أي مكتبات

الإجمالي: ${ar(POLICIES.length, 'سياسات', 'سياسة')} · ${ar(TENANTS.reduce((n, t) => n + clauses(t), 0), 'بنود', 'بنداً')} · ${ar(EMPLOYEES.length, 'موظفين', 'موظفاً')} · ${ar(SYSTEMS.length, 'أنظمة', 'نظاماً')} · ${ar(ANNOUNCEMENTS.length, 'تعاميم', 'تعميماً')}
والمهام ${ar(TASKS.length, 'مهام', 'مهمة')}، ولكل مهمة تعليمات مرقّمة.

الكود المصدري:  ${repo}


ملاحظة
------
${TENANTS.map((t) => t.name.ar).join(' و')} منشآت افتراضية للعرض. الأسماء والسياسات
واقعية لكنها من تأليفنا، ولا تحتوي على أي وثائق لمنشأة حقيقية. أرقام أحجام
القطاعات (${SECTORS.map((s) => `${s.name.ar} ${s.population}`).join(' · ')}) مأخوذة من
المصادر الرسمية المنشورة.
`,
  'utf8',
);


console.log(`\n  package written to:\n  ${DEST}\n`);
console.log(`  site/        ${OUT}`);
console.log(`  seed-files/  ${SEED}`);
console.log(`  launcher     START-DEMO.bat  (port 3100, falls forward if busy)\n`);
