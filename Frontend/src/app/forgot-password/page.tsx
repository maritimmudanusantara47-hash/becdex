"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import api from "@/lib/api";

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

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
      toast.error(err.response?.data?.message || "Gagal mengirim email reset.");
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Email Terkirim!">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm">
            Instruksi reset password telah dikirim ke email Anda. Silakan cek inbox (dan folder spam).
          </p>
          <Link href="/login" className="block text-[#4e73df] text-sm font-semibold hover:underline">
            Kembali ke Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Lupa Password"
      subtitle="Masukkan email Anda untuk menerima instruksi reset password"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="form-label">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="contoh@perusahaan.com"
            className="form-input"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Mengirim...
            </span>
          ) : (
            "Kirim Email Reset"
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="text-[#4e73df] font-semibold hover:underline">
            ← Kembali ke Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
