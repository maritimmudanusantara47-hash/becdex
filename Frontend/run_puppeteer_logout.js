import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.url().includes('logout')) {
      console.log('Logout Response:', response.status(), response.headers()['set-cookie']);
    }
  });

  await page.goto('http://localhost:3000/login');
  await page.type('input[name="email"]', 'admin@admin.com');
  await page.type('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 2000));
  console.log('Logged in. Cookies:', (await page.cookies()).map(c => c.name));
  
  // Click logout
  // Need to find the logout button in Sidebar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const logoutBtn = btns.find(b => b.textContent.includes('Keluar') || b.textContent.includes('Log Out') || b.textContent.includes('Logout'));
    if (logoutBtn) logoutBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click confirm modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmBtn = btns.find(b => b.textContent.includes('Ya, Keluar'));
    if (confirmBtn) confirmBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  console.log('Logged out. Cookies:', (await page.cookies()).map(c => c.name));
  console.log('Current URL:', page.url());
  
  await browser.close();
})();
