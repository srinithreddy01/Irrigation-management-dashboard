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
  await sleep(1800);
  await page.evaluate(AXE);
  const res = await page.evaluate(async () => await axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] }
  }));
  const fmt = v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, sample: v.nodes.slice(0,2).map(n => n.html.slice(0,110)) });
  console.log('VIOLATIONS:', res.violations.length);
  res.violations.forEach(v => console.log(JSON.stringify(fmt(v), null, 1)));
  console.log('INCOMPLETE (needs review):', res.incomplete.map(v => v.id + ':' + v.nodes.length).join(', '));
  console.log('PASSES:', res.passes.length);
  await browser.close();
})();
