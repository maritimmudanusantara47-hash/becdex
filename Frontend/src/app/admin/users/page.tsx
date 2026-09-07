"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LoadingSpinner, EmptyState } from "@/components/ui/index";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Users,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Briefcase,
  Mail,
  UserPlus,
  Trash2,
  Edit,
  ShieldAlert
} from "lucide-react";
import { UserModal } from "@/components/admin-tabs/UserModal";
import { DeleteUserModal } from "@/components/admin-tabs/DeleteUserModal";
import { useTranslation } from "@/store/lang";
import { useAdminRouteGuard } from "@/hooks/useAdminRouteGuard";

interface UserRow {
  id: number;
  name: string;
  email: string;
  is_active: number;
  email_verified_at?: string | null;
  created_at: string;
  role?: {
    id: number;
    name: string;
  };
  company?: {
    pic_name?: string;
    pic_position?: string;
    company_field?: string;
  };
}

const getRoleBadge = (roleId?: number, fallbackName?: string) => {
  switch (roleId) {
    case 1:
      return { label: "Director", className: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    case 12:
      return { label: "IT Manager", className: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    case 11:
      return { label: "Quality Control and Standardization Manager", className: "bg-purple-50 text-purple-700 border-purple-200" };
    case 10:
      return { label: "HR and Finance Manager", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case 6:
      return { label: "Auditor", className: "bg-amber-50 text-amber-700 border-amber-200" };
    case 7:
      return { label: "Certification Manager", className: "bg-blue-50 text-blue-700 border-blue-200" };
    case 2:
      return { label: "Company PIC", className: "bg-slate-100 text-slate-700 border-slate-200" };
    default:
      return { label: fallbackName || "—", className: "bg-slate-100 text-slate-700 border-slate-200" };
  }
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<{id: number, name: string} | undefined>(undefined);
  const { t } = useTranslation();
  const { authorized } = useAdminRouteGuard({ guard: "super_admin" });

  const USER_STATUS_FILTERS = [
    { label: t.dash_admin_user_filter_all || "Semua Akun", value: "all" },
    { label: t.dash_admin_user_filter_active || "Aktif", value: "1" },
    { label: t.dash_admin_user_filter_pending || "Menunggu Approval", value: "0" },
    { label: t.dash_admin_user_filter_rejected || "Ditolak / Nonaktif", value: "2" },
  ];

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", page, roleFilter],
    queryFn: async () => {
      const res = await api.get(`/admin/users?page=${page}&role=${roleFilter}`);
      return res.data;
    },
    enabled: authorized,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: number }) => {
      await api.put(`/admin/users/${userId}/status`, { is_active: status });
    },
    onSuccess: () => {
      toast.success(t.dash_admin_user_msg_success || "Status akun pengguna berhasil diperbarui!");
      refetch();
    },
    onError: () => toast.error(t.dash_admin_user_msg_error || "Gagal memperbarui status akun pengguna."),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.post(`/admin/users/${userId}/verify`);
    },
    onSuccess: () => {
      toast.success("Email pengguna berhasil diverifikasi secara manual!");
      refetch();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal memverifikasi email pengguna.");
    }
  });

  // Early return setelah semua hooks — React Rules of Hooks
  if (!authorized) return null;

  const users = data?.data ?? [];
  const meta = data?.meta;

  const filteredUsers = users.filter((u: UserRow) => {
    if (statusFilter !== "all" && String(u.is_active) !== statusFilter) {
      return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const company = u.name.toLowerCase();
    const email = u.email.toLowerCase();
    const pic = u.company?.pic_name?.toLowerCase() ?? "";
    return company.includes(q) || email.includes(q) || pic.includes(q);
  });

  return (
    <AppLayout title={t.dash_admin_user_title || "Kelola Pengguna"}>
      {/* Top Header & Filter Card */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              <span>User Access Control</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dash_admin_user_heading || "Manajemen Akun & Perusahaan"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {t.dash_admin_user_desc || "Verifikasi pendaftaran perusahaan baru, kelola status aktif akun, dan pantau representasi PIC."}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder={t.dash_admin_user_search || "Cari nama pengguna atau email..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:bg-slate-800 transition-all shadow-2xs"
              />
            </div>
            <button
              onClick={() => {
                setEditUser(undefined);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all whitespace-nowrap shrink-0"
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">{t.dash_admin_user_add || "Tambah Pengguna"}</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <ShieldAlert size={13} />
              Role:
            </span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">{t.dash_admin_user_role_all || "Semua Role"}</option>
              <option value="admin">Director</option>
              <option value="it_manager">IT Manager</option>
              <option value="qc_admin">Quality Control and Standardization Manager</option>
              <option value="manager">HR and Finance Manager</option>
              <option value="reviewer">Auditor</option>
              <option value="supervisor">Certification Manager</option>
              <option value="company">Company PIC</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Filter size={13} />
              Status:
            </span>
          {USER_STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs",
                  isActive
                    ? "bg-blue-600 text-white shadow-blue-600/20 shadow-md scale-102"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white border border-slate-200/60 dark:border-slate-700"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
      </div>

      {/* TailAdmin Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
          <span className="font-extrabold text-slate-800 dark:text-white text-sm">
            {t.dash_admin_user_list_title || "Daftar Perusahaan Terdaftar"} ({filteredUsers.length})
          </span>
          {statusFilter !== "all" && (
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/80 dark:border-blue-800">
              {t.dash_admin_user_showing || "Menampilkan:"} {USER_STATUS_FILTERS.find((x) => x.value === statusFilter)?.label}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Users}
              title={t.dash_admin_user_empty || "Akun Pengguna Tidak Ditemukan"}
              description={t.dash_admin_user_empty_desc || "Belum ada perusahaan yang sesuai dengan filter atau pencarian Anda saat ini."}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">{t.dash_admin_user_col_user || "Pengguna & Email"}</th>
                    <th className="px-6 py-4">{t.dash_admin_user_col_role || "Peran (Role)"}</th>
                    <th className="px-6 py-4">{t.dash_admin_user_col_info || "Info Perusahaan"}</th>
                    <th className="px-6 py-4">{t.dash_admin_user_col_status || "Status Akun"}</th>
                    <th className="px-6 py-4 text-right">{t.dash_admin_user_col_action || "Aksi"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {filteredUsers.map((u: UserRow) => (
                    <tr
                      key={u.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            <Building2 size={17} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate text-sm">
                              {u.name}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-400 truncate mt-0.5">
                              <Mail size={11} className="text-slate-400" />
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const badge = getRoleBadge(u.role?.id, u.role?.name);
                          return (
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border shadow-2xs ${badge.className}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        {u.role?.name === 'company' ? (
                          <>
                            <p className="font-bold text-slate-800 dark:text-white text-xs">
                              {u.company?.pic_name || "—"}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <Briefcase size={11} />
                              {u.company?.company_field || "Marine Sector"}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">{t.dash_admin_user_internal || "Internal Staff"}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.is_active === 1 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {t.dash_admin_user_status_active || "Aktif Terverifikasi"}
                          </span>
                        ) : u.is_active === 2 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {t.dash_admin_user_status_rejected || "Ditolak / Nonaktif"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 shadow-2xs animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {t.dash_admin_user_status_pending || "Menunggu Approval"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditUser(u);
                              setIsModalOpen(true);
                            }}
                            title={t.dash_admin_user_tooltip_edit || "Edit Pengguna"}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          
                          <button
                            onClick={() => {
                              setUserToDelete({ id: u.id, name: u.name });
                              setIsDeleteModalOpen(true);
                            }}
                            title={t.dash_admin_user_tooltip_delete || "Hapus Pengguna"}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>

                          {!u.email_verified_at && (
                            <button
                              onClick={() => {
                                if(confirm("Verifikasi email pengguna ini secara manual?")) {
                                  verifyEmailMutation.mutate(u.id);
                                }
                              }}
                              disabled={verifyEmailMutation.isPending}
                              title="Verifikasi Email Manual"
                              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer"
                            >
                              <ShieldCheck size={18} />
                            </button>
                          )}

                          {u.is_active !== 1 && (
                            <button
                              onClick={() => statusMutation.mutate({ userId: u.id, status: 1 })}
                              disabled={statusMutation.isPending}
                              title={t.dash_admin_user_tooltip_activate || "Aktifkan Akun"}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-colors cursor-pointer"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          {u.is_active !== 2 && (
                            <button
                              onClick={() => statusMutation.mutate({ userId: u.id, status: 2 })}
                              disabled={statusMutation.isPending}
                              title={t.dash_admin_user_tooltip_deactivate || "Nonaktifkan Akun"}
                              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs bg-slate-50/30 dark:bg-slate-800/10">
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {t.dash_admin_user_page || "Halaman"} <span className="font-bold text-slate-800 dark:text-white">{meta.current_page}</span> {t.dash_admin_user_of || "dari"}{" "}
                  <span className="font-bold text-slate-800 dark:text-white">{meta.last_page}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, meta.last_page))}
                    disabled={page === meta.last_page}
                    className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editData={editUser}
      />
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={userToDelete}
      />
    </AppLayout>
  );
}
