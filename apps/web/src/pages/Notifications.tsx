import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NotificationResponse } from '@superbom/shared';
import { Bell, Check, Loader2, Trash2 } from 'lucide-react';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get<NotificationResponse[]>('/notifications');
      setNotifications(res.data);
    } catch (e) {
      setError('Erro ao carregar notificações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Carregando notificações...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Mensagens do Sistema</span>
          <h1 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
            <Bell size={20} className="text-indigo-400" />
            Notificações
          </h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 hover:text-indigo-300 font-bold rounded-xl text-xs transition"
          >
            <Check size={14} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-500">
            Você não possui notificações no momento.
          </div>
        ) : (
          notifications.map((n) => {
            const createdDate = new Date(n.createdAt).toLocaleString('pt-BR');

            return (
              <div
                key={n.id}
                className={`bg-slate-900 border rounded-2xl p-4 flex gap-4 transition-all ${
                  !n.read 
                    ? 'border-indigo-500/40 bg-slate-900/80 shadow-md shadow-indigo-600/5' 
                    : 'border-slate-800 opacity-75'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  !n.read ? 'bg-indigo-950 text-indigo-400' : 'bg-slate-950 text-slate-500'
                }`}>
                  <Bell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-sm font-bold text-slate-200 truncate">{n.title}</h3>
                    <span className="text-[10px] text-slate-500 shrink-0 font-medium">{createdDate}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{n.message}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition align-self-start shrink-0 self-center"
                    title="Marcar como lida"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
