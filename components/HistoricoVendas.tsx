import React, { useState } from 'react';
import { Calendar, DollarSign, ChevronDown, ShoppingBag, CreditCard, Banknote, QrCode, Filter, XCircle, CheckCircle2, Ban, AlertTriangle, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { useSales } from '../SalesContext';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { useConfig } from '../ConfigContext';

export default function HistoricoVendas() {
  const { sales, cancelSale } = useSales();
  const { config } = useConfig();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Estado do Filtro
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'canceled'>('all');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCancelSale = (id: string) => {
    if (window.confirm('Tem certeza que deseja CANCELAR esta venda manualmente?\n\nO status será alterado para Cancelado.')) {
        cancelSale(id);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
        case 'PIX': return <QrCode size={16} />;
        case 'DINHEIRO': return <Banknote size={16} />;
        case 'CRÉDITO': 
        case 'DÉBITO': return <CreditCard size={16} />;
        default: return <DollarSign size={16} />;
    }
  };

  const getMethodColor = (method: string, isCanceled: boolean) => {
    if (isCanceled) return 'text-slate-500 bg-slate-700/50 border-slate-600';
    
    // Cores SYSTEN PROG (Violeta/Ciano/Azul)
    const normalizedMethod = method.split(' ')[0]; // Pega apenas a primeira palavra (para lidar com "DINHEIRO (Troco...)")
    switch (normalizedMethod) {
        case 'PIX': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
        case 'DINHEIRO': return 'text-violet-400 bg-violet-400/10 border-violet-400/20';
        case 'CREDITO': 
        case 'CRÉDITO': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        case 'DEBITO': 
        case 'DÉBITO': return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
        default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  // Lógica de filtro corrigida
  const filteredSales = sales.filter(sale => {
    if (filterStatus === 'all') return true;
    return sale.status === filterStatus;
  });

  // --- FUNÇÃO EXPORTAR CSV (EXCEL) ---
  const exportToCSV = () => {
    if (filteredSales.length === 0) return alert("Sem dados para exportar.");

    // Cabeçalhos
    const headers = ["ID Venda", "Data", "Hora (Timestamp)", "Status", "Método Pagamento", "Itens", "Total (R$)"];

    // Linhas
    const rows = filteredSales.map(sale => {
        const itemsSummary = sale.items.map(i => `${i.quantity}x ${i.name}`).join(' | ');
        const totalFormatted = sale.total.toFixed(2).replace('.', ','); // Formato PT-BR para Excel
        
        return [
            sale.id,
            sale.date,
            new Date(sale.timestamp || 0).toLocaleTimeString(),
            sale.status === 'completed' ? 'Concluída' : 'Cancelada',
            sale.method,
            `"${itemsSummary}"`, // Aspas para evitar quebra no CSV
            totalFormatted
        ].join(';'); // Ponto e vírgula é o separador padrão do Excel no Brasil
    });

    // Monta o arquivo com BOM para UTF-8 funcionar no Excel
    const csvContent = "\uFEFF" + [headers.join(';'), ...rows].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vendas_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- FUNÇÃO EXPORTAR PDF ---
  const exportToPDF = () => {
    if (filteredSales.length === 0) return alert("Sem dados para exportar.");

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text(config.companyName, 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Relatório de Vendas - Filtro: ${filterStatus === 'all' ? 'Todas' : filterStatus}`, 14, 30);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 36);

    // Tabela
    const tableColumn = ["ID", "Data", "Status", "Método", "Total", "Resumo Itens"];
    const tableRows = filteredSales.map(sale => [
        sale.id,
        sale.date.split(' ')[0], // Apenas data
        sale.status === 'completed' ? 'Concluída' : 'Cancelada',
        sale.method,
        `R$ ${sale.total.toFixed(2)}`,
        sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [6, 182, 212] }, // Cyan-500
    });

    doc.save(`Relatorio_Vendas_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER E FILTROS */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white">Histórico de Vendas</h1>
                <p className="text-slate-400 mt-1">Consulte, gerencie e exporte as vendas realizadas.</p>
            </div>

            {/* BOTÕES DE EXPORTAÇÃO */}
            <div className="flex gap-2">
                <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95 text-sm border border-emerald-500/50"
                    title="Baixar Excel/CSV"
                >
                    <FileSpreadsheet size={18} />
                    CSV
                </button>
                <button 
                    onClick={exportToPDF}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-red-900/20 active:scale-95 text-sm border border-red-500/50"
                    title="Baixar PDF"
                >
                    <FileText size={18} />
                    PDF
                </button>
            </div>
        </div>
        
        {/* BARRA DE FILTROS */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700 w-fit shadow-lg">
            <button
                onClick={() => setFilterStatus('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    filterStatus === 'all' 
                    ? 'bg-slate-700 text-white shadow-sm border border-slate-600' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
            >
                <Filter size={16} />
                Todas
            </button>
            <button
                onClick={() => setFilterStatus('completed')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    filterStatus === 'completed' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm' 
                    : 'text-slate-400 hover:text-cyan-400'
                }`}
            >
                <CheckCircle2 size={16} />
                Concluídas
            </button>
            <button
                onClick={() => setFilterStatus('canceled')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    filterStatus === 'canceled' 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-sm' 
                    : 'text-slate-400 hover:text-red-400'
                }`}
            >
                <Ban size={16} />
                Canceladas
            </button>
        </div>
      </div>

      {/* LISTA DE VENDAS */}
      <div className="space-y-4">
        {filteredSales.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed animate-in fade-in zoom-in duration-300">
                <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
                <p>Nenhuma venda encontrada com este filtro.</p>
            </div>
        ) : (
            filteredSales.map((sale) => {
                const isCanceled = sale.status === 'canceled';
                
                return (
                  <div 
                    key={sale.id} 
                    className={`bg-slate-800 rounded-xl border transition-all duration-300 overflow-hidden ${
                        isCanceled 
                        ? 'border-red-900/30 bg-slate-900/50 opacity-80' 
                        : 'border-slate-700 hover:border-cyan-500/30 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-cyan-500/5'
                    } ${expandedId === sale.id ? 'ring-1 ring-cyan-500/30' : ''}`}
                  >
                    {/* Header da Venda (Clicável) */}
                    <div 
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-4 relative"
                        onClick={() => toggleExpand(sale.id)}
                    >
                        {/* Indicador lateral */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCanceled ? 'bg-red-500' : 'bg-cyan-500'}`} />

                        <div className="flex items-center gap-4 pl-2">
                            <div className={`p-3 rounded-lg border flex items-center justify-center shrink-0 ${
                                isCanceled 
                                ? 'bg-red-900/10 border-red-900/20 text-red-500' 
                                : 'bg-slate-900 border-slate-700 text-cyan-400'
                            }`}>
                                {isCanceled ? <Ban size={24} /> : <CheckCircle2 size={24} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className={`font-bold text-lg ${isCanceled ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-200'}`}>
                                        {sale.id}
                                    </p>
                                    {isCanceled && (
                                        <span className="text-[10px] uppercase font-bold bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                            <XCircle size={10} /> CANCELADO
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Calendar size={14} />
                                    {sale.date}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 w-full md:w-auto">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getMethodColor(sale.method, isCanceled)}`}>
                                {getMethodIcon(sale.method)}
                                {sale.method}
                            </div>
                            
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Total</p>
                                <p className={`font-bold text-xl ${
                                    isCanceled 
                                    ? 'text-red-500/60 line-through decoration-2 decoration-red-900' 
                                    : 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]'
                                }`}>
                                    {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>

                            <div className={`transition-transform duration-300 text-slate-500 ${expandedId === sale.id ? 'rotate-180' : ''}`}>
                                <ChevronDown size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Detalhes Expansíveis */}
                    {expandedId === sale.id && (
                        <div className="bg-slate-900/80 border-t border-slate-700 p-6 animate-in slide-in-from-top-2">
                            <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <ShoppingBag size={14}/> Itens do Pedido
                            </h4>
                            <div className="space-y-3 mb-6">
                                {sale.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-800 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold border ${
                                                isCanceled ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-700 text-violet-400 border-slate-600'
                                            }`}>
                                                {item.quantity}x
                                            </span>
                                            <span className={`font-medium ${isCanceled ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className={`font-mono ${isCanceled ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                                            {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Botão de Cancelar Venda (Só aparece se não estiver cancelada) */}
                            {!isCanceled && (
                                <div className="flex justify-end pt-4 border-t border-slate-700">
                                    <button 
                                        onClick={() => handleCancelSale(sale.id)}
                                        className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 rounded-lg transition-all text-sm font-bold"
                                    >
                                        <AlertTriangle size={16} />
                                        CANCELAR ESTA VENDA
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
                );
            })
        )}
      </div>
    </div>
  );
}