import React, { useMemo, useState, useEffect } from 'react';
import { FileText, Save, Calendar, DollarSign, ShoppingBag, TrendingUp, PieChart, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useSales } from '../SalesContext';

interface SavedReport {
  id: number;
  date: string;
  timestamp: number;
  summary: {
    totalSales: number;
    totalOrders: number;
    avgTicket: number;
  };
  categories: { name: string; quantity: number; total: number }[];
}

export default function RelatorioDia() {
  const { sales } = useSales();
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // Carregar relatórios salvos ao montar
  useEffect(() => {
    const stored = localStorage.getItem('app_daily_reports');
    if (stored) {
      setSavedReports(JSON.parse(stored));
    }
  }, []);

  // --- CÁLCULO DOS DADOS EM TEMPO REAL (HOJE) ---
  const todayStats = useMemo(() => {
    const now = new Date();
    // Normalizar datas para comparação apenas dia/mês/ano
    const todayString = now.toLocaleDateString();
    
    // Filtrar apenas vendas concluídas DE HOJE
    const todaysSales = sales.filter(s => {
        if (s.status !== 'completed') return false;
        
        // Verifica timestamp se existir, ou data string fallback
        if (s.timestamp) {
            return new Date(s.timestamp).toLocaleDateString() === todayString;
        }
        // Fallback para string antiga
        return s.date.includes(todayString);
    });

    const totalSales = todaysSales.reduce((acc, s) => acc + s.total, 0);
    const totalOrders = todaysSales.length;
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Agrupamento por Categoria
    const categoryMap: Record<string, { quantity: number; total: number }> = {};
    
    todaysSales.forEach(sale => {
        sale.items.forEach(item => {
            const cat = item.category || 'Outros';
            if (!categoryMap[cat]) {
                categoryMap[cat] = { quantity: 0, total: 0 };
            }
            categoryMap[cat].quantity += item.quantity;
            categoryMap[cat].total += (item.price * item.quantity);
        });
    });

    const categories = Object.keys(categoryMap).map(key => ({
        name: key,
        quantity: categoryMap[key].quantity,
        total: categoryMap[key].total
    })).sort((a, b) => b.total - a.total); // Ordenar por valor total desc

    return {
        totalSales,
        totalOrders,
        avgTicket,
        categories,
        dateString: todayString
    };
  }, [sales]);

  // --- SALVAR RELATÓRIO ---
  const handleSaveReport = () => {
    if (todayStats.totalOrders === 0) {
        alert("Não há vendas hoje para gerar um relatório.");
        return;
    }

    if (window.confirm("Deseja fechar o caixa e salvar o relatório de hoje?")) {
        const newReport: SavedReport = {
            id: Date.now(),
            date: todayStats.dateString,
            timestamp: Date.now(),
            summary: {
                totalSales: todayStats.totalSales,
                totalOrders: todayStats.totalOrders,
                avgTicket: todayStats.avgTicket
            },
            categories: todayStats.categories
        };

        const updatedReports = [newReport, ...savedReports];
        setSavedReports(updatedReports);
        localStorage.setItem('app_daily_reports', JSON.stringify(updatedReports));
        alert("Relatório salvo com sucesso!");
    }
  };

  const handleDeleteReport = (id: number) => {
      if(window.confirm("Excluir este relatório salvo?")) {
          const updated = savedReports.filter(r => r.id !== id);
          setSavedReports(updated);
          localStorage.setItem('app_daily_reports', JSON.stringify(updated));
      }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
             <FileText className="text-cyan-400" /> Relatório Diário
          </h1>
          <p className="text-slate-400 mt-1">Visão detalhada das vendas do dia e fechamento de caixa.</p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-slate-300 font-mono text-sm shadow-sm">
             <Calendar size={16} className="text-violet-400" />
             {todayStats.dateString}
        </div>
      </div>

      {/* --- SEÇÃO: DADOS DE HOJE (AO VIVO) --- */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
               <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20 animate-pulse">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Ao Vivo
               </span>
          </div>

          <div className="p-6 border-b border-slate-700 bg-slate-900/50">
             <h2 className="text-xl font-bold text-white">Vendas de Hoje</h2>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* KPIs */}
              <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400">
                          <DollarSign size={24} />
                      </div>
                      <div>
                          <p className="text-slate-400 text-xs uppercase font-bold">Faturamento Total</p>
                          <p className="text-2xl font-bold text-white">
                              {todayStats.totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                        <div className="text-violet-400 mb-2"><ShoppingBag size={20}/></div>
                        <p className="text-slate-400 text-xs uppercase font-bold">Pedidos</p>
                        <p className="text-xl font-bold text-white">{todayStats.totalOrders}</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                        <div className="text-blue-400 mb-2"><TrendingUp size={20}/></div>
                        <p className="text-slate-400 text-xs uppercase font-bold">Ticket Médio</p>
                        <p className="text-xl font-bold text-white">
                            {todayStats.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveReport}
                    className="w-full mt-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 border border-white/10"
                  >
                      <Save size={18} /> FECHAR CAIXA E SALVAR
                  </button>
              </div>

              {/* TABELA DE CATEGORIAS */}
              <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                      <PieChart size={18} className="text-slate-400" />
                      <h3 className="font-bold text-slate-200">Desempenho por Categoria</h3>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-800 text-slate-400 font-bold">
                              <tr>
                                  <th className="p-3 pl-4">Categoria</th>
                                  <th className="p-3 text-center">Qtd. Vendida</th>
                                  <th className="p-3 text-right pr-4">Total (R$)</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                              {todayStats.categories.length === 0 ? (
                                  <tr>
                                      <td colSpan={3} className="p-8 text-center text-slate-500">Nenhuma venda registrada hoje.</td>
                                  </tr>
                              ) : (
                                  todayStats.categories.map((cat, idx) => (
                                      <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                                          <td className="p-3 pl-4 font-medium text-slate-300">{cat.name}</td>
                                          <td className="p-3 text-center text-slate-400">{cat.quantity}</td>
                                          <td className="p-3 text-right pr-4 font-mono text-cyan-400">
                                              {cat.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      </div>

      {/* --- SEÇÃO: HISTÓRICO DE RELATÓRIOS SALVOS --- */}
      <div className="pt-8">
           <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
               <Clock size={20} className="text-slate-400" /> Histórico de Fechamentos
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
               {savedReports.length === 0 ? (
                   <div className="col-span-full p-8 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed text-center text-slate-500">
                       Nenhum relatório salvo no histórico.
                   </div>
               ) : (
                   savedReports.map(report => (
                       <div key={report.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-violet-500/30 transition-all group">
                           <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-700">
                               <div>
                                   <div className="flex items-center gap-2 text-slate-200 font-bold">
                                       <Calendar size={14} className="text-violet-400" />
                                       {report.date}
                                   </div>
                                   <p className="text-xs text-slate-500 mt-1">Salvo às {new Date(report.timestamp).toLocaleTimeString()}</p>
                               </div>
                               <button onClick={() => handleDeleteReport(report.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                                   <Trash2 size={16} />
                               </button>
                           </div>

                           <div className="grid grid-cols-2 gap-y-2 mb-4">
                               <div>
                                   <p className="text-[10px] text-slate-500 uppercase font-bold">Vendas</p>
                                   <p className="text-lg font-bold text-white">{report.summary.totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                                <div>
                                   <p className="text-[10px] text-slate-500 uppercase font-bold">Ticket Médio</p>
                                   <p className="text-sm font-bold text-slate-300">{report.summary.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                           </div>

                           <div className="space-y-1">
                               <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Top Categorias</p>
                               {report.categories.slice(0, 3).map((cat, i) => (
                                   <div key={i} className="flex justify-between text-xs">
                                       <span className="text-slate-400">{cat.name}</span>
                                       <span className="text-slate-200">{cat.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                   </div>
                               ))}
                           </div>
                       </div>
                   ))
               )}
           </div>
      </div>

    </div>
  );
}