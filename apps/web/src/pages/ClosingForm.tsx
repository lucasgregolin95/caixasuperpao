import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DenominationRow } from '../components/DenominationRow';
import { Shift, CashClosingInput, ClosingStatus, UserRole } from '@superbom/shared';
import { Save, Send, AlertTriangle, ArrowLeft, Loader2, Info, Sparkles } from 'lucide-react';

export const ClosingForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Se presente, estamos editando

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Campos principais
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<Shift>(Shift.MANHA);
  const [cashNumber, setCashNumber] = useState<number>(1);
  const [notes, setNotes] = useState('');

  // Moedas
  const [coins, setCoins] = useState({
    c005: 0,
    c010: 0,
    c025: 0,
    c050: 0,
    c100: 0,
  });

  // Notas
  const [bills, setBills] = useState({
    b2: 0,
    b5: 0,
    b10: 0,
    b20: 0,
    b50: 0,
    b100: 0,
  });

  // Outros pagamentos e saídas
  const [pixValue, setPixValue] = useState<number>(0);
  const [cardDebit, setCardDebit] = useState<number>(0);
  const [cardCredit, setCardCredit] = useState<number>(0);
  const [withdrawalValue, setWithdrawalValue] = useState<number>(0);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  const [adjustmentDescription, setAdjustmentDescription] = useState('');
  const [isSuggestionApplied, setIsSuggestionApplied] = useState(false);

  // Carregar dados se for Edição de Rascunho
  useEffect(() => {
    if (!id) return;

    const fetchClosing = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/closings/${id}`);
        const c = res.data;

        if (c.status === ClosingStatus.ENVIADO && user?.role === UserRole.CAIXA) {
          setError('Este fechamento já foi enviado e a edição está bloqueada.');
          return;
        }

        setDate(c.date);
        setShift(c.shift as Shift);
        setCashNumber(c.cashNumber);
        setNotes(c.notes || '');

        setCoins({
          c005: c.coins005,
          c010: c.coins010,
          c025: c.coins025,
          c050: c.coins050,
          c100: c.coins100,
        });

        setBills({
          b2: c.bills2,
          b5: c.bills5,
          b10: c.bills10,
          b20: c.bills20,
          b50: c.bills50,
          b100: c.bills100,
        });

        setPixValue(c.pixValue);
        setCardDebit(c.cardDebit);
        setCardCredit(c.cardCredit);
        setWithdrawalValue(c.withdrawalValue);
        setAdjustmentValue(c.adjustmentValue);
        setAdjustmentDescription(c.adjustmentDescription || '');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao carregar fechamento.');
      } finally {
        setLoading(false);
      }
    };

    fetchClosing();
  }, [id, user]);

  // Totais em Tempo Real (Cálculo idêntico ao backend)
  const totalCoins = Number(
    (
      coins.c005 * 0.05 +
      coins.c010 * 0.10 +
      coins.c025 * 0.25 +
      coins.c050 * 0.50 +
      coins.c100 * 1.00
    ).toFixed(2)
  );

  const totalBills = Number(
    (
      bills.b2 * 2 +
      bills.b5 * 5 +
      bills.b10 * 10 +
      bills.b20 * 20 +
      bills.b50 * 50 +
      bills.b100 * 100
    ).toFixed(2)
  );

  const totalCash = Number((totalCoins + totalBills).toFixed(2));
  const cardTotal = Number((cardDebit + cardCredit).toFixed(2));
  const totalEntries = Number((totalCash + pixValue + cardTotal).toFixed(2));
  const totalExits = Number((withdrawalValue + adjustmentValue).toFixed(2));
  const totalFinal = Number((totalEntries - totalExits).toFixed(2));

  // Sugestão de Sangria Inteligente
  const getSangriaSuggestion = () => {
    const denominations = [
      { type: 'coin', label: 'Moeda de R$ 0,05', value: 0.05, key: 'c005' },
      { type: 'coin', label: 'Moeda de R$ 0,10', value: 0.10, key: 'c010' },
      { type: 'coin', label: 'Moeda de R$ 0,25', value: 0.25, key: 'c025' },
      { type: 'coin', label: 'Moeda de R$ 0,50', value: 0.50, key: 'c050' },
      { type: 'coin', label: 'Moeda de R$ 1,00', value: 1.00, key: 'c100' },
      { type: 'bill', label: 'Cédula de R$ 2,00', value: 2, key: 'b2' },
      { type: 'bill', label: 'Cédula de R$ 5,00', value: 5, key: 'b5' },
      { type: 'bill', label: 'Cédula de R$ 10,00', value: 10, key: 'b10' },
      { type: 'bill', label: 'Cédula de R$ 20,00', value: 20, key: 'b20' },
      { type: 'bill', label: 'Cédula de R$ 50,00', value: 50, key: 'b50' },
      { type: 'bill', label: 'Cédula de R$ 100,00', value: 100, key: 'b100' },
    ] as const;

    if (totalCash <= 100) {
      const itemsToKeep = denominations
        .map((d) => {
          const qty = d.type === 'coin' ? coins[d.key as keyof typeof coins] : bills[d.key as keyof typeof bills];
          return { label: d.label, qty, value: d.value };
        })
        .filter((item) => item.qty > 0);

      return {
        keepTotal: totalCash,
        withdrawalTotal: 0,
        itemsToKeep,
      };
    }

    let currentKeepSum = 0;
    const keepCounts: Record<string, number> = {};

    // Algoritmo guloso para atingir NO MÍNIMO R$ 100,00 para troco
    for (const denom of denominations) {
      const available = denom.type === 'coin'
        ? coins[denom.key as keyof typeof coins]
        : bills[denom.key as keyof typeof bills];

      if (available === 0) continue;

      // Adiciona unidade por unidade até atingir ou ultrapassar 100
      for (let i = 0; i < available; i++) {
        if (currentKeepSum >= 100) break;
        
        keepCounts[denom.key] = (keepCounts[denom.key] || 0) + 1;
        currentKeepSum = Number((currentKeepSum + denom.value).toFixed(2));
      }

      if (currentKeepSum >= 100) break;
    }

    const withdrawalTotal = Number((totalCash - currentKeepSum).toFixed(2));
    const itemsToKeep = denominations
      .map((d) => ({
        label: d.label,
        qty: keepCounts[d.key] || 0,
        value: d.value,
      }))
      .filter((item) => item.qty > 0);

    return {
      keepTotal: currentKeepSum,
      withdrawalTotal: withdrawalTotal >= 0 ? withdrawalTotal : 0,
      itemsToKeep,
    };
  };

  const suggestion = getSangriaSuggestion();

  // Sincronização automática em tempo real se o botão foi acionado e os valores de notas mudarem
  useEffect(() => {
    if (isSuggestionApplied) {
      setWithdrawalValue(suggestion.withdrawalTotal);
      setAdjustmentDescription(`Sangria automática de fechamento. Troco reservado em caixa: R$ ${suggestion.keepTotal.toFixed(2)}.`);
    }
  }, [suggestion.withdrawalTotal, suggestion.keepTotal, isSuggestionApplied]);

  const handleApplySuggestion = () => {
    setIsSuggestionApplied(true);
    setWithdrawalValue(suggestion.withdrawalTotal);
    setAdjustmentDescription(`Sangria automática de fechamento. Troco reservado em caixa: R$ ${suggestion.keepTotal.toFixed(2)}.`);
    showToast('Sugestão de sangria aplicada com sucesso!');
  };

  // Helpers de Atualização
  const updateCoin = (key: keyof typeof coins, qty: number) => {
    setCoins((prev) => ({ ...prev, [key]: qty }));
  };

  const updateBill = (key: keyof typeof bills, qty: number) => {
    setBills((prev) => ({ ...prev, [key]: qty }));
  };

  const buildPayload = (): CashClosingInput => {
    return {
      date,
      shift,
      cashNumber,
      notes,
      coinsCount: coins,
      billsCount: bills,
      pixValue,
      cardDebit,
      cardCredit,
      cardTotal,
      withdrawalValue,
      adjustmentValue,
      adjustmentDescription,
    };
  };

  const handleSaveDraft = async () => {
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = buildPayload();
      if (id) {
        await api.put(`/closings/${id}`, payload);
        showToast('Rascunho atualizado com sucesso!');
      } else {
        const res = await api.post('/closings', payload);
        showToast('Rascunho criado com sucesso!');
        // Redireciona para o formulário com ID para edições subsequentes
        navigate(`/closings/edit/${res.data.id}`, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar rascunho.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClosing = async () => {
    setIsConfirmModalOpen(false);
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = buildPayload();
      let closingId = id;

      // Salva rascunho antes de enviar, garantindo persistência dos últimos inputs
      if (id) {
        await api.put(`/closings/${id}`, payload);
      } else {
        const res = await api.post('/closings', payload);
        closingId = res.data.id;
      }

      await api.post(`/closings/${closingId}/submit`);
      showToast('Fechamento de caixa enviado com sucesso!');
      setTimeout(() => navigate('/closings'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar fechamento.');
      setSubmitting(false);
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDecimalInput = (val: string, setter: (num: number) => void) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 0) {
      setter(0);
    } else {
      // Limita em duas casas decimais
      setter(Number(parsed.toFixed(2)));
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Carregando fechamento...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-32">
      
      {/* Botão Voltar */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition"
        >
          <ArrowLeft size={14} />
          Voltar para o Dashboard
        </button>
      </div>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Padaria Super Bom</span>
          <h1 className="text-xl md:text-2xl font-black text-slate-100">
            {id ? 'Editar Fechamento de Caixa' : 'Novo Fechamento de Caixa'}
          </h1>
        </div>
      </div>

      {/* Toasts / Alertas */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-2xl animate-bounce">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-xl flex gap-2 items-center">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        
        {/* Metadados Básicos */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Data de Fechamento</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Turno Operacional</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as Shift)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value={Shift.MANHA}>Manhã</option>
              <option value={Shift.TARDE}>Tarde</option>
              <option value={Shift.NOITE}>Noite</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Número do Caixa</label>
            <select
              value={cashNumber}
              onChange={(e) => setCashNumber(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value={1}>Caixa 1</option>
              <option value={2}>Caixa 2</option>
              <option value={3}>Caixa 3 (Futuro)</option>
            </select>
          </div>
        </div>

        {/* Contagem de Moedas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider">Contagem de Moedas</h2>
            <span className="text-xs font-bold text-indigo-400">Total: R$ {totalCoins.toFixed(2)}</span>
          </div>
          <div className="space-y-2.5">
            <DenominationRow label="R$ 0,05" denomination={0.05} quantity={coins.c005} onChange={(qty: number) => updateCoin('c005', qty)} />
            <DenominationRow label="R$ 0,10" denomination={0.10} quantity={coins.c010} onChange={(qty: number) => updateCoin('c010', qty)} />
            <DenominationRow label="R$ 0,25" denomination={0.25} quantity={coins.c025} onChange={(qty: number) => updateCoin('c025', qty)} />
            <DenominationRow label="R$ 0,50" denomination={0.50} quantity={coins.c050} onChange={(qty: number) => updateCoin('c050', qty)} />
            <DenominationRow label="R$ 1,00" denomination={1.00} quantity={coins.c100} onChange={(qty: number) => updateCoin('c100', qty)} />
          </div>
        </div>

        {/* Contagem de Notas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider">Contagem de Cédulas</h2>
            <span className="text-xs font-bold text-emerald-400">Total: R$ {totalBills.toFixed(2)}</span>
          </div>
          <div className="space-y-2.5">
            <DenominationRow label="R$ 2,00" denomination={2} quantity={bills.b2} onChange={(qty: number) => updateBill('b2', qty)} isBill />
            <DenominationRow label="R$ 5,00" denomination={5} quantity={bills.b5} onChange={(qty: number) => updateBill('b5', qty)} isBill />
            <DenominationRow label="R$ 10,00" denomination={10} quantity={bills.b10} onChange={(qty: number) => updateBill('b10', qty)} isBill />
            <DenominationRow label="R$ 20,00" denomination={20} quantity={bills.b20} onChange={(qty: number) => updateBill('b20', qty)} isBill />
            <DenominationRow label="R$ 50,00" denomination={50} quantity={bills.b50} onChange={(qty: number) => updateBill('b50', qty)} isBill />
            <DenominationRow label="R$ 100,00" denomination={100} quantity={bills.b100} onChange={(qty: number) => updateBill('b100', qty)} isBill />
          </div>
        </div>

        {/* Sugestão Inteligente de Sangria */}
        {totalCash > 0 && (
          <div className="bg-slate-900 border border-indigo-500/20 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950/20">
            {/* Efeito luminoso de fundo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                Sugestão Inteligente de Sangria
              </h2>
              <span className="ml-auto text-[9px] font-black uppercase bg-indigo-600/25 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Troco Alvo: R$ 100,00
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Troco a Deixar no Caixa
                </span>
                <span className="text-xl font-mono font-black text-slate-200">
                  R$ {suggestion.keepTotal.toFixed(2)}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Moedas e notas de menor valor selecionadas para facilitar o troco do próximo turno.
                </p>
              </div>

              <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  Sangria Sugerida (Retirada)
                </span>
                <span className="text-xl font-mono font-black text-indigo-300">
                  R$ {suggestion.withdrawalTotal.toFixed(2)}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Valor excedente a ser retirado da gaveta e enviado aos administradores.
                </p>
              </div>
            </div>

            {suggestion.itemsToKeep.length > 0 && (
              <div className="mb-5 bg-slate-950/20 border border-slate-800/40 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Notas e Moedas recomendadas para manter:
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestion.itemsToKeep.map((item, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg hover:border-slate-700 transition"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.value < 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <strong className="text-indigo-400 font-bold">{item.qty}x</strong> {item.label.replace('Moeda de ', '').replace('Cédula de ', '')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleApplySuggestion}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-xl text-xs transition active:scale-[0.98] ${
                  isSuggestionApplied
                    ? 'bg-emerald-500/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-600'
                }`}
              >
                {isSuggestionApplied ? '✓ Sugestão Aplicada (Sincronizada)' : 'Aplicar Sugestão de Sangria'}
              </button>
            </div>
          </div>
        )}

        {/* Outras Entradas (Pix / Cartão) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6">
          <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider mb-4">Outros Meios de Entrada</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">PIX Geral (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={pixValue === 0 ? '' : pixValue}
                onChange={(e) => handleDecimalInput(e.target.value, setPixValue)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Cartão DÉBITO (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cardDebit === 0 ? '' : cardDebit}
                onChange={(e) => handleDecimalInput(e.target.value, setCardDebit)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Cartão CRÉDITO (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cardCredit === 0 ? '' : cardCredit}
                onChange={(e) => handleDecimalInput(e.target.value, setCardCredit)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-3 text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Cartão (Consolidado)</span>
            <span className="text-xs font-bold text-slate-300">R$ {cardTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Saídas/Ajustes */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6">
          <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider mb-4">Saídas e Ajustes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Retiradas / Sangrias (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={withdrawalValue === 0 ? '' : withdrawalValue}
                onChange={(e) => {
                  setIsSuggestionApplied(false);
                  handleDecimalInput(e.target.value, setWithdrawalValue);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-400 focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Passagens / Ajustes (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={adjustmentValue === 0 ? '' : adjustmentValue}
                onChange={(e) => handleDecimalInput(e.target.value, setAdjustmentValue)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-400 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Descrição dos Ajustes / Sangria (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: R$ 50 para troco ou sangria de segurança"
              value={adjustmentDescription}
              onChange={(e) => {
                setIsSuggestionApplied(false);
                setAdjustmentDescription(e.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Observações Gerais */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6">
          <label className="text-sm font-black text-slate-200 uppercase tracking-wider block mb-3">Observações do Turno (Opcional)</label>
          <textarea
            rows={3}
            placeholder="Registre alguma divergência de valores, troca de operador, falta de moedas específicas ou avisos importantes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

      </form>

      {/* Rodapé Fixo (Sticky Footer) com Totais Calculados */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/85 backdrop-blur-lg border-t border-slate-800 py-4 px-4 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4 max-w-5xl mx-auto rounded-t-3xl">
        <div className="flex gap-4 md:gap-8 items-center overflow-x-auto w-full sm:w-auto">
          <div className="shrink-0">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Dinheiro Físico</span>
            <span className="text-sm font-mono font-bold text-slate-200">R$ {totalCash.toFixed(2)}</span>
          </div>
          <div className="shrink-0 border-l border-slate-800 pl-4">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Total Entradas</span>
            <span className="text-sm font-mono font-bold text-slate-200">R$ {totalEntries.toFixed(2)}</span>
          </div>
          <div className="shrink-0 border-l border-slate-800 pl-4">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Total Saídas</span>
            <span className="text-sm font-mono font-bold text-rose-400">R$ {totalExits.toFixed(2)}</span>
          </div>
          <div className="shrink-0 border-l border-slate-800 pl-4 bg-indigo-950/30 px-3 py-1 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider block">Saldo Final</span>
            <span className="text-base font-mono font-black text-indigo-200">R$ {totalFinal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSaveDraft}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-sm transition"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar Rascunho
          </button>
          
          <button
            type="button"
            disabled={submitting}
            onClick={() => setIsConfirmModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20"
          >
            <Send size={16} />
            Enviar Fechamento
          </button>
        </div>
      </footer>

      {/* Modal de Confirmação de Envio */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 bg-indigo-950 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-800">
              <Info size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-100">Enviar Fechamento?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Ao enviar, o status mudará para <strong className="text-slate-300">ENVIADO</strong> e você <strong className="text-rose-400">não poderá mais editar</strong> os valores. Gerentes e administradores serão notificados.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-sm transition"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmitClosing}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-indigo-600/10"
              >
                Confirmar Envio
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
