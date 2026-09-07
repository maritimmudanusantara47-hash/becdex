import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Helper untuk set/hapus auth token dari luar komponen
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

import Cookies from "js-cookie";

// Auto-load token dari localStorage / cookie
if (typeof window !== "undefined") {
  const sessionCookie = Cookies.get("becdex_session");
  const token = localStorage.getItem("becdex_token") || sessionCookie;

  // Jika cookie session sudah tidak ada dan tidak dalam mode Remember Me (misal browser ditutup tanpa Remember Me),
  // bersihkan localStorage agar sinkron
  if (!sessionCookie && token && !localStorage.getItem("becdex_remember")) {
    localStorage.removeItem("becdex_token");
    localStorage.removeItem("becdex-auth");
    setAuthToken(null);
  } else if (token) {
    if (!localStorage.getItem("becdex_token") && sessionCookie) {
      localStorage.setItem("becdex_token", sessionCookie);
    }
    setAuthToken(token);
  }
}

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Jangan lakukan redirect paksa jika error-nya berasal dari proses login itu sendiri
    // Biarkan halaman login yang menangani pesan error-nya (menampilkan toast)
    if (originalRequest.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 || error.response?.status === 419) {
      // Only redirect in browser environment
      if (typeof window !== "undefined") {
        // Bersihkan state hantu Zustand dan token sebelum pindah halaman
        localStorage.removeItem("becdex-auth");
        localStorage.removeItem("becdex_token");
        setAuthToken(null);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
