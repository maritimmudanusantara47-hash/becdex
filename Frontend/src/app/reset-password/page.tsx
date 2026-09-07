"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import api from "@/lib/api";

const schema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter"),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Konfirmasi password tidak cocok",
  path: ["password_confirmation"],
});

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      toast.error("Tautan reset password tidak valid atau kedaluwarsa.");
      router.push("/login");
    }
  }, [token, email, router]);

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
      
      toast.success("Password berhasil diubah. Silakan login dengan password baru.");
      router.push("/login");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal mereset password.");
    }
  };

  if (!token || !email) return null;

  return (
    <AuthLayout
      title="Ubah Password"
      subtitle={`Masukkan password baru untuk ${email}`}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm text-gray-700 font-semibold mb-1">
            Password Baru
          </label>
          <input
            {...register("password")}
            type="password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4e73df] transition"
            placeholder="********"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-700 font-semibold mb-1">
            Konfirmasi Password Baru
          </label>
          <input
            {...register("password_confirmation")}
            type="password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4e73df] transition"
            placeholder="********"
          />
          {errors.password_confirmation && (
            <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#4e73df] hover:bg-[#2e59d9] text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4e73df] focus:ring-opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
          ) : (
            "Simpan Password Baru"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#4e73df]" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
