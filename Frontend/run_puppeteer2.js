import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Intercept requests
  page.on('request', request => {
    if (request.url().includes('login')) {
      console.log('Request headers for', request.url(), ':', request.headers());
    }
  });

  await page.goto('http://localhost:3000/login');
  await page.type('input[name="email"]', 'admin@admin.com');
  await page.type('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
