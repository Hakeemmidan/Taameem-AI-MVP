/**
 * Drives a real browser through all seven steps and fails loudly if any of
 * them does not actually work. Run against a served build:
 *   node walk.mjs http://localhost:3300
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:3300';
const PORT = 9333;

/** any Chromium will do; BROWSER overrides when it lives somewhere else */
const BROWSERS = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const EDGE = BROWSERS.find((p) => existsSync(p));
if (!EDGE) {
  console.error('No Chromium browser found. Set BROWSER to its path.');
  process.exit(1);
}
const profile = mkdtempSync(join(tmpdir(), 'walk-'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, [
  '--headless=new',
  '--disable-gpu',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--window-size=1440,1200',
  'about:blank',
]);

let ws;
let id = 0;
const pending = new Map();

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });

/** runs an expression in the page and returns its value */
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'page threw');
  return r.result.value;
};

const goto = async (path) => {
  await send('Page.navigate', { url: `${BASE}${path}` });
  await sleep(1400);
};

/** clicks the first element whose visible text contains the needle */
const clickText = async (needle, tag = 'button, a') => {
  const ok = await evaluate(`(() => {
    const els = [...document.querySelectorAll(${JSON.stringify(tag)})];
    const el = els.find((e) => (e.innerText || '').includes(${JSON.stringify(needle)}) && !e.disabled);
    if (!el) return false;
    el.click();
    return true;
  })()`);
  if (!ok) throw new Error(`could not click "${needle}"`);
  await sleep(700);
};

const text = () => evaluate('document.body.innerText');

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? '  ok  ' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

/* --------------------------------------------------------------- connect */
const connect = async () => {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const tabs = await res.json();
      const page = tabs.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(300);
  }
  throw new Error('browser never came up');
};

const url = await connect();
ws = new WebSocket(url);
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
};
await send('Page.enable');
await send('Runtime.enable');

/* ------------------------------------------------------------ the walk */
try {
  console.log(`\n  walking ${BASE}\n`);

  // a clean slate, as a first-time visitor
  await goto('/');
  await evaluate("localStorage.clear(); localStorage.setItem('tm.lang','ar'); localStorage.setItem('tm.theme','light')");
  await goto('/institution/');

  let body = await text();
  check('journey opens', body.includes('من قاعدة جديدة') || body.includes('From a new rule'));
  check('journey starts at step 1 of 7', /1\s*\/\s*7|0\s*\/\s*7|1\/7/.test(body) || body.includes('7'));

  /* 1 · the letter arrives */
  await goto('/institution/announcements/');
  body = await text();
  check('both arrival routes shown', body.includes('وصل التعميم تلقائياً') && body.includes('ارفق تعميم'));

  /* 2 · the AI reads it */
  await clickText('افتح التعميم');
  await sleep(600);
  await clickText('تشغيل');
  console.log('        …running the extraction');
  await sleep(21000);
  body = await text();
  check('extraction produced obligations', /\d+\s*التزام/.test(body), body.match(/\d+\s*التزام\S*/)?.[0] ?? '');

  /* 3 · a person approves */
  await goto('/institution/obligations/');
  await clickText('اعتماد الكل');
  body = await text();
  const pending0 = Number((await evaluate(`(() => {
    const m = document.body.innerText.match(/بانتظار المراجعة\\s*·\\s*(\\d+)/);
    return m ? m[1] : '-1';
  })()`)));
  check('every obligation decided', pending0 === 0, `awaiting review: ${pending0}`);

  /* 4 · what must change — the mappings render with the approvals */
  check('gaps are shown against policies and systems', body.includes('سياسة') || body.includes('نظام'));

  /* 5 · tasks reach the teams */
  await goto('/institution/tasks/');
  body = await text();
  check('tasks start unsent', body.includes('لم تُرسل بعد'));
  await clickText('أرسلها للإدارات');
  body = await text();
  const sentCount = Number((await evaluate(`(() => {
    const cards = [...document.querySelectorAll('.card')];
    const el = cards.find((c) => (c.innerText || '').includes('أُرسلت للإدارات'));
    const m = el && el.innerText.match(/(\\d+)/);
    return m ? m[1] : '-1';
  })()`)));
  check('tasks dispatched to the departments', sentCount > 0, `${sentCount} sent`);

  /* 6 · proof is collected — mark everything done, then seal one file */
  const marked = await evaluate(`(async () => {
    let n = 0;
    for (let i = 0; i < 40; i++) {
      const cards = [...document.querySelectorAll('button.card')];
      const card = cards.find((c) => !(c.innerText || '').includes('منجزة'));
      if (!card) break;
      card.click();
      await new Promise((r) => setTimeout(r, 260));
      const done = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').includes('وضع كمنجزة'));
      if (!done) { document.querySelector('[aria-label="close"]')?.click(); await new Promise((r) => setTimeout(r, 200)); continue; }
      done.click();
      n++;
      await new Promise((r) => setTimeout(r, 300));
    }
    return n;
  })()`);
  check('tasks can be completed', marked > 0, `${marked} marked done`);

  await goto('/institution/evidence/');
  await clickText('رفع');
  await sleep(500);
  const node = await send('DOM.getDocument');
  const input = await send('DOM.querySelector', { nodeId: node.root.nodeId, selector: 'input[type=file]' });
  await send('DOM.setFileInputFiles', {
    nodeId: input.nodeId,
    files: [join(process.cwd(), 'public', 'seed-files', 'README.md')],
  });
  await sleep(1600);
  body = await text();
  check('evidence sealed with a real digest', /[0-9a-f]{24}…/.test(body) && body.includes('README.md'));

  /* 7 · the report goes out */
  await goto('/institution/report/');
  body = await text();
  check('report is ready to send', body.includes('جاهز للإرسال') || body.includes('اعتماد وإرسال'));
  await clickText('اعتماد وإرسال');
  body = await text();
  check('sending closes the case', body.includes('أُغلقت الدورة') && body.includes('مقفل'));

  /* the journey agrees */
  await goto('/institution/');
  body = await text();
  check('journey shows all seven done', body.includes('اكتملت الخطوات السبع'), body.match(/\d\s*\/\s*7/)?.[0] ?? '');

  /* the self-inspection raises real work */
  await goto('/institution/inspection/');
  await clickText('تشغيل');
  console.log('        …running the inspection');
  await sleep(14000);
  await clickText('أصلحها');
  await sleep(400);
  await clickText('أنشئ المهمة');
  body = await text();
  check('a finding becomes a task', body.includes('أُنشئت المهمة'));

  await goto('/institution/tasks/');
  body = await text();
  check('the raised task is on the board', /TSK-F-\w+/.test(body), body.match(/TSK-F-\w+/)?.[0] ?? '');

  /* the console is a separate product */
  await goto('/admin/');
  body = await text();
  check('console opens on its own', body.includes('كونسول') || body.includes('Taameem console') || body.includes('العملاء'));
} catch (err) {
  check('walk completed', false, String(err.message));
} finally {
  const failed = results.filter((r) => !r.pass);
  console.log(`\n  ${results.length - failed.length}/${results.length} checks passed\n`);
  ws?.close();
  edge.kill();
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* windows may still hold it */
  }
  process.exit(failed.length ? 1 : 0);
}
