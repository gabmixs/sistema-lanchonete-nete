import React, { useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, X, Tags, AlertTriangle, AlertOctagon, Cpu } from 'lucide-react';
import { useProducts, Product } from '../ProductContext';

// --- TABELA INTELIGENTE DE NCMs ---
// Mapeia categorias para códigos fiscais
const NCM_PADRAO: Record<string, string> = {
  'Salgados Fritos': '19059090',
  'Assados': '19059090',
  'Esfirras': '19059090',
  'Empadão': '19059090',
  'Enroladinhos': '19059090',
  'Açaí': '21069090',
  'Bebidas': '22021000',
  'Água': '22011000',
  'Lanches': '21069090',
  'Combos': '21069090',
  'Doces': '17049020',
  'Outros': '00000000'
};

export default function Estoque() {
  const { products, categories, removeProduct, addProduct, editProduct, addCategory, removeCategory } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Estado do formulário
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    ncm: '',
    minStock: ''
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      removeProduct(id);
    }
  };

  // Abrir modal de novo produto
  const handleOpenNew = () => {
    setEditingId(null);
    setNewProduct({ name: '', price: '', stock: '', category: '', ncm: '', minStock: '5' });
    setIsModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      ncm: product.ncm || NCM_PADRAO[product.category] || '',
      minStock: (product.minStock || 5).toString()
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) return alert('Preencha os campos obrigatórios!');

    const productData = {
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
      minStock: parseInt(newProduct.minStock) || 5,
      ncm: newProduct.ncm || '00000000'
    };

    if (editingId) {
      editProduct(editingId, productData);
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
        addCategory(newCategoryName.trim());
        setNewCategoryName('');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* HEADER & BUSCA */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
         <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         <div className="flex gap-2">
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors border border-slate-700 hover:border-violet-500/50"
            >
              <Tags size={20} className="text-violet-400" />
              Categorias
            </button>
            <button 
              onClick={handleOpenNew}
              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Plus size={20} />
              Novo Produto
            </button>
         </div>
      </div>

      {/* TABELA DE PRODUTOS */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="p-4">Produto</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">NCM</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Estoque</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredProducts.map((product) => {
                 const minStockLimit = product.minStock || 10; 
                 const isLowStock = product.stock <= minStockLimit;
                 
                 return (
                  <tr key={product.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-4 font-medium text-slate-200 flex items-center gap-3">
                        <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-cyan-400 opacity-70 group-hover:opacity-100 group-hover:border-cyan-500/50 transition-all">
                            {product.category === 'Bebidas' || product.category === 'Água' ? <Package size={18} /> : <Cpu size={18} />}
                        </div>
                        {product.name}
                    </td>
                    <td className="p-4">
                        <span className="bg-slate-900 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700 font-medium font-mono">
                            {product.category}
                        </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm font-mono tracking-wide">
                        {product.ncm || '---'}
                    </td>
                    <td className="p-4 font-bold text-white">
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-4">
                         {isLowStock ? (
                            <div className="flex items-center gap-2 text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded-lg w-fit border border-red-400/20 animate-pulse" title={`Abaixo do mínimo (${minStockLimit})`}>
                              <AlertTriangle size={14} />
                              {product.stock} un
                            </div>
                          ) : (
                            <span className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded text-xs font-bold border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                                {product.stock} un
                            </span>
                          )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(product)} className="p-2 hover:bg-violet-500/10 rounded text-slate-400 hover:text-violet-400 transition-colors">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
            )})}
            {filteredProducts.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                        Nenhum produto encontrado.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE PRODUTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                  {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* NOME */}
              <div>
                  <label className="block text-slate-400 text-xs mb-1 font-bold uppercase">Nome do Produto</label>
                  <input 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="Ex: Módulo de Autenticação"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* PREÇO */}
                <div>
                     <label className="block text-slate-400 text-xs mb-1 font-bold uppercase">Preço (R$)</label>
                    <input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="0.00" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                {/* ESTOQUE */}
                <div>
                    <label className="block text-slate-400 text-xs mb-1 font-bold uppercase">Estoque Atual</label>
                    <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                </div>
              </div>

              {/* CATEGORIA */}
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-bold uppercase">Categoria (Define o NCM)</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer appearance-none"
                  value={newProduct.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    // Lógica Automática: Preenche NCM baseado no mapa
                    setNewProduct({ ...newProduct, category: cat, ncm: NCM_PADRAO[cat] || '' });
                  }}
                >
                  <option value="">Selecione a categoria...</option>
                  {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  {/* NCM */}
                  <div>
                    <label className="block text-slate-400 text-xs mb-1 font-bold uppercase flex justify-between">
                      <span>NCM</span> <span className="text-cyan-400 text-[10px] flex items-center gap-1" title="Preenchido Automaticamente"><Cpu size={10}/> Auto</span>
                    </label>
                    <input 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-cyan-200 font-mono outline-none focus:border-cyan-500 transition-colors" 
                        value={newProduct.ncm} 
                        onChange={e => setNewProduct({...newProduct, ncm: e.target.value})}
                        placeholder="00000000"
                    />
                  </div>
                   {/* ESTOQUE MÍNIMO */}
                   <div>
                    <label className="block text-slate-400 text-xs mb-1 font-bold uppercase flex items-center gap-1">
                      Mínimo <AlertOctagon size={12}/>
                    </label>
                    <input 
                        type="number"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500 transition-colors" 
                        value={newProduct.minStock} 
                        onChange={e => setNewProduct({...newProduct, minStock: e.target.value})}
                        placeholder="5"
                    />
                  </div>
              </div>

              <button onClick={handleSaveProduct} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl mt-2 transition-all shadow-lg shadow-violet-900/20 active:scale-95 border border-white/5">
                {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GERENCIAR CATEGORIAS */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm shadow-2xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                 <Tags size={20} className="text-violet-400" /> Categorias
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
                <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto">
                    {categories.map(cat => (
                        <div key={cat} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-violet-500/30 transition-colors">
                            <span className="text-slate-200">{cat}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-1 rounded">
                                    {NCM_PADRAO[cat] || 'N/A'}
                                </span>
                                <button onClick={() => removeCategory(cat)} className="text-slate-500 hover:text-red-400 p-1">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleAddCategory} className="flex gap-2 border-t border-slate-800 pt-4">
                    <input 
                        type="text" 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nova categoria..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none text-sm"
                    />
                    <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-lg transition-colors">
                        <Plus size={20} />
                    </button>
                </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}