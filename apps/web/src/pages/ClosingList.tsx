import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CashClosingResponse, ClosingStatus, UserRole } from '@superbom/shared';
import {
  FileText,
  Printer,
  Edit2,
  RefreshCw,
  FolderOpen,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

export const ClosingList: React.FC = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [closings, setClosings] = useState<CashClosingResponse[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para Modal de Reabertura
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenId, setReopenId] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenSubmitting, setReopenSubmitting] = useState(false);

  const fetchClosings = async () => {
    setLoading(true);
    try {
      const res = await api.get<CashClosingResponse[]>('/closings');
      setClosings(res.data);
      
      // Auto-expandir se houver um id destacado pela notificação
      if (highlightId) {
        setExpandedId(highlightId);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar fechamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosings();
  }, [highlightId]);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmit = async (id: string) => {
    if (!window.confirm('Tem certeza de que deseja finalizar e enviar este fechamento? A edição será bloqueada.')) return;
    setError('');
    setSuccess('');
    try {
      await api.post(`/closings/${id}/submit`);
      setSuccess('Fechamento enviado com sucesso!');
      fetchClosings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar fechamento.');
    }
  };

  const handleOpenReopenModal = (id: string) => {
    setReopenId(id);
    setReopenReason('');
    setIsReopenModalOpen(true);
  };

  const handleReopenSubmit = async () => {
    if (!reopenReason.trim()) {
      alert('Por favor, informe o motivo da reabertura.');
      return;
    }
    setReopenSubmitting(true);
    setError('');
    try {
      await api.post(`/closings/${reopenId}/reopen`, { reason: reopenReason });
      setSuccess('Fechamento reaberto com sucesso!');
      setIsReopenModalOpen(false);
      fetchClosings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao reabrir fechamento.');
    } finally {
      setReopenSubmitting(false);
    }
  };

  const handlePrint = (id: string) => {
    // Abre a visualização em HTML para impressão do navegador
    const host = window.location.hostname;
    const baseURL = import.meta.env.VITE_API_URL || `http://${host}:3000/api`;
    const token = localStorage.getItem('superbom_access_token');
    
    // Abre em nova guia passando o token na query ou via janela
    const printUrl = `${baseURL}/reports/${id}/export/pdf?authorization=Bearer ${token}`;
    
    // Para simplificar a autorização na rota de exportação direta do backend, 
    // podemos abrir um iframe ou window e realizar o print. 
    // Vamos configurar a janela de print buscando as credenciais locais
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write('<h3>Carregando relatório para impressão...</h3>');
      api.get(`/reports/${id}/export/pdf`, { responseType: 'text' }).then((res) => {
        newWindow.document.open();
        newWindow.document.write(res.data);
        newWindow.document.close();
      }).catch(() => {
        newWindow.document.body.innerHTML = '<h3>Erro ao carregar o relatório de impressão.</h3>';
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Buscando histórico...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* Alertas */}
      {success && (
        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl text-center">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-xl text-center">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Padaria Super Bom</span>
          <h1 className="text-xl md:text-2xl font-black text-slate-100">Histórico de Fechamentos</h1>
        </div>
        <button
          onClick={fetchClosings}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition"
          title="Recarregar dados"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {closings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-500">
            Nenhum fechamento registrado encontrado.
          </div>
        ) : (
          closings.map((closing) => {
            const isExpanded = expandedId === closing.id;
            const isHighlight = highlightId === closing.id;
            const dateFormatted = new Date(closing.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            return (
              <div
                key={closing.id}
                className={`bg-slate-900 border rounded-3xl overflow-hidden transition-all duration-200 ${
                  isHighlight ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header do Card */}
                <div
                  onClick={() => handleToggleExpand(closing.id)}
                  className="p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                      <FolderOpen size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-sm md:text-base">Caixa {closing.cashNumber}</span>
                        <span className="text-xs text-slate-500 font-bold uppercase">({closing.shift})</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Ref: {dateFormatted} | Operador: {closing.operator?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-mono font-bold text-slate-100 block">
                        R$ {closing.totalFinal.toFixed(2)}
                      </span>
                      <span className={`inline-flex items-center text-[9px] font-extrabold uppercase mt-1 px-2 py-0.5 rounded-full ${
                        closing.status === 'ENVIADO' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {closing.status}
                      </span>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp className="text-slate-500" size={18} /> : <ChevronDown className="text-slate-500" size={18} />}
                    </div>
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800 bg-slate-950/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                      
                      {/* Entradas */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Resumo de Entradas</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>Moedas Físicas:</span>
                            <span className="font-mono font-bold text-slate-200">R$ {closing.totalCoins.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Cédulas Físicas:</span>
                            <span className="font-mono font-bold text-slate-200">R$ {closing.totalBills.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-900 pt-1.5 text-slate-400">
                            <span>Total Dinheiro:</span>
                            <span className="font-mono font-bold text-slate-200">R$ {closing.totalCash.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>PIX:</span>
                            <span className="font-mono font-bold text-slate-200">R$ {closing.pixValue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Cartão Total:</span>
                            <span className="font-mono font-bold text-slate-200">R$ {closing.cardTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-400 pl-4 border-l border-slate-800">
                            <span>Débito: R$ {closing.cardDebit.toFixed(2)} | Crédito: R$ {closing.cardCredit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold text-slate-300">
                            <span>Total Entradas:</span>
                            <span className="font-mono text-emerald-400">R$ {closing.totalEntries.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Saídas/Ajustes */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Saídas & Ajustes</h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-slate-400">
                              <span>Retiradas / Sangrias:</span>
                              <span className="font-mono font-bold text-rose-400">- R$ {closing.withdrawalValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Passagens / Ajustes:</span>
                              <span className="font-mono font-bold text-rose-400">- R$ {closing.adjustmentValue.toFixed(2)}</span>
                            </div>
                            {closing.adjustmentDescription && (
                              <p className="text-[10px] text-slate-500 italic mt-1 pl-2 border-l border-slate-800">
                                Descr. Ajuste: {closing.adjustmentDescription}
                              </p>
                            )}
                            <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold text-slate-300">
                              <span>Total Saídas:</span>
                              <span className="font-mono text-rose-400">R$ {closing.totalExits.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        {closing.notes && (
                          <div className="mt-4 p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-[11px] text-yellow-500/90 leading-relaxed">
                            <strong>Notas:</strong> {closing.notes}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Botões de Ação do Card */}
                    <div className="flex flex-wrap gap-2.5 mt-4 pt-4 border-t border-slate-800/50 justify-end">
                      {/* Visualizar Relatório / PDF */}
                      <button
                        onClick={() => handlePrint(closing.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition"
                      >
                        <Printer size={14} />
                        Imprimir / PDF
                      </button>

                      {/* Editar Rascunho */}
                      {(closing.status === ClosingStatus.RASCUNHO || hasRole([UserRole.ADMIN, UserRole.SUPERVISOR])) && (
                        <button
                          onClick={() => navigate(`/closings/edit/${closing.id}`)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-indigo-400 font-bold rounded-xl text-xs transition"
                        >
                          <Edit2 size={14} />
                          Editar Lançamento
                        </button>
                      )}

                      {/* Enviar / Finalizar Caixa */}
                      {closing.status === ClosingStatus.RASCUNHO && (
                        <button
                          onClick={() => handleSubmit(closing.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/10"
                        >
                          <Send size={14} />
                          Enviar Fechamento
                        </button>
                      )}

                      {/* Reabrir Fechamento (Supervisor/Admin apenas) */}
                      {closing.status === ClosingStatus.ENVIADO && hasRole([UserRole.ADMIN, UserRole.SUPERVISOR]) && (
                        <button
                          onClick={() => handleOpenReopenModal(closing.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-500 font-bold rounded-xl text-xs transition"
                        >
                          <RefreshCw size={14} />
                          Reabrir Caixa
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Motivo de Reabertura */}
      {isReopenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black text-slate-100">Reabrir Fechamento?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              O caixa voltará a ficar como <strong className="text-slate-300">Rascunho</strong>, permitindo que o operador o edite. Informe o motivo abaixo (obrigatório para auditoria):
            </p>
            <div className="mt-4">
              <textarea
                rows={3}
                required
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="Ex: Operador digitou quantidade incorreta de moedas de 0.50..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setIsReopenModalOpen(false)}
                className="py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                disabled={reopenSubmitting}
                onClick={handleReopenSubmit}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                {reopenSubmitting && <Loader2 size={12} className="animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
