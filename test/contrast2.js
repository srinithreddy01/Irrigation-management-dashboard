const puppeteer = require('puppeteer');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FILE = 'file://' + path.resolve('/home/user/irrigation-dashboard/index.html');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto(FILE, { waitUntil: 'networkidle0' });
  await sleep(1600);
  // hide text layers but keep the photo, scrims and gradients visible
  await page.evaluate(() => {
    document.querySelectorAll('.hero__title, .hero__subtitle, .hero__updated, .hero__actions, .hero__top, .weather-card__overlay > *').forEach(e => { e.style.visibility = 'hidden'; });
  });
  const targets = await page.evaluate(() => {
    const out = {};
    const put = (k, sel) => { const e = document.querySelector(sel); if (e) { const r = e.getBoundingClientRect(); out[k] = { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) }; } };
    put('title', '.hero__title'); put('subtitle', '.hero__subtitle'); put('updated', '.hero__updated');
    put('weatherTemp', '.weather-temp'); put('weatherCond', '.weather-cond');
    return out;
  });
  await page.screenshot({ path: '/home/user/test/bg-layers.png', fullPage: true });
  console.log(JSON.stringify(targets));
  await browser.close();
})();
