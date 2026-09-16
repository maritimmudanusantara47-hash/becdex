"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { useTranslation } from "@/store/lang";

type FormData = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t.val_email_required || "Email wajib diisi")
          .email(t.val_email_invalid || "Format email tidak valid"),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/auth/forgot-password", data);
      setSent(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t.auth_forgot_toast_failed || "Gagal mengirim email reset.");
    }
  };

  if (sent) {
    return (
      <section className="min-h-screen bg-[url('/b.svg')] bg-cover bg-center flex items-center justify-center p-4 md:p-8 font-sans">
        <div className="w-full max-w-4xl bg-[#f8f9fa] rounded-2xl shadow-2xl overflow-hidden grid lg:grid-cols-2">

          {/* Left Column: Success Message */}
          <div className="p-6 md:p-10 relative flex flex-col justify-center bg-[#f8f9fa]">
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
                {t.auth_forgot_success_title || "Email Terkirim!"}
              </h4>
            </div>

            <div className="text-center space-y-5">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t.auth_forgot_success_desc || "Instruksi reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk (dan folder spam)."}
              </p>

              <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-700">{t.auth_forgot_ready_signin || "Ready to sign in?"}</p>
                <Link
                  href="/login"
                  className="border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
                >
                  {t.auth_forgot_back_to_login || "Log in"}
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Gradient & Illustration */}
          <div className="hidden lg:flex flex-col items-center justify-center p-10 text-center bg-linear-to-r from-[#0B3954] via-[#0D6AA8] to-[#0B3954] text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Mail className="w-10 h-10 text-white" />
            </div>
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
                {t.auth_forgot_success_banner_title || "Check your inbox"}
              </h4>
              <p className="text-xs text-blue-100/90 leading-relaxed text-justify font-sans">
                {t.auth_forgot_success_banner_desc || "We have sent a password reset link to your email address. Follow the instructions in the email to create a new password for your BECdex account."}
              </p>
            </div>
          </div>

        </div>
      </section>
    );
  }

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
              {t.auth_forgot_title || "Lupa Kata Sandi"}
            </h4>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-center text-gray-700 text-sm">
              {t.auth_forgot_subtitle || "Masukkan email Anda untuk menerima instruksi reset kata sandi"}
            </p>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.auth_email || "Email"}
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder={t.auth_forgot_email_placeholder || "name@company.com"}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0d6efd]/20 focus:border-[#0d6efd]"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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
                  t.auth_forgot_submit_btn || "Kirim Tautan Reset"
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
              {t.auth_forgot_banner_title || "Account recovery"}
            </h4>
            <p className="text-xs text-blue-100/90 leading-relaxed text-justify font-sans">
              {t.auth_forgot_banner_desc || "Enter your registered email address and we will send you a secure link to reset your password. Your BECdex account data and certification progress will remain safe."}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
