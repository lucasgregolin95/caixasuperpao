export class PdfService {
  static generateClosingHtmlReport(closing: any): string {
    const formattedDate = new Date(closing.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const formattedCreated = new Date(closing.createdAt).toLocaleString('pt-BR');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fechamento de Caixa - Caixa ${closing.cashNumber} (${closing.shift}) - ${formattedDate}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body {
        background-color: white;
        color: black;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .print-shadow-none {
        box-shadow: none !important;
        border: none !important;
      }
    }
  </style>
</head>
<body class="bg-gray-50 text-gray-900 font-sans antialiased min-h-screen py-10 px-4">
  <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 print-shadow-none">
    
    <!-- Cabeçalho -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-6">
      <div>
        <h1 class="text-3xl font-black text-indigo-900 tracking-tight">Super Pão</h1>
        <p class="text-gray-500 font-medium">Controle de Fechamento de Caixa Diário</p>
      </div>
      <div class="mt-4 md:mt-0 text-left md:text-right">
        <span class="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
          closing.status === 'ENVIADO' 
            ? 'bg-emerald-100 text-emerald-800' 
            : 'bg-amber-100 text-amber-800'
        }">
          ${closing.status}
        </span>
        <p class="text-xs text-gray-400 mt-2">Emitido em: ${formattedCreated}</p>
      </div>
    </div>

    <!-- Metadados -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-50 p-5 rounded-xl border border-slate-100">
      <div>
        <p class="text-sm text-gray-500">Data de Referência</p>
        <p class="font-semibold text-slate-800">${formattedDate}</p>
        <p class="text-sm text-gray-500 mt-2">Turno / Caixa</p>
        <p class="font-semibold text-slate-800">${closing.shift} - Caixa ${closing.cashNumber}</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Operador Responsável</p>
        <p class="font-semibold text-slate-800">${closing.operator?.name || 'Não identificado'}</p>
        <p class="text-sm text-gray-500 mt-2">E-mail</p>
        <p class="font-semibold text-slate-800">${closing.operator?.email || 'N/A'}</p>
      </div>
    </div>

    <!-- Tabelas de Denominações -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <!-- Moedas -->
      <div>
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Detalhamento de Moedas</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase"><th class="pb-2">Moeda</th><th class="pb-2 text-center">Quantidade</th><th class="pb-2 text-right">Subtotal</th></tr>
            </thead>
            <tbody class="text-sm text-gray-600">
              <tr class="border-b border-gray-50"><td class="py-2">R$ 0,05</td><td class="py-2 text-center">${closing.coins005}</td><td class="py-2 text-right font-medium">R$ ${(closing.coins005 * 0.05).toFixed(2)}</td></tr>
              <tr class="border-b border-gray-50"><td class="py-2">R$ 0,10</td><td class="py-2 text-center">${closing.coins010}</td><td class="py-2 text-right font-medium">R$ ${(closing.coins010 * 0.10).toFixed(2)}</td></tr>
              <tr class="border-b border-gray-50"><td class="py-2">R$ 0,25</td><td class="py-2 text-center">${closing.coins025}</td><td class="py-2 text-right font-medium">R$ ${(closing.coins025 * 0.25).toFixed(2)}</td></tr>
              <tr class="border-b border-gray-50"><td class="py-2">R$ 0,50</td><td class="py-2 text-center">${closing.coins050}</td><td class="py-2 text-right font-medium">R$ ${(closing.coins050 * 0.50).toFixed(2)}</td></tr>
              <tr class="border-b border-gray-50"><td class="py-2">R$ 1,00</td><td class="py-2 text-center">${closing.coins100}</td><td class="py-2 text-right font-medium">R$ ${(closing.coins100 * 1.00).toFixed(2)}</td></tr>
              <tr class="font-bold text-indigo-900"><td class="py-3">Total Moedas</td><td class="py-3 text-center">-</td><td class="py-3 text-right">R$ ${Number(closing.totalCoins).toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Notas -->
      <div>
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Detalhamento de Notas</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase"><th class="pb-2">Nota</th><th class="pb-2 text-center">Quantidade</th><th class="pb-2 text-right">Subtotal</th></tr>
            </thead>
            <tbody class="text-sm text-gray-600">
              <tr class="border-b border-gray-50"><td class="py-2">R$ 2,00</td><td class="py-2 text-center">${closing.bills2}</td><td class="py-2 text-right font-medium">R$ ${(closing.bills2 * 2).toFixed(2)}</td></tr>
              <tr class="border-b border-gray-50"><td class="py-2">R$ 5,00</td><td class="py-2 text-center">${closing.bills5}</td><td class="py-2 text-right font-medium">R$ ${(closing.bills5 * 5).toFixed(2)}</td></tr>
              <tr class="border-b border-gray-50"><td class="py-2">R$ 10,00</td><td class="py-2 text-center">${closing.bills10}</td><td class="py-2 text-right font-medium">R$ ${(closing.bills10 * 10).toFixed(2)}</td></tr>
              <tr class="border-b border-gray-50"><td class="py-2">R$ 20,00</td><td class="py-2 text-center">${closing.bills20}</td><td class="py-2 text-right font-medium">R$ ${(closing.bills20 * 20).toFixed(2)}</td></tr>
              <tr class="border-b border-gray-50"><td class="py-2">R$ 50,00</td><td class="py-2 text-center">${closing.bills50}</td><td class="py-2 text-right font-medium">R$ ${(closing.bills50 * 50).toFixed(2)}</td></tr>
              <tr class="border-b border-gray-50"><td class="py-2">R$ 100,00</td><td class="py-2 text-center">${closing.bills100}</td><td class="py-2 text-right font-medium">R$ ${(closing.bills100 * 100).toFixed(2)}</td></tr>
              <tr class="font-bold text-indigo-900"><td class="py-3">Total Notas</td><td class="py-3 text-center">-</td><td class="py-3 text-right">R$ ${Number(closing.totalBills).toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Outros Lançamentos -->
    <div class="mb-8 border-t border-gray-100 pt-6">
      <h2 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Fluxo de Caixa Consolidado</h2>
      <div class="space-y-3">
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500">Dinheiro Físico em Espécie (Moedas + Notas)</span>
          <span class="font-semibold text-gray-800">R$ ${Number(closing.totalCash).toFixed(2)}</span>
        </div>
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500">Recebimentos via PIX</span>
          <span class="font-semibold text-emerald-600">+ R$ ${Number(closing.pixValue).toFixed(2)}</span>
        </div>
        <div class="flex justify-between items-center text-sm">
          <div>
            <span class="text-gray-500">Recebimentos em Cartão</span>
            <span class="text-xs text-gray-400 ml-1">(Défito: R$ ${Number(closing.cardDebit).toFixed(2)} | Crédito: R$ ${Number(closing.cardCredit).toFixed(2)})</span>
          </div>
          <span class="font-semibold text-emerald-600">+ R$ ${Number(closing.cardTotal).toFixed(2)}</span>
        </div>
        <div class="flex justify-between items-center border-t border-gray-50 pt-2 text-sm font-bold text-gray-800">
          <span>Total de Entradas</span>
          <span>R$ ${Number(closing.totalEntries).toFixed(2)}</span>
        </div>
        
        <div class="flex justify-between items-center text-sm pt-2">
          <span class="text-gray-500">Retiradas / Sangrias</span>
          <span class="font-semibold text-rose-600">- R$ ${Number(closing.withdrawalValue).toFixed(2)}</span>
        </div>
        <div class="flex justify-between items-center text-sm">
          <div>
            <span class="text-gray-500">Passagens / Ajustes</span>
            ${closing.adjustmentDescription ? `<span class="text-xs text-gray-400 block">${closing.adjustmentDescription}</span>` : ''}
          </div>
          <span class="font-semibold text-rose-600">- R$ ${Number(closing.adjustmentValue).toFixed(2)}</span>
        </div>
        <div class="flex justify-between items-center border-t border-gray-50 pt-2 text-sm font-bold text-gray-800">
          <span>Total de Saídas</span>
          <span>R$ ${Number(closing.totalExits).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <!-- Saldo Final -->
    <div class="bg-indigo-950 text-white rounded-xl p-6 flex flex-col md:flex-row justify-between items-center mb-6">
      <div class="mb-2 md:mb-0 text-center md:text-left">
        <span class="text-xs text-indigo-200 font-bold uppercase tracking-wider">Saldo Líquido Operacional</span>
        <h3 class="text-xl font-bold text-indigo-100">TOTAL FINAL DO CAIXA</h3>
      </div>
      <div class="text-3xl font-black tracking-tight">
        R$ ${Number(closing.totalFinal).toFixed(2)}
      </div>
    </div>

    <!-- Observações -->
    ${closing.notes ? `
    <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 mb-8">
      <span class="font-bold block mb-1">Observações do Operador:</span>
      ${closing.notes}
    </div>` : ''}

    <!-- Rodapé de Ações -->
    <div class="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center no-print">
      <span class="text-xs text-gray-400 font-medium">Padaria Super Pão 24h - Sistema de Caixas</span>
      <div class="mt-4 md:mt-0 flex gap-3">
        <button onclick="window.print()" class="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-100 transition-colors">
          Imprimir Relatório / PDF
        </button>
      </div>
    </div>

  </div>
</body>
</html>`;
  }
}
