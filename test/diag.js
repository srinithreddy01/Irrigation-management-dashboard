const puppeteer = require('puppeteer');
const path = require('path');
const FILE = 'file://' + path.resolve('/home/user/irrigation-dashboard/index.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(FILE, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => { for (let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,60));} window.scrollTo(0,0); });
  await sleep(1500);
  console.log('--- crop thumbs (mobile) ---');
  console.log(await page.evaluate(() => Array.from(document.querySelectorAll('.crop-card__thumb')).map(t => {
    const img = t.querySelector('img'); const r = t.getBoundingClientRect(); const ri = img.getBoundingClientRect();
    return { thumbW: Math.round(r.width), thumbH: Math.round(r.height), imgW: Math.round(ri.width), natural: img.naturalWidth, complete: img.complete, display: getComputedStyle(t).display };
  })));
  console.log('--- kpi head overflow ---');
  console.log(await page.evaluate(() => Array.from(document.querySelectorAll('.kpi-card')).map(c => ({
    ratio: +((c.querySelector('.kpi-card__value').scrollWidth / c.querySelector('.kpi-card__value').clientWidth).toFixed(2)),
    label: c.querySelector('.kpi-card__label').textContent.trim(),
    iconAndTag: Math.round(c.querySelector('.kpi-card__head').scrollWidth) + '/' + Math.round(c.querySelector('.kpi-card__head').clientWidth)
  }))));
  console.log('--- hero image ---');
  console.log(await page.evaluate(() => { const i = document.querySelector('.hero__media img'); const r = i.getBoundingClientRect(); return { complete: i.complete, natural: i.naturalWidth, rendered: Math.round(r.width)+'x'+Math.round(r.height), objectPosition: getComputedStyle(i).objectPosition }; }));
  console.log('--- mobile sticky bar overlap check ---');
  console.log(await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight * 0.75); await new Promise(r => setTimeout(r, 400));
    const els = document.elementsFromPoint(200, window.innerHeight - 30).map(e => e.className && String(e.className).slice(0, 30));
    return els.slice(0, 4);
  }));
  console.log('--- icons rendering (specific glyphs) ---');
  console.log(await page.evaluate(() => ['fa-droplet','fa-temperature-half','fa-water','fa-glass-water','fa-vector-square','fa-leaf','fa-faucet-drip','fa-clock-rotate-left'].map(c => {
    const el = document.querySelector('.' + c); if (!el) return c + ':MISSING';
    const cs = getComputedStyle(el, '::before');
    return c + ':' + (cs.fontFamily.includes('Font Awesome') ? 'fa-ok' : 'NOT-FA') + ':' + cs.content.length;
  })));
  await browser.close();
})();
