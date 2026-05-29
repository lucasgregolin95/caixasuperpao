import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditLogResponse } from '@superbom/shared';
import { ShieldAlert, Calendar, User, Eye, EyeOff, Loader2 } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get<AuditLogResponse[]>('/audit');
      setLogs(res.data);
    } catch (e) {
      setError('Erro ao carregar registros de auditoria.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Carregando logs de auditoria...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      
      {/* Cabeçalho */}
      <div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Segurança & Rastreabilidade</span>
        <h1 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
          <ShieldAlert size={22} className="text-indigo-400" />
          Auditoria do Sistema
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Lista de Logs */}
      <div className="space-y-3.5">
        {logs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-500">
            Nenhum log de auditoria registrado no banco de dados.
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const logDate = new Date(log.createdAt).toLocaleString('pt-BR');

            return (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                      log.action.includes('CREATE') ? 'bg-indigo-950 text-indigo-400' :
                      log.action.includes('REOPEN') ? 'bg-amber-950 text-amber-400' :
                      log.action.includes('SEND') ? 'bg-emerald-950 text-emerald-400' :
                      'bg-slate-950 text-slate-400'
                    }`}>
                      {log.action}
                    </span>
                    <p className="text-xs font-bold text-slate-200">{log.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold self-end sm:self-center shrink-0">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {log.user?.name || 'Sistema'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {logDate}
                    </span>
                  </div>
                </div>

                {log.details && (
                  <div className="mt-3 text-right">
                    <button
                      onClick={() => handleToggleExpand(log.id)}
                      className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition"
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff size={10} />
                          Ocultar Modificações
                        </>
                      ) : (
                        <>
                          <Eye size={10} />
                          Ver Alterações
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Exibição detalhada de modificações */}
                {isExpanded && log.details && (
                  <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono overflow-x-auto text-slate-400 leading-relaxed max-h-64">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
