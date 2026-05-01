import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const DIR = 'screenshots';
const WIDTH = 390;
const HEIGHT = 844;

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Project List
  await page.goto(BASE + '/projects', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/project-list.png` });
  console.log('✓ project-list.png');

  // 2. Files Tab
  await page.goto(BASE + '/workspace/1?tab=files', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/files-tab.png` });
  console.log('✓ files-tab.png');

  // 3. Code Viewer
  await page.goto(BASE + '/workspace/1/code?file=codebase/src/App.tsx', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/code-viewer.png` });
  console.log('✓ code-viewer.png');

  // 4. Search Tab
  await page.goto(BASE + '/workspace/1?tab=search', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.fill('input[placeholder*="搜索代码内容"]', 'App');
  await page.click('button:has-text("搜索")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/search-tab.png` });
  console.log('✓ search-tab.png');

  // 5. Git Tab
  await page.goto(BASE + '/workspace/2?tab=git', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/git-tab.png` });
  console.log('✓ git-tab.png');

  // 6. Settings Tab
  await page.goto(BASE + '/workspace/1?tab=settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/settings-tab.png` });
  console.log('✓ settings-tab.png');

  await browser.close();
  console.log('\nAll screenshots saved to screenshots/');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
