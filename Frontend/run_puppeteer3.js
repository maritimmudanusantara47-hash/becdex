import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/login');
  await page.type('input[name="email"]', 'admin@admin.com');
  await page.type('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  // Wait for csrf-cookie request to finish
  await page.waitForResponse(r => r.url().includes('csrf-cookie'));
  
  const cookieStr = await page.evaluate(() => document.cookie);
  console.log('document.cookie in frontend:', cookieStr);
  
  await browser.close();
})();
