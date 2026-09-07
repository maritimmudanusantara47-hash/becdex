const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({ jar: cookieJar, withCredentials: true }));

async function test() {
  try {
    console.log("Getting CSRF cookie...");
    const csrfRes = await client.get('http://localhost:8000/sanctum/csrf-cookie', {
      headers: { Origin: 'http://localhost:3000' }
    });
    
    // Check cookies
    const cookies = await cookieJar.getCookies('http://localhost:8000');
    console.log("Cookies:", cookies.map(c => c.cookieString()));
    
    // Read XSRF-TOKEN
    const xsrfCookie = cookies.find(c => c.key === 'XSRF-TOKEN');
    const xsrfToken = xsrfCookie ? decodeURIComponent(xsrfCookie.value) : '';
    console.log("X-XSRF-TOKEN:", xsrfToken);

    console.log("Attempting Login...");
    const loginRes = await client.post('http://localhost:8000/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    }, {
      headers: {
        Origin: 'http://localhost:3000',
        'X-XSRF-TOKEN': xsrfToken,
        'Accept': 'application/json'
      }
    });

    console.log("Login Success!", loginRes.data);
  } catch (error) {
    console.error("Login Failed:", error.response?.status, error.response?.data);
  }
}

test();
