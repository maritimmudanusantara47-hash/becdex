"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { useTranslation } from "@/store/lang";

type FormData = {
  password: string;
  password_confirmation: string;
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = useMemo(
    () =>
      z
        .object({
          password: z
            .string()
            .min(8, t.val_password_min || "Password must be at least 8 characters"),
          password_confirmation: z.string(),
        })
        .refine((data) => data.password === data.password_confirmation, {
          message: t.val_passwords_dont_match || "Passwords do not match",
          path: ["password_confirmation"],
        }),
    [t]
  );

  useEffect(() => {
    if (!token || !email) {
      toast.error(t.auth_reset_toast_invalid_token || "Tautan reset password tidak valid atau kedaluwarsa.");
      router.push("/login");
    }
  }, [token, email, router, t.auth_reset_toast_invalid_token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      toast.success(t.auth_reset_toast_success || "Password berhasil diubah. Silakan login dengan password baru.");
      router.push("/login");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t.auth_reset_toast_failed || "Gagal mereset password.");
    }
  };

  if (!token || !email) return null;

  const subtitleText = (t.auth_reset_subtitle || "Create a new password for {email}").replace(
    "{email}",
    email
  );

  return (
    <section className="min-h-screen bg-[url('/b.svg')] bg-cover bg-center flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-4xl bg-[#f8f9fa] rounded-2xl shadow-2xl overflow-hidden grid lg:grid-cols-2">

        {/* Left Column: Form */}
        <div className="p-6 md:p-10 relative flex flex-col justify-center bg-[#f8f9fa]">
          {/* Back button */}
          <Link href="/login" className="absolute top-6 left-6 text-[#0d6efd] hover:text-blue-700 transition-colors">
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
              {t.auth_reset_title || "Reset Password"}
            </h4>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-center text-gray-700 text-sm">
              {subtitleText.includes(email) ? (
                <>
                  {subtitleText.split(email)[0]}
                  <span className="font-semibold text-gray-900">{email}</span>
                  {subtitleText.split(email)[1]}
                </>
              ) : (
                subtitleText
              )}
            </p>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.auth_reset_new_password_label || "Password Baru"}
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showNewPassword ? "text" : "password"}
                  placeholder={t.auth_reset_new_password_placeholder || "Masukkan password baru"}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 pr-10 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? (t.auth_reset_aria_hide_pw || "Hide password") : (t.auth_reset_aria_show_pw || "Show password")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showNewPassword ? (
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.auth_reset_confirm_password_label || "Konfirmasi Password Baru"}
              </label>
              <div className="relative">
                <input
                  {...register("password_confirmation")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t.auth_reset_confirm_password_placeholder || "Ulangi password baru"}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 pr-10 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? (t.auth_reset_aria_hide_pw || "Hide password") : (t.auth_reset_aria_show_pw || "Show password")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>
              )}
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
                  t.auth_reset_submit_btn || "Simpan Password Baru"
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-700">{t.auth_forgot_remember_prompt || "Remember your password?"}</p>
              <Link
                href="/login"
                className="border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
              >
                {t.auth_forgot_back_to_login || "Log in"}
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
            style={{ width: "100%", height: "auto", maxWidth: "280px" }}
          />
          <div className="max-w-xs space-y-3">
            <h4 className="text-lg font-bold font-sans leading-snug">
              {t.auth_reset_banner_title || "Secure your account"}
            </h4>
            <p className="text-xs text-blue-100/90 leading-relaxed text-justify font-sans">
              {t.auth_reset_banner_desc || "Choose a strong password to protect your BECdex account. A secure password helps safeguard your company data, certification progress, and assessment records."}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0d6efd]" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
