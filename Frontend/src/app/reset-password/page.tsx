"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  
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
        <div className="relative">
  <input
    {...register("password")}
    type={showPassword ? "text" : "password"}
    className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4e73df] transition"
    placeholder="********"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>

        <div className="relative">
  <input
    {...register("password")}
    type={showPassword ? "text" : "password"}
    className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4e73df] transition"
    placeholder="********"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
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
