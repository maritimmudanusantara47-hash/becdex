import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Send, Pencil, X, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface IndicatorChatProps {
  submissionId: string;
  indicatorId: number;
}

export function IndicatorChat({ submissionId, indicatorId }: IndicatorChatProps) {
  const [message, setMessage] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editMessage, setEditMessage] = useState<string>('');

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const queryKey = ['indicator-comments', submissionId, indicatorId];

  const { data: commentsData, isLoading } = useQuery({
    queryKey,
    queryFn: async () => (await api.get(`/submissions/${submissionId}/indicators/${indicatorId}/comments`)).data,
  });

  const comments = commentsData?.data || [];

  const addCommentMutation = useMutation({
    mutationFn: async (msg: string) => {
      return await api.post(`/submissions/${submissionId}/indicators/${indicatorId}/comments`, { message: msg });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setMessage('');
    }
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, message }: { commentId: number; message: string }) => {
      return await api.put(
        `/submissions/${submissionId}/indicators/${indicatorId}/comments/${commentId}`,
        { message }
      );
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    addCommentMutation.mutate(message);
  };

  const handleStartEdit = (comment: any) => {
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
            const isEditing = editingCommentId === c.id;
            const isEdited = c.updated_at && c.created_at && c.updated_at !== c.created_at;

            return (
              <div key={c.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-tl-sm shadow-sm'}`}>
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

                    {isMe && !isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(c)}
                        title="Edit Pesan"
                        className="text-blue-200 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                      >
                        <Pencil size={11} />
                      </button>
                    )}
                  </div>

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
                  ) : (
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

