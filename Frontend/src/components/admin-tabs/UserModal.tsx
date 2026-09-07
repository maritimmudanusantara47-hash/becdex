"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { X, Loader2, Save } from "lucide-react";

interface UserEditData {
  id?: number;
  name?: string;
  email?: string;
  role?: { id: number; name?: string };
  is_active?: number;
}

export function UserModal({
  isOpen,
  onClose,
  editData,
}: {
  isOpen: boolean;
  onClose: () => void;
  editData?: UserEditData | null;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!editData;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: 2, // default Company
    is_active: 1, // default Active
  });

  const roles = [
    { id: 1, name: "Director", desc: "Akses penuh" },
    { id: 12, name: "IT Manager", desc: "Akses penuh" },
    { id: 11, name: "Quality Control and Standardization Manager", desc: "Akses penuh (tanpa kelola pengguna)" },
    { id: 10, name: "HR and Finance Manager", desc: "Akses finance/pembayaran" },
    { id: 6, name: "Auditor", desc: "Penilai submission" },
    { id: 7, name: "Certification Manager", desc: "Penerbitan sertifikat" },
    { id: 2, name: "Company PIC", desc: "Perusahaan" },
  ];

  useEffect(() => {
    if (editData) {
      setTimeout(() => {
        setForm({
          name: editData.name || "",
          email: editData.email || "",
          password: "",
          role_id: editData.role?.id || 2,
          is_active: editData.is_active ?? 1,
        });
      }, 0);
    } else {
      setTimeout(() => {
        setForm({ name: "", email: "", password: "", role_id: 2, is_active: 1 });
      }, 0);
    }
  }, [editData, isOpen]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEditing && editData?.id) {
        await api.put(`/admin/users/${editData.id}`, form);
      } else {
        await api.post("/admin/users", form);
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? "Pengguna berhasil diperbarui!" : "Pengguna berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Terjadi kesalahan.");
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="font-extrabold text-slate-800 dark:text-white">
            {isEditing ? "Edit Pengguna" : "Tambah Pengguna Baru"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Masukkan nama pengguna"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Akses</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="admin@becdex.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Password {isEditing && <span className="text-slate-400 font-normal">(Kosongkan jika tidak ingin mengubah)</span>}
            </label>
            <input
              required={!isEditing}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Minimal 8 karakter"
              minLength={8}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Peran (Role)</label>
              <select
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:border-blue-500 focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.desc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Status Akun</label>
              <select
                value={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value={1}>Aktif (Verified)</option>
                <option value={0}>Menunggu (Pending)</option>
                <option value={2}>Ditolak / Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
