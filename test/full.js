const puppeteer = require('puppeteer');
const path = require('path');
const FILE = 'file://' + path.resolve('/home/user/irrigation-dashboard/index.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = {}, errors = [], pageErrors = [], failed = [];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
    page.on('pageerror', e => pageErrors.push(String(e).slice(0, 220)));
    page.on('requestfailed', r => failed.push(r.url().split('/').pop()));

    await page.setViewport({ width: 1440, height: 950 });
    await page.goto(FILE, { waitUntil: 'networkidle0', timeout: 60000 });
    await sleep(1800);

    const grab = () => page.evaluate(() => {
      const t = s => { const n = document.querySelector(s); return n ? n.textContent.trim() : null; };
      const storage = {};
      try { for (const k of Object.keys(localStorage)) storage[k] = (localStorage.getItem(k) || '').length + ' chars'; } catch (e) { storage.error = String(e); }
      return {
        pump: t('#pumpStatusText'), session: t('#sessionWater'), tank: t('[data-kpi="tank"] [data-bind="tankPercent"]'),
        waterToday: t('[data-bind="waterUsedToday"]'), recHead: t('#recommendationHeadline'),
        recDuration: t('#recDuration'), recWater: t('#recWater'),
        alerts: document.querySelectorAll('#alertList .alert-item').length, unread: t('#bellCount'),
        rows: document.querySelectorAll('#activityTableBody tr').length,
        schedules: document.querySelectorAll('#scheduleList .schedule-item').length,
        health: t('#healthRingScore'), storage: storage
      };
    });

    results.initial = await grab();

    // Settings: valid save
    await page.evaluate(() => { const i = document.querySelector('#thresholdInput'); i.value = 45; i.dispatchEvent(new Event('input')); });
    await page.click('#saveSettingsBtn'); await sleep(1000);
    results.afterThreshold45 = await grab();

    // Settings: invalid value
    await page.evaluate(() => { document.querySelector('#thresholdInput').value = 90; });
    await page.click('#saveSettingsBtn'); await sleep(600);
    results.invalidSettings = await page.evaluate(() => ({
      errorShown: !document.querySelector('#thresholdError').hidden,
      invalidClass: document.querySelector('#thresholdInput').classList.contains('is-invalid'),
      saveState: document.querySelector('#settingsSaveState').textContent.trim()
    }));

    // restore 30
    await page.evaluate(() => { const i = document.querySelector('#thresholdInput'); i.value = 30; i.dispatchEvent(new Event('input')); });
    await page.click('#saveSettingsBtn'); await sleep(1000);
    results.restoredThreshold = (await grab()).recDuration;
    results.recAfterRestore = await page.evaluate(() => ({
      head: document.querySelector('#recommendationHeadline').textContent.trim(),
      dur: document.querySelector('#recDuration').textContent.trim(),
      water: document.querySelector('#recWater').textContent.trim(),
      text: document.querySelector('#recommendationText').textContent.replace(/\s+/g, ' ').trim().slice(0, 150)
    }));

    // Schedule validation then success
    await page.evaluate(() => { document.querySelector('#scheduleTime').value = ''; });
    await page.click('#scheduleSubmitBtn'); await sleep(500);
    results.scheduleInvalid = await page.evaluate(() => ({
      errors: document.querySelectorAll('#scheduleForm .field__error:not([hidden])').length,
      invalid: document.querySelectorAll('#scheduleForm .is-invalid').length
    }));
    await page.evaluate(() => {
      const d = new Date(Date.now() + 86400000), pad = n => String(n).padStart(2, '0');
      document.querySelector('#scheduleField').value = 'B';
      document.querySelector('#scheduleDate').value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      document.querySelector('#scheduleTime').value = '06:30';
      document.querySelector('#scheduleDuration').value = '25';
      document.querySelector('#scheduleMode').value = 'Scheduled';
    });
    await page.click('#scheduleSubmitBtn'); await sleep(1100);
    results.afterSchedule = await page.evaluate(() => ({
      items: Array.from(document.querySelectorAll('#scheduleList .schedule-item')).map(n => n.textContent.replace(/\s+/g, ' ').trim().slice(0, 95)),
      count: document.querySelector('#scheduleCount').textContent.trim()
    }));

    // Alerts workflow
    await page.select('#alertFilter', 'unread'); await sleep(250);
    results.unreadAlerts = await page.evaluate(() => document.querySelectorAll('#alertList .alert-item').length);
    await page.click('#markAllReadBtn2'); await sleep(600);
    await page.select('#alertFilter', 'all'); await sleep(250);
    results.unreadAfterMarkAll = (await grab()).unread;
    await page.evaluate(() => { const b = document.querySelector('#alertList button[data-action="dismiss"]'); if (b) b.click(); });
    await sleep(500);
    results.alertCountAfterDismiss = (await grab()).alerts;

    // Field modal
    await page.click('#fieldGrid button[data-field-details="B"]'); await sleep(1300);
    results.fieldModal = await page.evaluate(() => ({
      visible: document.querySelector('#fieldModal').classList.contains('show'),
      title: document.querySelector('#fieldModalTitle').textContent.trim(),
      hasChart: !!document.querySelector('#fieldDetailChart'),
      buttons: document.querySelectorAll('#fieldModalFooter button').length
    }));
    await page.click('#fieldModalFooter button[data-modal-action="start"]'); await sleep(1400);
    results.afterModalStartPump = (await grab()).pump;
    await page.click('#mobilePumpBtn').catch(() => {});
    await page.click('#pumpToggle'); await sleep(900);
    results.afterManualStop = (await grab()).pump;

    // Sensor outage
    await page.click('#simOutageToggle'); await sleep(1000);
    results.outage = await page.evaluate(() => ({
      kpi: document.querySelector('[data-kpi="soil"] [data-bind="soilMoisture"]').textContent.trim(),
      status: document.querySelector('[data-kpi="soil"] .status-tag__text').textContent.trim(),
      errorVisible: !document.querySelector('#sensorErrorState').hidden,
      fieldsEmpty: !document.querySelector('#fieldsEmpty').hidden,
      sensorStatus: document.querySelector('#sensorStatusText').textContent.trim(),
      liveText: document.querySelector('#livePillText').textContent.trim()
    }));
    await page.click('#simOutageToggle'); await sleep(1000);
    results.afterOutageRecovery = await page.evaluate(() => ({
      kpi: document.querySelector('[data-kpi="soil"] [data-bind="soilMoisture"]').textContent.trim(),
      errorVisible: !document.querySelector('#sensorErrorState').hidden
    }));

    // Units
    await page.select('#unitsSelect', 'imperial'); await sleep(600);
    results.imperial = await page.evaluate(() => ({
      temp: document.querySelector('[data-kpi="temp"] [data-bind="temperature"]').textContent.trim(),
      tempUnit: document.querySelector('[data-kpi="temp"] [data-unit="temp"]').textContent.trim(),
      tankVol: document.querySelector('[data-bind="tankVolume"]').textContent.trim(),
      weekTotal: document.querySelector('#weekTotal').textContent.trim(),
      activityWater: document.querySelector('#activityTableBody td[data-label="Water Used"]').textContent.trim()
    }));
    await page.select('#unitsSelect', 'metric'); await sleep(500);

    // Chart range switching
    await page.select('#soilRange', '7d'); await sleep(600);
    results.chart7dPoints = await page.evaluate(() => Chart.getChart(document.querySelector('#soilChart')).data.labels.length);
    await page.select('#soilRange', '30d'); await sleep(700);
    results.chart30dPoints = await page.evaluate(() => Chart.getChart(document.querySelector('#soilChart')).data.labels.length);
    results.chartSummary = await page.evaluate(() => document.querySelector('#soilChartSummary').textContent.replace(/\s+/g, ' ').trim());
    await page.select('#soilRange', '24h'); await sleep(500);

    // Activity search
    await page.type('#activitySearch', 'Field B'); await sleep(600);
    results.searchRows = await page.evaluate(() => document.querySelectorAll('#activityTableBody tr').length);
    await page.type('#activitySearch', 'zzz'); await sleep(600);
    results.emptyStateVisible = await page.evaluate(() => !document.querySelector('#activityEmpty').hidden);
    await page.evaluate(() => { const s = document.querySelector('#activitySearch'); s.value = ''; s.dispatchEvent(new Event('input')); });
    await sleep(500);
    results.searchClearedRows = await page.evaluate(() => document.querySelectorAll('#activityTableBody tr').length);

    // Export
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: '/home/user/test/downloads' });
    await page.evaluate(() => document.querySelector('#exportDataBtn').click());
    await sleep(1200);

    // Pump flow consistency: run 6s -> expect ~3 L and matching tank drop
    await page.click('#pumpToggle'); await sleep(6500);
    results.flowConsistency = await page.evaluate(() => ({
      session: document.querySelector('#sessionWater').textContent.trim(),
      flow: document.querySelector('#flowRate').textContent.trim(),
      tank: document.querySelector('[data-kpi="tank"] [data-bind="tankPercent"]').textContent.trim(),
      drawRate: document.querySelector('#tankDrawRate').textContent.trim(),
      supply: document.querySelector('#tankSupplyLeft').textContent.trim()
    }));
    await page.click('#pumpToggle'); await sleep(900);

    results.beforeReload = await grab();
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(1800);
    results.afterReload = await grab();
  } catch (err) {
    results.FATAL = String(err).slice(0, 300);
  } finally {
    console.log(JSON.stringify(results, null, 1));
    console.log('--- console errors ---'); console.log(errors);
    console.log('--- page errors ---'); console.log(pageErrors);
    console.log('--- failed requests (unique) ---'); console.log([...new Set(failed)]);
    await browser.close();
  }
})();
