import React, { useState } from 'react';
import { Users, UserPlus, Search, Edit, Trash2, Shield, User, CheckCircle, XCircle } from 'lucide-react';

// Mock Data
const initialUsers = [
  { id: 1, name: 'Gabriel Admin', username: 'admin', role: 'Administrador', status: 'active', lastLogin: 'Hoje, 09:00' },
];

export default function Usuarios() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrador': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Gerente': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Gerenciar Usuários</h1>
          <p className="text-slate-400 mt-1">Controle de acesso e permissões do sistema</p>
        </div>
        
        <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
          <UserPlus size={20} />
          Novo Usuário
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-slate-800 p-4 rounded-xl flex items-center gap-2 border border-slate-700 transition-colors focus-within:border-emerald-500/50">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou usuário..." 
          className="bg-transparent text-slate-50 outline-none w-full placeholder-slate-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTA */}
      <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-4 font-semibold">Usuário</th>
                <th className="p-4 font-semibold">Login</th>
                <th className="p-4 font-semibold">Função</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Último Acesso</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 font-bold border border-slate-600">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{user.name}</div>
                        {user.role === 'Administrador' && <span className="text-[10px] text-purple-400 flex items-center gap-1"><Shield size={10}/> Admin</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-sm">@{user.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center gap-2 text-sm font-medium ${user.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {user.status === 'active' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {user.lastLogin}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors" title="Editar">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Remover">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Users size={48} className="mb-3 opacity-20" />
            <p>Nenhum usuário encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}