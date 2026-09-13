import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Send, Pencil, X, Check, Loader2, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { isSuperAdmin } from '@/lib/roles';

interface IndicatorChatProps {
  submissionId: string;
  indicatorId: number;
  /** Jika true, gunakan prefix URL /admin untuk request API */
  isAdmin?: boolean;
}

export function IndicatorChat({ submissionId, indicatorId, isAdmin = false }: IndicatorChatProps) {
  const [message, setMessage] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editMessage, setEditMessage] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const queryKey = ['indicator-comments', submissionId, indicatorId];

  // Base URL bergantung apakah digunakan di admin atau company
  const baseUrl = isAdmin
    ? `/admin/submissions/${submissionId}/indicators/${indicatorId}/comments`
    : `/submissions/${submissionId}/indicators/${indicatorId}/comments`;

  const { data: commentsData, isLoading } = useQuery({
    queryKey,
    queryFn: async () => (await api.get(baseUrl)).data,
  });

  const comments = commentsData?.data || [];

  const addCommentMutation = useMutation({
    mutationFn: async (msg: string) => {
      return await api.post(baseUrl, { message: msg });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setMessage('');
    }
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, message }: { commentId: number; message: string }) => {
      return await api.put(`${baseUrl}/${commentId}`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setEditingCommentId(null);
      setEditMessage('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal memperbarui pesan.');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return await api.delete(`${baseUrl}/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setConfirmDeleteId(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal menghapus pesan.');
      setConfirmDeleteId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    addCommentMutation.mutate(message);
  };

  const handleStartEdit = (comment: any) => {
    setConfirmDeleteId(null);
    setEditingCommentId(comment.id);
    setEditMessage(comment.message);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditMessage('');
  };

  const handleSaveEdit = (commentId: number) => {
    if (!editMessage.trim()) return;
    updateCommentMutation.mutate({ commentId, message: editMessage.trim() });
  };

  const handleConfirmDelete = (commentId: number) => {
    setEditingCommentId(null);
    setConfirmDeleteId(commentId);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleDelete = (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };

  return (
    <div className="flex flex-col h-[350px] border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl overflow-hidden mt-4 shadow-inner">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-xs text-slate-500 text-center mt-4">Memuat pesan...</div>
        ) : comments.length === 0 ? (
          <div className="text-xs text-slate-500 text-center mt-4">Belum ada diskusi.</div>
        ) : (
          comments.map((c: any) => {
            const isMe = c.user_id === user?.id;
            const canEdit = isMe;
            // Admin bisa hapus komentar siapapun; user hanya bisa hapus milik sendiri
            const canDelete = isMe || (user && isSuperAdmin(user));
            const isEditing = editingCommentId === c.id;
            const isConfirmingDelete = confirmDeleteId === c.id;
            const isEdited = c.updated_at && c.created_at && c.updated_at !== c.created_at;

            return (
              <div key={c.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-tl-sm shadow-sm'}`}>
                  {/* Header: nama, waktu, tombol aksi */}
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${isMe ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {c.user?.name || 'User'}
                      </span>
                      <span className={`text-[9px] ${isMe ? 'text-blue-200/80' : 'text-slate-400/80'}`}>
                        {formatDate(c.created_at)}
                      </span>
                      {isEdited && (
                        <span className={`text-[9px] italic ${isMe ? 'text-blue-200/80' : 'text-slate-400'}`}>
                          (diedit)
                        </span>
                      )}
                    </div>

                    {/* Tombol Edit & Hapus — hanya tampil jika tidak sedang dalam mode edit/delete */}
                    {!isEditing && !isConfirmingDelete && (
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(c)}
                            title="Edit Pesan"
                            className={`p-0.5 rounded transition-colors cursor-pointer ${isMe ? 'text-blue-200 hover:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                          >
                            <Pencil size={11} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(c.id)}
                            title="Hapus Pesan"
                            className={`p-0.5 rounded transition-colors cursor-pointer ${isMe ? 'text-blue-200 hover:text-red-300' : 'text-slate-400 hover:text-red-500 dark:hover:text-red-400'}`}
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mode Edit */}
                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        rows={2}
                        disabled={updateCommentMutation.isPending}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-blue-300 dark:border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-400"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={updateCommentMutation.isPending}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <X size={11} />
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(c.id)}
                          disabled={!editMessage.trim() || updateCommentMutation.isPending}
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-white text-blue-700 hover:bg-blue-50 rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateCommentMutation.isPending ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Check size={11} />
                          )}
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : isConfirmingDelete ? (
                    /* Mode Konfirmasi Hapus */
                    <div className="pt-1 space-y-2">
                      <p className={`text-[10px] font-semibold ${isMe ? 'text-blue-100' : 'text-slate-600 dark:text-slate-300'}`}>
                        Hapus pesan ini?
                      </p>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={handleCancelDelete}
                          disabled={deleteCommentMutation.isPending}
                          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50 ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'}`}
                        >
                          <X size={11} />
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          disabled={deleteCommentMutation.isPending}
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteCommentMutation.isPending ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Trash2 size={11} />
                          )}
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Isi pesan normal */
                    <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">{c.message}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200/80 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik pesan..."
            disabled={addCommentMutation.isPending}
            className="flex-1 px-3 py-2 text-xs border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl focus:outline-hidden focus:border-blue-500 dark:text-white"
          />
          <button
            type="submit"
            disabled={!message.trim() || addCommentMutation.isPending}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
          >
            <Send size={14} className={addCommentMutation.isPending ? 'animate-pulse' : ''} />
          </button>
        </form>
      </div>
    </div>
  );
}
