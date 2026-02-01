import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, LogOut, Code2, History, Users, Settings, Terminal, Cpu, FileText } from 'lucide-react';
import { useConfig } from '../ConfigContext';

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  // Nota: O nome da empresa vem do contexto, mas para este rebranding forçaremos visualmente o título SYSTEN PROG
  // Se desejar alterar no contexto global, deve-se atualizar o ConfigContext também.
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pdv', label: 'PDV', icon: ShoppingCart },
    { path: '/relatorios', label: 'Relatórios', icon: FileText },
    { path: '/historico', label: 'Histórico', icon: History },
    { path: '/estoque', label: 'Estoque', icon: Package },
    { path: '/usuarios', label: 'Usuários', icon: Users },
    { path: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen relative overflow-hidden">
      {/* Efeito de brilho de fundo (Cyberpunk Glow) */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-violet-900/10 via-slate-900 to-cyan-900/10 pointer-events-none" />

      <div className="p-6 flex items-center gap-3 border-b border-slate-800 relative z-10">
        <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-2.5 rounded-xl text-white shadow-lg shadow-violet-500/20 shrink-0">
          <Code2 size={24} strokeWidth={2.5} />
        </div>
        <div className="overflow-hidden">
          <h2 className="font-bold text-lg leading-tight truncate text-slate-100 tracking-wide">SYSTEN PROG</h2>
          <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold tracking-widest uppercase mt-0.5">
            <Terminal size={10} />
            DEV MANAGER
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto relative z-10">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'text-cyan-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Fundo Gradiente Ativo */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-cyan-500/10 border border-cyan-500/20 rounded-xl" />
                )}
                
                {/* Ícone */}
                <div className={`relative z-10 transition-colors ${isActive ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'group-hover:text-violet-400'}`}>
                  <item.icon size={20} />
                </div>
                
                {/* Texto */}
                <span className="relative z-10">{item.label}</span>

                {/* Indicador lateral ativo */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-cyan-500 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 relative z-10">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-colors group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}