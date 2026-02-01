import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, ShoppingBag, Users, AlertCircle, Calendar, Package } from 'lucide-react';
import { useSales } from '../SalesContext';

export default function Dashboard() {
  const { sales } = useSales();

  // --- CÁLCULOS ESTATÍSTICOS ---
  const kpiData = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // Filtra apenas vendas concluídas
    const completedSales = sales.filter(s => s.status === 'completed');
    
    // Vendas de hoje (comparando timestamps ou string de data caso timestamp não exista em dados legados)
    const salesToday = completedSales.filter(s => {
       if (s.timestamp) return s.timestamp >= todayStart;
       // Fallback para dados antigos sem timestamp
       const saleDate = new Date(s.date.split(',')[0].split('/').reverse().join('-')); // Tenta parsear dd/mm/yyyy
       return saleDate.getTime() >= todayStart;
    });

    const totalValueToday = salesToday.reduce((acc, s) => acc + s.total, 0);
    const totalOrdersToday = salesToday.length;
    
    // Ticket Médio Geral (de todas as vendas)
    const totalValueAllTime = completedSales.reduce((acc, s) => acc + s.total, 0);
    const avgTicket = completedSales.length > 0 ? totalValueAllTime / completedSales.length : 0;

    // Clientes (Assumindo 1 pedido = 1 cliente único por simplicidade no momento)
    const clientsToday = totalOrdersToday; 

    return {
      salesToday: totalValueToday,
      ordersToday: totalOrdersToday,
      avgTicket: avgTicket,
      clientsToday: clientsToday
    };
  }, [sales]);

  // --- DADOS PARA GRÁFICO DE BARRAS (ÚLTIMOS 7 DIAS) ---
  const weeklyData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const data = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = dayStart + 86400000; // +24h

        // Soma vendas deste dia
        const dailyTotal = sales
            .filter(s => s.status === 'completed' && s.timestamp && s.timestamp >= dayStart && s.timestamp < dayEnd)
            .reduce((acc, s) => acc + s.total, 0);

        data.push({
            day: days[d.getDay()],
            vendas: dailyTotal
        });
    }
    return data;
  }, [sales]);

  // --- DADOS PARA GRÁFICO DE PIZZA (MIX DE PRODUTOS) ---
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    
    sales.forEach(sale => {
        if (sale.status === 'completed') {
            sale.items.forEach(item => {
                // Se o item tiver categoria salva (novas vendas), usa ela. Se não, agrupa em 'Outros'
                const cat = item.category || 'Outros';
                categories[cat] = (categories[cat] || 0) + item.quantity;
            });
        }
    });

    const data = Object.keys(categories).map(key => ({
        name: key,
        value: categories[key]
    }));

    // Cores Tech/Cyberpunk para o gráfico
    const COLORS = ['#22d3ee', '#8b5cf6', '#3b82f6', '#f472b6', '#a78bfa', '#06b6d4'];
    
    // Adiciona cores aos dados
    return data.map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }));

  }, [sales]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold text-white">Visão Geral</h1>
         <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            <Calendar size={14} />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
         </div>
      </div>
      
      {/* Cards de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Vendas Hoje', 
            value: kpiData.salesToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 
            icon: DollarSign, 
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10'
          },
          { 
            label: 'Pedidos Hoje', 
            value: kpiData.ordersToday, 
            icon: ShoppingBag, 
            color: 'text-violet-400',
            bg: 'bg-violet-500/10'
          },
          { 
            label: 'Ticket Médio', 
            value: kpiData.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 
            icon: TrendingUp, 
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
          },
          { 
            label: 'Clientes Hoje', 
            value: kpiData.clientsToday, 
            icon: Users, 
            color: 'text-purple-400',
            bg: 'bg-purple-500/10'
          },
        ].map((card, i) => (
          <div key={i} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-slate-600 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={card.color} size={24} />
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{card.label}</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Barras - Vendas Semanais */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
          {/* Fundo glow sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          
          <h3 className="font-bold text-lg mb-6 w-full text-left flex items-center gap-2 text-slate-200">
            <TrendingUp size={18} className="text-cyan-400"/>
            Vendas da Semana
          </h3>
          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }} 
                />
                <YAxis 
                  stroke="#64748b" 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `R$${val}`}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip 
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#22d3ee' }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                />
                <Bar 
                  dataKey="vendas" 
                  fill="#22d3ee" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza - Mix de Produtos */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col relative overflow-hidden">
           {/* Fundo glow sutil */}
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-200">
            <Package size={18} className="text-violet-400"/>
            Mix de Produtos
          </h3>
          
          {categoryData.length === 0 ? (
             <div className="h-80 w-full flex flex-col items-center justify-center opacity-50 relative z-10">
                <AlertCircle className="text-slate-500 mb-2" size={32} />
                <p className="text-slate-500 text-sm">Sem dados de categorias</p>
             </div>
          ) : (
            <div className="h-80 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    </Pie>
                    <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                    />
                </PieChart>
                </ResponsiveContainer>
                
                {/* Legenda Customizada */}
                <div className="flex flex-wrap gap-2 justify-center mt-[-20px]">
                    {categoryData.slice(0, 4).map((cat, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/50 px-2 py-1 rounded border border-slate-700">
                            <span className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: cat.color, color: cat.color }}></span>
                            {cat.name}
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}