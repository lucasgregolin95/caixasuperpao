import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CashClosingResponse } from '@superbom/shared';
import {
  FileDown,
  Printer,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Loader2
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [closings, setClosings] = useState<CashClosingResponse[]>([]);
  const [summary, setSummary] = useState({
    count: 0,
    totalEntries: 0,
    totalExits: 0,
    totalFinal: 0,
  });

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shift, setShift] = useState('');
  const [cashNumber, setCashNumber] = useState('');
  const [status, setStatus] = useState('');

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (shift) params.shift = shift;
      if (cashNumber) params.cashNumber = cashNumber;
      if (status) params.status = status;

      const res = await api.get('/reports/summary', { params });
      setClosings(res.data.closings);
      setSummary(res.data.summary);
    } catch (e) {
      console.error('Erro ao buscar dados de relatório:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReportData();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setShift('');
    setCashNumber('');
    setStatus('');
    setTimeout(fetchReportData, 50);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (shift) params.shift = shift;
      if (cashNumber) params.cashNumber = cashNumber;
      if (status) params.status = status;

      const res = await api.get('/reports/export/csv', {
        params,
        responseType: 'blob',
      });

      // Cria um link temporário para download do blob CSV
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_caixa_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = (id: string) => {
    const host = window.location.hostname;
    const baseURL = import.meta.env.VITE_API_URL || `http://${host}:3000/api`;
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

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      
      {/* Cabeçalho */}
      <div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Módulo do Supervisor/Gerente</span>
        <h1 className="text-xl md:text-2xl font-black text-slate-100">Relatórios Consolidados</h1>
      </div>

      {/* Grid de Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2.5">
          <Filter className="text-indigo-400" size={16} />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtrar Lançamentos</span>
        </div>
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 items-end">
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Data Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Data Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Turno</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none h-[34px]"
            >
              <option value="">Todos</option>
              <option value="MANHA">Manhã</option>
              <option value="TARDE">Tarde</option>
              <option value="NOITE">Noite</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Caixa</label>
            <select
              value={cashNumber}
              onChange={(e) => setCashNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none h-[34px]"
            >
              <option value="">Todos</option>
              <option value="1">Caixa 1</option>
              <option value="2">Caixa 2</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none h-[34px]"
            >
              <option value="">Todos</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="ENVIADO">Enviado</option>
            </select>
          </div>
          <div className="md:col-span-5 flex gap-2.5 justify-end mt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 font-bold rounded-xl text-xs transition"
            >
              Limpar Filtros
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
            >
              <Search size={14} />
              Aplicar Filtros
            </button>
          </div>
        </form>
      </div>

      {/* Cartões de Resumos Consolidados */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Lançamentos</span>
            <span className="text-xl font-black block text-slate-100 mt-1">{summary.count}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
            <Filter size={16} />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Total Entradas</span>
            <span className="text-xl font-black block text-emerald-400 mt-1">R$ {summary.totalEntries.toFixed(2)}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Total Saídas</span>
            <span className="text-xl font-black block text-rose-400 mt-1">R$ {summary.totalExits.toFixed(2)}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-950/20 border border-rose-800/30 flex items-center justify-center text-rose-400">
            <TrendingDown size={16} />
          </div>
        </div>
        <div className="bg-indigo-900 border border-indigo-800 p-5 rounded-3xl flex items-center justify-between shadow-lg shadow-indigo-600/5">
          <div>
            <span className="text-[9px] uppercase font-bold text-indigo-300 tracking-wider">Saldo Líquido</span>
            <span className="text-xl font-black block text-white mt-1">R$ {summary.totalFinal.toFixed(2)}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-300">
            <DollarSign size={16} />
          </div>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Relatório Analítico</span>
          <button
            onClick={handleExportCsv}
            disabled={exporting || closings.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-indigo-400 font-bold rounded-xl text-xs transition disabled:opacity-50"
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={14} />}
            Exportar CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Filtrando dados...</div>
          ) : closings.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">Nenhum resultado para os filtros atuais.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-3.5">Data</th>
                  <th className="px-6 py-3.5">Caixa</th>
                  <th className="px-6 py-3.5">Turno</th>
                  <th className="px-6 py-3.5">Operador</th>
                  <th className="px-6 py-3.5 text-right">Entradas</th>
                  <th className="px-6 py-3.5 text-right">Saídas</th>
                  <th className="px-6 py-3.5 text-right">Saldo Final</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
                {closings.map((c) => {
                  const dateFormatted = new Date(c.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                  return (
                    <tr key={c.id} className="hover:bg-slate-950/20 transition">
                      <td className="px-6 py-3.5">{dateFormatted}</td>
                      <td className="px-6 py-3.5 font-bold">Caixa {c.cashNumber}</td>
                      <td className="px-6 py-3.5 uppercase">{c.shift}</td>
                      <td className="px-6 py-3.5">{c.operator?.name}</td>
                      <td className="px-6 py-3.5 text-right font-mono text-emerald-400">R$ {c.totalEntries.toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-right font-mono text-rose-400">R$ {c.totalExits.toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-100">R$ {c.totalFinal.toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          c.status === 'ENVIADO' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <button
                          onClick={() => handlePrint(c.id)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                          title="Imprimir / PDF"
                        >
                          <Printer size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
