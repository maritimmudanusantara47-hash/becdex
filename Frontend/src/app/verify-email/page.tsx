"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Loader2, MailCheck, AlertCircle, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const verifyEmail = async () => {
      const url = searchParams.toString();
      if (url.includes("id=") && url.includes("hash=")) {
        setStatus("loading");
        try {
          const params = new URLSearchParams(url);
          const id = params.get('id');
          const hash = params.get('hash');
          params.delete('id');
          params.delete('hash');
          const query = params.toString();
          
          await api.get(`/auth/email/verify/${id}/${hash}?${query}`);
          setStatus("success");
          toast.success("Email berhasil diverifikasi!");
          
          // Refetch user to get the latest email_verified_at
          const me = await api.get("/auth/me");
          setUser(me.data.data);
          
          setTimeout(() => router.push("/dashboard"), 3000);
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          setStatus("error");
          setErrorMessage(err.response?.data?.message || "Gagal memverifikasi email. Tautan mungkin kadaluarsa.");
        }
      } else if (user && user.email_verified_at) {
        router.push("/dashboard");
      }
    };
    verifyEmail();
  }, [searchParams, router, setUser, user]);

  const handleResend = async () => {
    try {
      setStatus("loading");
      await api.post("/auth/email/verification-notification");
      toast.success("Tautan verifikasi telah dikirim ulang ke email Anda.");
      setStatus("idle");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal mengirim ulang tautan.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Memproses Verifikasi...</h2>
            <p className="text-slate-500 dark:text-slate-400">Mohon tunggu sebentar.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Verifikasi Berhasil!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Email Anda telah berhasil diverifikasi. Mengalihkan ke dasbor...</p>
            <button 
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Ke Dasbor Sekarang
            </button>
          </div>
        )}

        {(status === "idle" || status === "error") && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Verifikasi Diperlukan</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {errorMessage || "Kami telah mengirimkan tautan verifikasi ke alamat email Anda. Silakan periksa kotak masuk (atau spam) Anda."}
            </p>
            <button 
              onClick={handleResend}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-3"
            >
              <RefreshCw className="w-4 h-4" /> Kirim Ulang Email Verifikasi
            </button>
            <button 
              onClick={() => router.push("/dashboard")}
              className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
            >
              Kembali ke Dasbor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#4e73df]" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
