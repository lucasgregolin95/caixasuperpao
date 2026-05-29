import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CashClosingResponse, UserRole } from '@superbom/shared';
import {
  PlusCircle,
  History,
  FileBarChart2,
  Users as UsersIcon,
  Wallet,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [closings, setClosings] = useState<CashClosingResponse[]>([]);
  const [stats, setStats] = useState({
    totalFinal: 0,
    entries: 0,
    exits: 0,
    drafts: 0,
    submitted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClosings = async () => {
      try {
        const res = await api.get<CashClosingResponse[]>('/closings');
        setClosings(res.data);
        
        // Calcular estatísticas com base nos fechamentos recebidos
        const drafts = res.data.filter((c) => c.status === 'RASCUNHO').length;
        const submitted = res.data.filter((c) => c.status === 'ENVIADO').length;
        const totalFinal = res.data.reduce((sum, c) => sum + c.totalFinal, 0);
        const entries = res.data.reduce((sum, c) => sum + c.totalEntries, 0);
        const exits = res.data.reduce((sum, c) => sum + c.totalExits, 0);

        setStats({ totalFinal, entries, exits, drafts, submitted });
      } catch (e) {
        console.error('Erro ao buscar fechamentos para estatísticas:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchClosings();
  }, []);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Bom dia';
    if (hr < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Mensagem de Boas-Vindas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">Painel Operacional</span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100">{getGreeting()}, {user?.name}!</h1>
          <p className="text-sm text-slate-400 mt-1">Acompanhe as contagens de caixa da padaria Super Bom.</p>
        </div>
        <div className="px-4 py-2 bg-indigo-950/50 border border-indigo-800/50 rounded-2xl flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Perfil: {user?.role}</span>
        </div>
      </div>

      {/* Estatísticas Consolidadas */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Saldo Acumulado</span>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-lg font-black ${stats.totalFinal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                R$ {stats.totalFinal.toFixed(2)}
              </span>
              <TrendingUp className="text-slate-600 hidden sm:block" size={20} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Recebido (PIX/Cartão/Dinheiro)</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-black text-slate-200">
                R$ {stats.entries.toFixed(2)}
              </span>
              <Wallet className="text-slate-600 hidden sm:block" size={20} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Rascunhos Abertos</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-black text-amber-500">
                {stats.drafts}
              </span>
              <Clock className="text-slate-600 hidden sm:block" size={20} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Caixas Finalizados</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-black text-emerald-500">
                {stats.submitted}
              </span>
              <CheckCircle2 className="text-slate-600 hidden sm:block" size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Atalhos com Botões Grandes (Mobile-First) */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          
          {/* Novo Fechamento */}
          {hasRole([UserRole.ADMIN, UserRole.GERENTE, UserRole.CAIXA]) && (
            <button
              onClick={() => navigate('/closings/new')}
              className="flex flex-col items-center justify-center p-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-3xl group shadow-lg transition-all text-center h-44"
            >
              <div className="w-12 h-12 bg-indigo-950 border border-indigo-800 text-indigo-400 group-hover:scale-110 rounded-2xl flex items-center justify-center transition-all">
                <PlusCircle size={24} />
              </div>
              <span className="font-bold text-slate-200 mt-4 block text-base">Novo Fechamento</span>
              <span className="text-xs text-slate-500 mt-1 block">Registrar valores do turno</span>
            </button>
          )}

          {/* Histórico/Meus Fechamentos */}
          <button
            onClick={() => navigate('/closings')}
            className="flex flex-col items-center justify-center p-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-3xl group shadow-lg transition-all text-center h-44"
          >
            <div className="w-12 h-12 bg-slate-950 border border-slate-800 text-slate-400 group-hover:scale-110 rounded-2xl flex items-center justify-center transition-all">
              <History size={24} />
            </div>
            <span className="font-bold text-slate-200 mt-4 block text-base">Meus Fechamentos</span>
            <span className="text-xs text-slate-500 mt-1 block">Ver lançamentos anteriores</span>
          </button>

          {/* Relatórios */}
          {hasRole([UserRole.ADMIN, UserRole.GERENTE, UserRole.SUPERVISOR]) && (
            <button
              onClick={() => navigate('/reports')}
              className="flex flex-col items-center justify-center p-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-3xl group shadow-lg transition-all text-center h-44"
            >
              <div className="w-12 h-12 bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 group-hover:scale-110 rounded-2xl flex items-center justify-center transition-all">
                <FileBarChart2 size={24} />
              </div>
              <span className="font-bold text-slate-200 mt-4 block text-base">Relatórios Consolidados</span>
              <span className="text-xs text-slate-500 mt-1 block">Filtrar e exportar dados</span>
            </button>
          )}

          {/* Usuários */}
          {hasRole([UserRole.ADMIN]) && (
            <button
              onClick={() => navigate('/users')}
              className="flex flex-col items-center justify-center p-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-3xl group shadow-lg transition-all text-center h-44"
            >
              <div className="w-12 h-12 bg-purple-950/50 border border-purple-800/50 text-purple-400 group-hover:scale-110 rounded-2xl flex items-center justify-center transition-all">
                <UsersIcon size={24} />
              </div>
              <span className="font-bold text-slate-200 mt-4 block text-base">Gerenciar Usuários</span>
              <span className="text-xs text-slate-500 mt-1 block">CRUD de operadores e gerentes</span>
            </button>
          )}
        </div>
      </div>

      {/* Histórico Recente */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Últimos Fechamentos Registrados</h2>
          <Link to="/closings" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Ver todos</Link>
        </div>
        <div className="space-y-3">
          {closings.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">Nenhum fechamento registrado recentemente.</div>
          ) : (
            closings.slice(0, 3).map((closing) => (
              <div
                key={closing.id}
                onClick={() => navigate(`/closings?highlight=${closing.id}`)}
                className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 cursor-pointer transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">Caixa {closing.cashNumber}</span>
                    <span className="text-xs text-slate-500">({closing.shift})</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Operador: {closing.operator?.name} | {new Date(closing.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold block text-slate-100">
                    R$ {closing.totalFinal.toFixed(2)}
                  </span>
                  <span className={`inline-block text-[9px] font-extrabold uppercase mt-1 px-2 py-0.5 rounded-full ${
                    closing.status === 'ENVIADO' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {closing.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
