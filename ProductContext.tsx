import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  minStock: number;
  ncm: string; // Novo campo fiscal
}

interface ProductContextType {
  products: Product[];
  categories: string[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  removeProduct: (id: number) => void;
  updateProductStock: (id: number, quantity: number) => void;
  editProduct: (id: number, updatedProduct: Omit<Product, 'id'>) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
}

// Novos Dados Iniciais com NCM e Açaí
const INITIAL_DATA: Product[] = [
  // SALGADOS (19059090)
  { id: 1, name: 'Coxinha de Frango', price: 6.00, category: 'Salgados Fritos', stock: 50, minStock: 10, ncm: '19059090' },
  { id: 2, name: 'Esfirra de Carne', price: 5.00, category: 'Esfirras', stock: 40, minStock: 10, ncm: '19059090' },
  { id: 3, name: 'Empadão de Frango', price: 7.00, category: 'Empadão', stock: 15, minStock: 5, ncm: '19059090' },
  
  // AÇAÍ (21069090)
  { id: 10, name: 'Açaí no Copo 300ml', price: 12.00, category: 'Açaí', stock: 20, minStock: 5, ncm: '21069090' },
  { id: 11, name: 'Açaí no Copo 400ml', price: 15.00, category: 'Açaí', stock: 20, minStock: 5, ncm: '21069090' },
  { id: 12, name: 'Açaí no Copo 500ml', price: 18.00, category: 'Açaí', stock: 20, minStock: 5, ncm: '21069090' },

  // BEBIDAS (Variados)
  { id: 20, name: 'Coca-Cola Lata 350ml', price: 6.00, category: 'Bebidas', stock: 100, minStock: 24, ncm: '22021000' },
  { id: 21, name: 'Água Mineral 500ml', price: 4.00, category: 'Água', stock: 50, minStock: 12, ncm: '22011000' },
];

// Categorias atualizadas para suportar a lógica fiscal
const INITIAL_CATEGORIES = [
  'Salgados Fritos', 
  'Assados', 
  'Esfirras', 
  'Empadão', 
  'Enroladinhos', 
  'Açaí', 
  'Bebidas', 
  'Água',
  'Combos', 
  'Doces'
];

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: React.PropsWithChildren<{}>) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('app_products');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('app_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('app_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('app_categories', JSON.stringify(categories));
  }, [categories]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts(prev => [...prev, newProduct]);
  };

  const removeProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProductStock = (id: number, quantity: number) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, stock: p.stock - quantity } : p
    ));
  };

  const editProduct = (id: number, updatedProduct: Omit<Product, 'id'>) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...updatedProduct, id } : p
    ));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const removeCategory = (category: string) => {
    const isUsed = products.some(p => p.category === category);
    if (isUsed) {
      alert(`Não é possível excluir a categoria "${category}" pois existem produtos vinculados a ela.`);
      return;
    }
    setCategories(prev => prev.filter(c => c !== category));
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      categories,
      addProduct, 
      removeProduct, 
      updateProductStock, 
      editProduct,
      addCategory,
      removeCategory
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}