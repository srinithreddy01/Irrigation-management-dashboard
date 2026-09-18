const puppeteer = require('puppeteer');
const path = require('path');
const FILE = 'file://' + path.resolve('/home/user/irrigation-dashboard/index.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const sizes = [
    { name: 'desktop', w: 1440, h: 950 },
    { name: 'laptop', w: 1280, h: 800 },
    { name: 'tablet', w: 834, h: 1100 },
    { name: 'mobile', w: 390, h: 844 },
    { name: 'small', w: 360, h: 740 }
  ];
  for (const s of sizes) {
    const page = await browser.newPage();
    await page.setViewport({ width: s.w, height: s.h });
    await page.goto(FILE, { waitUntil: 'networkidle0' });
    await sleep(1600);
    // trigger lazy image loading by scrolling through the page
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120));
      }
      window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
    });
    await page.screenshot({ path: `/home/user/test/${s.name}-full.png`, fullPage: true });
    const height = await page.evaluate(() => document.body.scrollHeight);
    console.log(s.name, s.w + 'x' + s.h, 'page height:', height);
    // horizontal overflow check
    const overflow = await page.evaluate(() => {
      const wide = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > document.documentElement.clientWidth + 2 && r.width > 24) {
          wide.push((el.className && String(el.className).slice(0,40)) + ' w=' + Math.round(r.width));
        }
      });
      return { docScrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, offenders: wide.slice(0, 6) };
    });
    console.log('  overflow:', JSON.stringify(overflow));
    await page.close();
  }
  await browser.close();
})();
