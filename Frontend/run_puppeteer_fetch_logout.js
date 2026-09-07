import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/login');
  await page.type('input[name="email"]', 'admin@admin.com');
  await page.type('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 2000));
  console.log('Logged in. Cookies:', (await page.cookies()).map(c => c.name));
  
  // Call API directly
  const result = await page.evaluate(async () => {
    try {
      const res = await window.axios.delete('/api/auth/logout', { baseURL: 'http://localhost:8000' });
      return { status: res.status, data: res.data };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('API Result:', result);
  
  console.log('After API. Cookies:', (await page.cookies()).map(c => c.name));
  
  await browser.close();
})();
