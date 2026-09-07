
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { AlertTriangle, Trash2, XCircle, Loader2 } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { id: number; name: string };
}

export function DeleteUserModal({ isOpen, onClose, user }: DeleteUserModalProps) {
  const queryClient = useQueryClient();

  const disableMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/admin/users/${user?.id}/status`, { is_active: 2 });
    },
    onSuccess: () => {
      toast.success("Akun berhasil dinonaktifkan.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Gagal menonaktifkan akun.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/users/${user?.id}`);
    },
    onSuccess: () => {
      toast.success("Akun beserta semua datanya berhasil dihapus permanen.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Gagal menghapus pengguna.");
    }
  });

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border-4 border-rose-50 dark:border-rose-900/10">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">
            Pilih Tindakan Penghapusan
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
            Akun <strong className="text-slate-800 dark:text-white">{user.name}</strong> mungkin memiliki riwayat pengajuan dan dokumen di dalam sistem. Anda ingin menonaktifkannya saja agar data tetap ada, atau menghapusnya secara permanen (menghapus seluruh riwayat)?
          </p>

          <div className="space-y-3">
            <button
              onClick={() => disableMutation.mutate()}
              disabled={disableMutation.isPending || deleteMutation.isPending}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border-2 border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <XCircle size={18} className="group-hover:scale-110 transition-transform" />
                Nonaktifkan Akun Saja
              </span>
              {disableMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            </button>

            <button
              onClick={() => deleteMutation.mutate()}
              disabled={disableMutation.isPending || deleteMutation.isPending}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border-2 border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-bold transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                Hapus Permanen (Force Delete)
              </span>
              {deleteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            </button>
          </div>

          <button
            onClick={onClose}
            disabled={disableMutation.isPending || deleteMutation.isPending}
            className="mt-5 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
