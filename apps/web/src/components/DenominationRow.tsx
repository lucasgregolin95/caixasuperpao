import React from 'react';

interface DenominationRowProps {
  label: string;
  denomination: number;
  quantity: number;
  onChange: (qty: number) => void;
  isBill?: boolean;
}

export const DenominationRow = ({
  label,
  denomination,
  quantity,
  onChange,
  isBill = false,
}: DenominationRowProps) => {
  const subtotal = quantity * denomination;

  const handleIncrement = () => {
    onChange(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) {
      onChange(0);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/30 transition-colors">
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full ${isBill ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-amber-500 shadow-sm shadow-amber-500/30'}`} />
        <div>
          <span className="font-bold text-slate-200">{label}</span>
          <span className="text-[9px] block text-slate-500 uppercase font-bold tracking-wider">{isBill ? 'Cédula' : 'Moeda'}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Controle touch-friendly */}
        <div className="flex items-center border border-slate-700 bg-slate-950 rounded-lg overflow-hidden h-9">
          <button
            type="button"
            onClick={handleDecrement}
            className="w-8 h-full flex items-center justify-center font-bold text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 select-none transition"
          >
            -
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={quantity === 0 ? '' : quantity}
            placeholder="0"
            onChange={handleInputChange}
            className="w-12 text-center bg-transparent border-none text-slate-100 font-semibold focus:ring-0 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleIncrement}
            className="w-8 h-full flex items-center justify-center font-bold text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 select-none transition"
          >
            +
          </button>
        </div>
        <div className="w-20 text-right">
          <span className="text-[10px] block text-slate-500 font-medium uppercase leading-tight">Subtotal</span>
          <span className="font-mono font-bold text-sm text-slate-200">R$ {subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
