"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Cookies from "js-cookie";
import { useEffect, useMemo } from "react";
import api, { setAuthToken } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useTranslation } from "@/store/lang";
import { useTheme } from "@/context/ThemeContext";
import { isAnyAdmin } from "@/lib/roles";
import { useState } from "react";

type ApiError = { response?: { data?: { message?: string } } };

type LoginFormData = {
  email: string;
  password: string;
  remember?: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const { t } = useTranslation();
  const { setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t.val_email_required || "Email wajib diisi")
          .email(t.val_email_invalid || "Format email tidak valid"),
        password: z.string().min(1, t.val_password_required || "Password wajib diisi"),
        remember: z.boolean().optional(),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  useEffect(() => {
    // Jika user sudah login dan cookie sesi aktif, redirect langsung ke dashboard/admin
    const sessionToken = Cookies.get("becdex_session");
    if (sessionToken && isAuthenticated && user) {
      if (isAnyAdmin(user)) {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
      return;
    }

    const loggedOut = sessionStorage.getItem("logout_success");
    if (loggedOut === "1") {
      sessionStorage.removeItem("logout_success");
      setTimeout(() => {
        toast.success(t.auth_toast_logout_success || "Log out berhasil");
      }, 100);
    }

    // Prefill email jika user sebelumnya mencentang Remember Me
    const savedEmail = localStorage.getItem("becdex_remember_email");
    if (savedEmail) {
      setValue("email", savedEmail);
      setValue("remember", true);
    }
  }, [isAuthenticated, user, router, setValue, t.auth_toast_logout_success]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post("/auth/login", data);
      const { user, token } = response.data.data;
      const isRemember = Boolean(data.remember);

      // Opsi cookie: jika Remember Me dicentang, aktif selama 30 hari. Jika tidak, cookie sesi (hilang saat browser ditutup)
      const cookieOptions: Cookies.CookieAttributes = isRemember
        ? { sameSite: "lax", expires: 30 }
        : { sameSite: "lax" };

      // Simpan token ke localStorage agar bisa dipakai oleh semua request
      if (token) {
        localStorage.setItem("becdex_token", token);
        setAuthToken(token);
        // Simpan juga ke cookie agar Next.js middleware bisa membacanya
        Cookies.set("becdex_session", token, cookieOptions);
      }

      setAuth(user);
      setTheme("light");

      // Set role cookie agar middleware bisa enforce role separation
      const roleId = user.role?.id;
      if (roleId) {
        Cookies.set("becdex_role", String(roleId), cookieOptions);
      }

      if (isRemember) {
        localStorage.setItem("becdex_remember_email", data.email);
        localStorage.setItem("becdex_remember", "true");
      } else {
        localStorage.removeItem("becdex_remember_email");
        localStorage.removeItem("becdex_remember");
      }

      const welcomeMsg = (t.auth_toast_login_welcome || "Selamat datang, {name}!").replace("{name}", user.name);
      toast.success(welcomeMsg);

      if (isAnyAdmin(user)) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      const message = err.response?.data?.message || t.auth_toast_login_failed || "Login gagal. Cek email dan password.";
      toast.error(message);
    }
  };

  return (
    <section className="min-h-screen bg-[url('/b.svg')] bg-cover bg-center flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-4xl bg-[#f8f9fa] rounded-2xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
        
        {/* Left Column: Form */}
        <div className="p-6 md:p-10 relative flex flex-col justify-center bg-[#f8f9fa]">
          {/* Back button */}
          <Link href="/" className="absolute top-6 left-6 text-[#0d6efd] hover:text-blue-700 transition-colors">
            <ArrowLeft size={24} />
          </Link>

          <div className="text-center mb-6 mt-4">
            <Image
              src="/logo.webp"
              alt="BECdex Logo"
              width={70}
              height={70}
              className="mx-auto object-contain mb-3"
            />
            <h4 className="text-black text-xl font-bold font-sans">
              Blue Economy Company
            </h4>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-center text-gray-700 text-sm">
              {t.auth_login_subtitle || "Please login to your BECdex account"}
            </p>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.auth_email || "Email"}
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder={t.auth_email_placeholder || "Enter your email"}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            {/* Password */}
<div>
  <label className="block text-xs font-semibold text-gray-700 mb-1">
    {t.auth_password || "Password"}
  </label>

  <div className="relative">
    <input
      {...register("password")}
      type={showPassword ? "text" : "password"}
      placeholder={t.auth_password_placeholder || "Enter your password"}
      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 pr-10 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  </div>

  {errors.password && (
    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
  )}
</div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="w-4 h-4 text-[#0d6efd] border-gray-300 rounded focus:ring-[#0d6efd]"
                />
                <span className="text-xs text-gray-600">
                  {t.auth_remember_me || "Remember Me"}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0d6efd] hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  t.auth_login_btn || "Log in"
                )}
              </button>
            </div>

            <div className="text-center">
              <Link href="/forgot-password" className="text-xs text-gray-500 hover:underline">
                {t.auth_forgot_password || "Forgot Password"}
              </Link>
            </div>

            {/* Toggle to Register */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-700">{t.auth_no_account || "Don't have an account?"}</p>
              <Link
                href="/register"
                className="border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
              >
                {t.auth_create_new || "Create new"}
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Gradient & Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center p-10 text-center bg-linear-to-r from-[#0B3954] via-[#0D6AA8] to-[#0B3954] text-white">
          <Image
            src="/bg-home-perahu.webp"
            alt="Boat Illustration"
            width={500}
            height={500}
            priority
            className="object-contain mb-8 animate-pulse duration-4000"
            style={{ width: "100%", height: "auto", maxWidth: "320px" }}
          />
          <div className="max-w-xs space-y-3">
            <h4 className="text-lg font-bold font-sans leading-snug">
              {t.auth_banner_title || "Become a blue economy company now!"}
            </h4>
            <p className="text-xs text-blue-100/90 leading-relaxed text-justify font-sans">
              {t.auth_banner_desc ||
                "Blue Economy Company is a certified company in the maritime sectors, whose business meets 70% or more of 50 indicators of the Blue Economy Company Index (BECdex) to support the achievement of the Sustainable Development Goals (SDGs) in the coastal states."}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

