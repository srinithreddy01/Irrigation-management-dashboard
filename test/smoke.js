const puppeteer = require('puppeteer');
const path = require('path');

const FILE = 'file://' + path.resolve('/home/user/irrigation-dashboard/index.html');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [], pageErrors = [], failedRequests = [], consoleWarnings = [];
  page.on('console', m => {
    const t = m.type();
    if (t === 'error') consoleErrors.push(m.text());
    if (t === 'warning') consoleWarnings.push(m.text());
  });
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('requestfailed', r => failedRequests.push(r.url().split('/').slice(-1)[0] + ' :: ' + (r.failure() && r.failure().errorText)));

  await page.goto(FILE, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2200));

  const read = () => page.evaluate(() => {
    const txt = s => { const n = document.querySelector(s); return n ? n.textContent.trim() : null; };
    const chartCount = (typeof Chart !== 'undefined' && Chart.instances) ? Object.keys(Chart.instances).length : 0;
    return {
      title: document.title,
      soilKpi: txt('[data-kpi="soil"] [data-bind="soilMoisture"]'),
      tempKpi: txt('[data-kpi="temp"] [data-bind="temperature"]'),
      humidityKpi: txt('[data-kpi="humidity"] [data-bind="humidity"]'),
      tankKpi: txt('[data-kpi="tank"] [data-bind="tankPercent"]'),
      soilStatus: txt('[data-kpi="soil"] .status-tag__text'),
      pumpStatus: txt('#pumpStatusText'),
      waterUsedToday: txt('[data-bind="waterUsedToday"]'),
      activityRows: document.querySelectorAll('#activityTableBody tr').length,
      alertItems: document.querySelectorAll('#alertList .alert-item').length,
      scheduleItems: document.querySelectorAll('#scheduleList .schedule-item').length,
      fieldCards: document.querySelectorAll('#fieldGrid .field-card').length,
      cropCards: document.querySelectorAll('#cropGrid .crop-card').length,
      healthScore: txt('#healthRingScore'),
      bellCount: txt('#bellCount'),
      chartCount: chartCount,
      scoreParts: Array.from(document.querySelectorAll('#scoreList .score-list__value')).map(n => n.textContent.trim()),
      weekTotal: txt('#weekTotal'),
      weekDelta: txt('#weekDelta'),
      recommendationHeadline: txt('#recommendationHeadline'),
      tankHeight: document.querySelector('#tankWater') ? document.querySelector('#tankWater').style.height : null,
      faRendered: (() => { // check that icon font actually rendered (glyph width)
        const i = document.querySelector('.main-nav__link i'); if (!i) return null;
        const cs = getComputedStyle(i, '::before');
        return { family: cs.fontFamily, content: cs.content };
      })(),
      fonts: Array.from(document.fonts).map(f => f.family + ':' + f.status)
    };
  });

  const initial = await read();
  console.log('--- INITIAL STATE ---');
  console.log(JSON.stringify(initial, null, 1));

  // Test 1: pump toggle
  await page.click('#pumpToggle');
  await new Promise(r => setTimeout(r, 1200));
  const afterPump = await page.evaluate(() => ({
    pump: document.querySelector('#pumpStatusText').textContent.trim(),
    runtime: document.querySelector('#pumpRuntimeInfo').textContent.trim(),
    flow: document.querySelector('#flowRate').textContent.trim(),
    toasts: document.querySelectorAll('.toast-item').length,
    runningRows: document.querySelectorAll('#activityTableBody .badge-status.is-tone-info').length
  }));
  console.log('--- AFTER PUMP ON ---');
  console.log(JSON.stringify(afterPump));

  // wait for a couple of sensor ticks
  await new Promise(r => setTimeout(r, 6000));
  const afterTicks = await page.evaluate(() => ({
    sessionWater: document.querySelector('#sessionWater').textContent.trim(),
    tankPercent: document.querySelector('[data-kpi="tank"] [data-bind="tankPercent"]').textContent.trim(),
    waterUsedToday: document.querySelector('[data-bind="waterUsedToday"]').textContent.trim(),
    updates: document.querySelector('#simUpdateCount').textContent.trim()
  }));
  console.log('--- AFTER SENSOR TICKS (pump running) ---');
  console.log(JSON.stringify(afterTicks));

  // Test 2: stop pump
  await page.click('#pumpToggle');
  await new Promise(r => setTimeout(r, 900));
  const afterStop = await page.evaluate(() => ({
    pump: document.querySelector('#pumpStatusText').textContent.trim(),
    completedRows: document.querySelectorAll('#activityTableBody .badge-status.is-tone-success').length,
    sessions: document.querySelector('[data-bind="sessionsToday"]').textContent.trim()
  }));
  console.log('--- AFTER PUMP OFF ---');
  console.log(JSON.stringify(afterStop));

  console.log('--- ERRORS ---');
  console.log('consoleErrors:', consoleErrors);
  console.log('pageErrors:', pageErrors);
  console.log('failedRequests:', failedRequests);
  console.log('warnings:', consoleWarnings.slice(0, 10));

  await page.screenshot({ path: '/home/user/test/desktop-top.png' });
  await browser.close();
})();
