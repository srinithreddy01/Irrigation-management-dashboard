const puppeteer = require('puppeteer');
const path = require('path');
const FILE = 'file://' + path.resolve('/home/user/irrigation-dashboard/index.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = {};
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  const errs = [], perrs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,140)); });
  page.on('pageerror', e => perrs.push(String(e).slice(0,200)));
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto(FILE, { waitUntil: 'networkidle0' });
  await sleep(1600);

  // 1) outage click flow
  await page.click('#simOutageToggle'); await sleep(900);
  out.outageOn = await page.evaluate(() => document.querySelector('[data-kpi="soil"] [data-bind="soilMoisture"]').textContent.trim());
  await page.click('#simOutageToggle'); await sleep(1100);
  out.outageOffKpi = await page.evaluate(() => document.querySelector('[data-kpi="soil"] [data-bind="soilMoisture"]').textContent.trim());
  out.outageErrorHidden = await page.evaluate(() => document.querySelector('#sensorErrorState').hidden);

  // 2) flow consistency: 6 s of pump run at 30 L/min => ~3 L
  const before = await page.evaluate(() => ({
    session: document.querySelector('#sessionWater').textContent.trim(),
    tank: parseFloat(document.querySelector('[data-kpi="tank"] [data-bind="tankPercent"]').textContent.replace(/,/g,'')),
    today: parseFloat(document.querySelector('[data-bind="waterUsedToday"]').textContent.replace(/,/g,''))
  }));
  await page.click('#pumpToggle');
  await sleep(6500);
  const after = await page.evaluate(() => ({
    session: parseFloat(document.querySelector('#sessionWater').textContent.replace(/,/g,'')),
    tank: parseFloat(document.querySelector('[data-kpi="tank"] [data-bind="tankPercent"]').textContent.replace(/,/g,'')),
    today: parseFloat(document.querySelector('[data-bind="waterUsedToday"]').textContent.replace(/,/g,'')),
    runtime: document.querySelector('#pumpRuntimeInfo').textContent.trim()
  }));
  await page.click('#pumpToggle'); await sleep(800);
  out.flow = { before, after, litresDrawn: +(after.today - before.today).toFixed(1), tankDropPct: +(before.tank - after.tank).toFixed(2) };

  // 3) scheduled session runs to completion (1 minute) and marks Completed
  await page.evaluate(() => {
    const d = new Date(), pad = n => String(n).padStart(2,'0');
    document.querySelector('#scheduleField').value = 'C';
    document.querySelector('#scheduleDate').value = d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
    document.querySelector('#scheduleTime').value = pad(d.getHours()) + ':' + pad(d.getMinutes());
    document.querySelector('#scheduleDuration').value = '1';
    document.querySelector('#scheduleMode').value = 'Scheduled';
  });
  await page.click('#scheduleSubmitBtn'); await sleep(1200);
  out.scheduleCreated = await page.evaluate(() => Array.from(document.querySelectorAll('#scheduleList .schedule-item')).map(n => n.textContent.replace(/\s+/g,' ').trim().slice(0,70)));
  // wait for the due-schedule processor (15 s) to fire it
  await sleep(17000);
  out.afterDue = await page.evaluate(() => ({
    pump: document.querySelector('#pumpStatusText').textContent.trim(),
    runtime: document.querySelector('#pumpRuntimeInfo').textContent.trim(),
    runningRow: document.querySelectorAll('#activityTableBody .badge-status.is-tone-info').length
  }));
  // run to completion (60 s planned)
  await sleep(62000);
  out.afterCompletion = await page.evaluate(() => ({
    pump: document.querySelector('#pumpStatusText').textContent.trim(),
    sessions: document.querySelector('[data-bind="sessionsToday"]').textContent.trim(),
    lastRows: Array.from(document.querySelectorAll('#activityTableBody tr')).slice(0,3).map(r => r.textContent.replace(/\s+/g,' ').trim().slice(0,95)),
    scheduleStates: Array.from(document.querySelectorAll('#scheduleList .schedule-item')).map(n => n.textContent.replace(/\s+/g,' ').trim().slice(0,60))
  }));

  // 4) automatic mode: threshold high -> auto start
  await page.evaluate(() => { document.querySelector('#simSpeed').value='2000'; document.querySelector('#simSpeed').dispatchEvent(new Event('change')); });
  await page.evaluate(() => { const t = document.querySelector('#autoIrrigationToggle'); t.checked = true; t.dispatchEvent(new Event('change')); });
  await page.evaluate(() => { const s = document.querySelector('.segmented__btn[data-mode="Automatic"]'); s.click(); });
  await page.evaluate(() => { const i = document.querySelector('#thresholdInput'); i.value = 60; i.dispatchEvent(new Event('input')); });
  await page.click('#saveSettingsBtn');
  await sleep(5000);
  out.autoMode = await page.evaluate(() => ({
    pump: document.querySelector('#pumpStatusText').textContent.trim(),
    mode: document.querySelector('.segmented__btn.is-active').textContent.trim(),
    rule: document.querySelector('#ruleStatusLine').textContent.trim().slice(0,90)
  }));

  console.log(JSON.stringify(out, null, 1));
  console.log('console errors:', errs);
  console.log('page errors:', perrs);
  await browser.close();
})();
