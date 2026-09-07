import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Intercept responses
  page.on('response', response => {
    if (response.url().includes('login') || response.url().includes('csrf-cookie')) {
      console.log('Response:', response.url(), response.status());
    }
  });

  await page.goto('http://localhost:3000/login');
  await page.type('input[name="email"]', 'admin@admin.com');
  await page.type('input[name="password"]', 'admin123');
  
  await page.click('button[type="submit"]'); // assuming button has type submit
  
  await new Promise(r => setTimeout(r, 2000));
  
  const cookies = await page.cookies();
  console.log('Cookies:', cookies.map(c => c.name + '=' + c.domain));
  
  await browser.close();
})();
