import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from './ConfigContext';
import { ProductProvider } from './ProductContext';
import { SalesProvider } from './SalesContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PDV from './components/PDV';
import HistoricoVendas from './components/HistoricoVendas';
import RelatorioDia from './components/RelatorioDia';
import Estoque from './components/Estoque';
import Usuarios from './components/Usuarios';
import Configuracoes from './components/Configuracoes';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <ConfigProvider>
      <ProductProvider>
        <SalesProvider>
          <HashRouter>
            <div className="min-h-screen bg-slate-900 text-slate-50 flex font-sans">
              {!isLoggedIn ? (
                <Login onLogin={handleLogin} />
              ) : (
                <>
                  <Sidebar onLogout={handleLogout} />
                  <main className="flex-1 p-6 overflow-auto h-screen">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/pdv" element={<PDV />} />
                      <Route path="/relatorios" element={<RelatorioDia />} />
                      <Route path="/historico" element={<HistoricoVendas />} />
                      <Route path="/estoque" element={<Estoque />} />
                      <Route path="/usuarios" element={<Usuarios />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </>
              )}
            </div>
          </HashRouter>
        </SalesProvider>
      </ProductProvider>
    </ConfigProvider>
  );
}