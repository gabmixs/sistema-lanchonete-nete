import React, { useState, useEffect } from 'react';
import { Save, Building, FileText, MapPin, Settings, Moon, Sun, Palette, Check } from 'lucide-react';
import { useConfig } from '../ConfigContext';

export default function Configuracoes() {
  const { config, updateConfig } = useConfig();
  const [formData, setFormData] = useState(config);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- LÓGICA DO TEMA ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // 1. Verifica localStorage
    const savedTheme = localStorage.getItem('systen_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    
    // 2. Verifica preferência do sistema se não houver salvo
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark'; // Padrão da aplicação atual
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove classes antigas para garantir limpeza
    root.classList.remove('light', 'dark');
    // Adiciona a classe do tema atual
    root.classList.add(theme);
    // Persiste a escolha
    localStorage.setItem('systen_theme', theme);
  }, [theme]);

  // --- LÓGICA DO FORMULÁRIO DE DADOS ---
  // Sincroniza form se config mudar externamente
  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    
    // Feedback visual
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Configurações do Sistema</h1>
          <p className="text-slate-400 mt-1">Personalize os dados e a aparência do sistema</p>
        </div>
      </div>

      {/* --- SEÇÃO 1: DADOS DA EMPRESA --- */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
            <Settings size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Dados da Empresa</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nome da Empresa */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Building size={16} /> Nome Fantasia
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600"
                placeholder="Ex: SYSTEN PROG"
              />
              <p className="text-xs text-slate-500">Este nome aparecerá na tela de login e no menu lateral.</p>
            </div>

            {/* CNPJ */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <FileText size={16} /> CNPJ
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600"
                placeholder="00.000.000/0000-00"
              />
              <p className="text-xs text-slate-500">Utilizado no rodapé do Cupom Fiscal.</p>
            </div>

            {/* Endereço */}
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <MapPin size={16} /> Endereço Completo
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600"
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
              <p className="text-xs text-slate-500">Utilizado no cabeçalho do Cupom Fiscal.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 flex items-center justify-end gap-4">
            {showSuccess && (
              <span className="text-cyan-400 text-sm font-medium animate-pulse flex items-center gap-2">
                <Check size={16} /> Configurações salvas!
              </span>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 border border-white/5"
            >
              <Save size={20} />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      {/* --- SEÇÃO 2: APARÊNCIA --- */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
            <Palette size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Aparência</h2>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-400 mb-6">Escolha o tema de sua preferência para utilizar no sistema.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* CARD: MODO ESCURO */}
            <button
              onClick={() => setTheme('dark')}
              className={`relative group transition-all duration-300 rounded-xl text-left ${
                theme === 'dark' 
                  ? 'p-[1px] bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20' 
                  : 'p-[1px] bg-transparent border border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="bg-slate-900 rounded-[11px] p-4 h-full flex items-center gap-4">
                <div className={`p-3 rounded-full transition-colors ${theme === 'dark' ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Moon size={24} fill={theme === 'dark' ? "currentColor" : "none"} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Modo Escuro</h3>
                  <p className="text-xs text-slate-500">Visual imersivo "Cyberpunk", ideal para ambientes com pouca luz.</p>
                </div>
                {theme === 'dark' && (
                  <div className="text-cyan-400 animate-in zoom-in duration-300">
                    <Check size={24} />
                  </div>
                )}
              </div>
            </button>

            {/* CARD: MODO CLARO */}
            <button
              onClick={() => setTheme('light')}
              className={`relative group transition-all duration-300 rounded-xl text-left ${
                theme === 'light' 
                  ? 'p-[1px] bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-cyan-500/20' 
                  : 'p-[1px] bg-transparent border border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="bg-slate-900 rounded-[11px] p-4 h-full flex items-center gap-4">
                <div className={`p-3 rounded-full transition-colors ${theme === 'light' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Sun size={24} fill={theme === 'light' ? "currentColor" : "none"} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${theme === 'light' ? 'text-white' : 'text-slate-400'}`}>Modo Claro</h3>
                  <p className="text-xs text-slate-500">Visual limpo e com alto contraste para ambientes iluminados.</p>
                </div>
                {theme === 'light' && (
                  <div className="text-violet-500 animate-in zoom-in duration-300">
                     <Check size={24} />
                  </div>
                )}
              </div>
            </button>

          </div>
          
          <div className="mt-6 flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
             <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse mt-1.5 shrink-0"></div>
             <p className="text-xs text-slate-500 leading-relaxed">
               Nota: O <strong>Modo Claro</strong> está sendo implementado gradualmente. Algumas telas podem apresentar inconsistências visuais até a próxima atualização do sistema.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}