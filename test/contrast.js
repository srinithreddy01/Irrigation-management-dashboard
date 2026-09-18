const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + path.resolve('/home/user/irrigation-dashboard/index.html');
const AXE = fs.readFileSync(path.resolve('/home/user/node_modules/axe-core/axe.min.js'), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto(FILE, { waitUntil: 'networkidle0' });
  await sleep(1600);
  await page.evaluate(AXE);
  const res = await page.evaluate(async () => await axe.run(document, { runOnly: ['color-contrast'] }));
  const grouped = {};
  [...res.violations, ...res.incomplete].forEach(v => {
    v.nodes.forEach(n => {
      const m = (n.any[0] && n.any[0].data) || {};
      const key = (m.fgColor || '?') + ' on ' + (m.bgColor || '?') + ' ratio=' + m.contrastRatio + ' need=' + m.expectedContrastRatio + ' size=' + (m.fontSize||'').replace('pt','');
      grouped[key] = grouped[key] || [];
      if (grouped[key].length < 3) grouped[key].push(n.html.slice(0, 90));
    });
  });
  Object.entries(grouped).sort((a,b) => b[1].length - a[1].length).forEach(([k, v]) => console.log(k, '\n   ', v.join('\n    ')));
  await browser.close();
})();
