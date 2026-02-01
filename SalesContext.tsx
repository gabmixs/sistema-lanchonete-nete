import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SaleItem {
  name: string;
  quantity: number;
  price: number;
  category: string; // Adicionado para o gráfico de Mix de Produtos
}

export interface Sale {
  id: string;
  date: string; // Formato legível para exibição
  timestamp: number; // Formato numérico para cálculos e gráficos
  total: number;
  method: string;
  status: 'completed' | 'canceled';
  items: SaleItem[];
}

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Sale) => void;
  cancelSale: (id: string) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: React.PropsWithChildren<{}>) {
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('app_sales');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('app_sales', JSON.stringify(sales));
  }, [sales]);

  const addSale = (sale: Sale) => {
    setSales(prev => [sale, ...prev]);
  };

  const cancelSale = (id: string) => {
    setSales(prev => prev.map(sale => 
      sale.id === id ? { ...sale, status: 'canceled' } : sale
    ));
  };

  return (
    <SalesContext.Provider value={{ sales, addSale, cancelSale }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
}