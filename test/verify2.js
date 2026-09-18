const puppeteer = require('puppeteer');
const path = require('path');
const FILE = 'file://' + path.resolve('/home/user/irrigation-dashboard/index.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto(FILE, { waitUntil: 'networkidle0' });
  await sleep(1200);

  // scroll to crops slowly so lazy images load, then verify
  await page.evaluate(async () => { const el = document.querySelector('#cropGrid'); el.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 2500)); });
  const crops = await page.evaluate(() => Array.from(document.querySelectorAll('.crop-card__thumb img')).map(i => ({ complete: i.complete, natural: i.naturalWidth })));
  console.log('crop thumbs:', crops);

  const fields = await page.evaluate(() => Array.from(document.querySelectorAll('.field-card__media img')).map(i => ({ complete: i.complete, natural: i.naturalWidth })));
  console.log('field images:', fields);

  // Settings: check no overlap between sticky bar and form fields
  await page.evaluate(async () => { document.querySelector('#settings').scrollIntoView({ block: 'start' }); await new Promise(r => setTimeout(r, 700)); });
  const overlap = await page.evaluate(() => {
    const bar = document.querySelector('.mobile-actionbar');
    const barRect = bar ? bar.getBoundingClientRect() : null;
    const vis = bar && getComputedStyle(bar).display !== 'none';
    const fields = Array.from(document.querySelectorAll('#settingsForm input, #settingsForm select, #settingsForm button[type=submit]'));
    const covered = fields.filter(f => {
      const r = f.getBoundingClientRect();
      if (!vis || !barRect) return false;
      return !(r.bottom < barRect.top || r.top > barRect.bottom);
    }).map(f => f.id || f.className);
    return { barVisible: vis, coveredCount: covered.length, covered: covered.slice(0, 4) };
  });
  console.log('settings overlap (desktop, bar hidden expected):', overlap);

  // schedule buttons have visible labels
  await page.evaluate(() => {
    const d = new Date(Date.now() + 3600000), pad = n => String(n).padStart(2, '0');
    document.querySelector('#scheduleField').value = 'A';
    document.querySelector('#scheduleDate').value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    document.querySelector('#scheduleTime').value = pad(d.getHours() % 23) + ':' + pad((d.getMinutes() + 20) % 59);
    document.querySelector('#scheduleDuration').value = '18';
    document.querySelector('#scheduleMode').value = 'Scheduled';
  });
  await page.click('#scheduleSubmitBtn'); await sleep(1200);
  console.log('schedule item text:', await page.evaluate(() => document.querySelector('#scheduleList .schedule-item').textContent.replace(/\s+/g, ' ').trim()));

  console.log('temp unit:', await page.evaluate(() => document.querySelector('[data-kpi="temp"] [data-unit="temp"]').textContent.trim()));
  console.log('hero scrim:', await page.evaluate(() => getComputedStyle(document.querySelector('.hero__media'), '::after').backgroundImage.slice(0, 120)));
  console.log('sticky style present:', await page.evaluate(() => !!document.querySelector('.form-actions--sticky')));

  await page.screenshot({ path: '/home/user/test/after-desktop-hero.png' });
  await page.evaluate(() => document.querySelector('#settings').scrollIntoView());
  await sleep(400);
  await page.screenshot({ path: '/home/user/test/after-desktop-settings.png' });

  await page.setViewport({ width: 390, height: 844 });
  await sleep(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  const mobOverlap = await page.evaluate(() => {
    const bar = document.querySelector('.mobile-actionbar');
    const barRect = bar.getBoundingClientRect();
    const els = Array.from(document.querySelectorAll('#settingsForm input, #settingsForm select, #settingsForm button'));
    const covered = els.filter(f => { const r = f.getBoundingClientRect(); return r.bottom > barRect.top && r.top < barRect.bottom; }).length;
    return { zeroWidthFields: els.filter(f => f.getBoundingClientRect().width === 0).length, total: els.length, onScreenCovered: covered };
  });
  console.log('mobile settings fields:', mobOverlap);
  console.log('page errors:', errs);
  await browser.close();
})();
