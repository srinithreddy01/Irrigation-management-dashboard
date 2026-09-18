const puppeteer = require('puppeteer');
const path = require('path');
const FILE = 'file://' + path.resolve('/home/user/irrigation-dashboard/index.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0,300)));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text().slice(0,200)); });
  await page.goto(FILE, { waitUntil: 'networkidle0' });
  await sleep(1500);

  // Instrument the toggle
  await page.evaluate(() => {
    window.__log = [];
    const t = document.querySelector('#simOutageToggle');
    t.addEventListener('change', () => window.__log.push('change:' + t.checked));
    window.__probe = () => ({ checked: t.checked, kpi: document.querySelector('[data-kpi="soil"] [data-bind="soilMoisture"]').textContent.trim(), err: !document.querySelector('#sensorErrorState').hidden });
  });

  await page.click('#simOutageToggle'); await sleep(900);
  console.log('after ON :', await page.evaluate(() => window.__probe()), await page.evaluate(() => window.__log));
  await page.click('#simOutageToggle'); await sleep(1200);
  console.log('after OFF:', await page.evaluate(() => window.__probe()), await page.evaluate(() => window.__log));

  // Force-call setOutage via a synthetic change
  await page.evaluate(() => { const t = document.querySelector('#simOutageToggle'); t.checked = true; t.dispatchEvent(new Event('change')); });
  await sleep(700);
  console.log('force ON :', await page.evaluate(() => window.__probe()));
  await page.evaluate(() => { const t = document.querySelector('#simOutageToggle'); t.checked = false; t.dispatchEvent(new Event('change')); });
  await sleep(700);
  console.log('force OFF:', await page.evaluate(() => window.__probe()));

  // Alert count parity check
  const a = await page.evaluate(() => ({
    domCount: document.querySelectorAll('#alertList .alert-item').length,
    storedCount: JSON.parse(localStorage.getItem('aquafarm.alerts.v1') || '[]').length,
    filter: document.querySelector('#alertFilter').value
  }));
  console.log('alert parity:', a);
  await page.reload({ waitUntil: 'networkidle0' }); await sleep(1600);
  const b = await page.evaluate(() => ({
    domCount: document.querySelectorAll('#alertList .alert-item').length,
    storedCount: JSON.parse(localStorage.getItem('aquafarm.alerts.v1') || '[]').length,
    filter: document.querySelector('#alertFilter').value,
    hidden: document.querySelector('#alertEmpty').hidden,
    titles: Array.from(document.querySelectorAll('#alertList .alert-item__title')).map(n => n.textContent.trim()),
    stored: JSON.parse(localStorage.getItem('aquafarm.alerts.v1') || '[]').map(x => x.title + '/' + (x.read?'read':'unread'))
  }));
  console.log('after reload:', JSON.stringify(b, null, 1));
  await browser.close();
})();
