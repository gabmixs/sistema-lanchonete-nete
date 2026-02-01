import React, { useState, useEffect, useRef } from 'react';
import { Lock, User, Terminal, Cpu } from 'lucide-react';
import { useConfig } from '../ConfigContext';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  // Nota: Embora useConfig traga o nome do contexto, para a tela de login forçaremos a identidade SYSTEN PROG
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsVisible(true);
    // Foco automático no usuário após a animação inicial
    setTimeout(() => {
        usernameRef.current?.focus();
    }, 800);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      onLogin();
    } else {
      setError('Credenciais inválidas. Tente novamente.');
      setPassword('');
      passwordRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: 'username' | 'password') => {
    if (e.key === 'Enter') {
      if (field === 'username') {
        e.preventDefault();
        passwordRef.current?.focus();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (field === 'password') {
        if (password.length > 0) {
            setPassword('');
        } else {
            usernameRef.current?.focus();
        }
      } else if (field === 'username') {
        setUsername('');
      }
    }
  };

  const getAnimClass = (delay: string) => 
    `transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${delay}`;

  return (
    <div className="flex items-center justify-center w-full h-screen bg-slate-950 relative overflow-hidden">
      {/* Fundo com Gradiente Sutil e Tech */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-900/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className={`relative z-10 w-full max-w-md p-8 bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex flex-col items-center mb-8">
          
          {/* Logo Icon Tech */}
          <div className={`w-20 h-20 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-violet-500/20 ${getAnimClass('delay-75')}`}>
            <Terminal size={40} strokeWidth={2} />
          </div>
          
          <h1 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 text-center tracking-wide ${getAnimClass('delay-100')}`}>
            SYSTEN PROG
          </h1>
          <div className={`flex items-center gap-2 mt-2 ${getAnimClass('delay-150')}`}>
            <Cpu size={14} className="text-cyan-500" />
            <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Acesso ao Sistema</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={getAnimClass('delay-200')}>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Usuário</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                <User size={18} />
              </div>
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'username')}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-50 placeholder-slate-600 transition-all"
                placeholder="Identificação de usuário"
              />
            </div>
          </div>

          <div className={getAnimClass('delay-300')}>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Senha</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'password')}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-50 placeholder-slate-600 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-pulse flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <div className={getAnimClass('delay-500')}>
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] border border-white/5"
            >
              ENTRAR
            </button>
          </div>
        </form>
        
        <div className={`mt-8 text-center ${getAnimClass('delay-700')}`}>
            <p className="text-[10px] text-slate-600">v2.0.0 • SYSTEN PROG TECHNOLOGIES</p>
        </div>
      </div>
    </div>
  );
}