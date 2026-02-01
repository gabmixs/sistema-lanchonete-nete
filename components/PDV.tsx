import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, CreditCard, Banknote, QrCode, Printer, CheckCircle, Package, ArrowLeft, Check, Search, Zap, Cpu, Trash2, XCircle, AlertCircle, Calculator, PauseCircle, Clock, Play, X, Loader2 } from 'lucide-react';
import { useConfig } from '../ConfigContext';
import { useProducts, Product } from '../ProductContext';
import { useSales } from '../SalesContext';

// --- TIPOS ---
interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

interface PendingSale {
  id: number;
  customerName: string;
  items: CartItem[];
  timestamp: number;
  total: number;
}

export default function PDV() {
  const { config } = useConfig();
  const { products, updateProductStock } = useProducts();
  const { addSale } = useSales();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderNumber, setOrderNumber] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false); // Estado para controle de loading da API
  
  // Venda Rápida
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Pagamento em Dinheiro e Troco
  const [amountPaid, setAmountPaid] = useState<string>('');
  const amountPaidInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADOS DE VENDA PENDENTE ---
  const [pendingSales, setPendingSales] = useState<PendingSale[]>(() => {
    const saved = localStorage.getItem('app_pending_sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Salvar pendentes no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('app_pending_sales', JSON.stringify(pendingSales));
  }, [pendingSales]);

  // Foca no input de venda rápida ao abrir
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Foca no input de dinheiro quando selecionado
  useEffect(() => {
    if (paymentMethod === 'DINHEIRO') {
        setTimeout(() => amountPaidInputRef.current?.focus(), 100);
    }
  }, [paymentMethod]);

  // Adicionar ao carrinho
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: Date.now(), product, quantity: 1 }];
    });
  };

  // Remover/Diminuir
  const removeFromCart = (productId: number) => {
    setCart(prev => prev.reduce((acc, item) => {
      if (item.product.id === productId) {
        if (item.quantity > 1) return [...acc, { ...item, quantity: item.quantity - 1 }];
        return acc;
      }
      return [...acc, item];
    }, [] as CartItem[]));
  };

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // --- CÁLCULO DO TROCO ---
  const paidValue = parseFloat(amountPaid.replace(',', '.')) || 0;
  const change = paidValue > total ? paidValue - total : 0;
  const isCashInsufficient = paymentMethod === 'DINHEIRO' && paidValue < total;

  // --- LÓGICA DE CANCELAMENTO ---
  const handleCancelCurrentSale = () => {
    if (cart.length === 0) return;
    
    if (window.confirm('ATENÇÃO: Deseja cancelar a venda atual?\n\nIsso limpará a tela e registrará o cancelamento no histórico.')) {
      
      const now = new Date();
      const newSaleId = `#${orderNumber.toString().padStart(4, '0')}`;
      
      addSale({
        id: newSaleId,
        date: now.toLocaleString(),
        timestamp: now.getTime(),
        total: total,
        method: paymentMethod || 'CANCELADO',
        status: 'canceled',
        items: cart.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          category: item.product.category
        }))
      });

      setOrderNumber(prev => prev + 1);
      
      // Resetar tudo
      setCart([]);
      setPaymentMethod('');
      setSearchTerm('');
      setAmountPaid('');
      
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  // --- LÓGICA DE SUSPENDER (PENDENTE) ---
  const handleParkSale = () => {
    if (cart.length === 0) return alert('Carrinho vazio!');

    const customerName = window.prompt('Nome do Cliente (Opcional):') || 'Cliente Balcão';
    
    const newPendingSale: PendingSale = {
        id: Date.now(),
        customerName,
        items: cart,
        timestamp: Date.now(),
        total: total
    };

    setPendingSales(prev => [newPendingSale, ...prev]);
    
    // Limpar tela atual
    setCart([]);
    setPaymentMethod('');
    setAmountPaid('');
    setSearchTerm('');
    
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // --- LÓGICA DE RECUPERAR VENDA ---
  const handleRestoreSale = (sale: PendingSale) => {
    if (cart.length > 0) {
        if (!window.confirm('Existe uma venda em andamento. Deseja substituí-la pela venda suspensa? (Os itens atuais serão perdidos)')) {
            return;
        }
    }

    setCart(sale.items);
    
    // Remove da lista de pendentes
    setPendingSales(prev => prev.filter(p => p.id !== sale.id));
    setShowPendingModal(false);
  };

  const handleDeletePending = (id: number) => {
      if (window.confirm('Excluir esta venda suspensa permanentemente?')) {
          setPendingSales(prev => prev.filter(p => p.id !== id));
      }
  };

  // Filtra produtos
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toString() === searchTerm
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length > 0) {
        const productToAdd = filteredProducts[0];
        addToCart(productToAdd);
        setSearchTerm('');
      }
    }
  };

  // ABRIR MODAL DE PRÉ-VENDA
  const handleFinalizeClick = () => {
    if (cart.length === 0) return alert('Carrinho vazio!');
    if (!paymentMethod) return alert('Selecione a forma de pagamento!');
    if (isCashInsufficient) return alert('Valor pago é menor que o total da venda!');
    
    setShowReceipt(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddMoreItems = () => {
    setShowReceipt(false);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // --- LÓGICA DE FINALIZAÇÃO (INTEGRAÇÃO BACKEND) ---
  const handleConfirmSale = async () => {
    if (isProcessing) return; // Evita duplo clique
    setIsProcessing(true);

    // --- 1. TENTATIVA DE EMISSÃO FISCAL (Backend Node.js) ---
    try {
        const payload = {
            total: total,
            items: cart.map(item => ({
                id: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                ncm: item.product.ncm // Envia o NCM se existir no contexto
            })),
            paymentMethod: paymentMethod
        };

        // Chama o servidor rodando na porta 3001
        const response = await fetch('http://localhost:3001/emitir-fiscal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Tenta ler o JSON
        const data = await response.json();

        if (data.success) {
            // SUCESSO: Mostra a nota (Corrigido para ler direto data.nfe_number)
            alert(`✅ NFC-e AUTORIZADA!\n\nNúmero: ${data.nfe_number}\n\nNota emitida com sucesso!`);
        } else {
            // ERRO DO BACKEND (Senha errada, certificado vencido, etc)
            alert(`⚠️ Atenção: O Servidor Fiscal retornou um erro.\n\nMsg: ${data.message}\n\nA venda será salva localmente.`);
        }

    } catch (error) {
        // ERRO DE CONEXÃO (Servidor desligado)
        console.error("Erro na emissão fiscal:", error);
        alert("⚠️ Servidor Fiscal não encontrado (Offline).\n\nA venda será registrada apenas no sistema local.");
    }

    // --- 2. BAIXA DE ESTOQUE E REGISTRO LOCAL (Sempre executa, mesmo se offline) ---
    
    // Baixar Estoque
    cart.forEach(item => {
      updateProductStock(item.product.id, item.quantity);
    });

    // Preparar dados extras do pagamento (Troco)
    let methodString = paymentMethod;
    if (paymentMethod === 'DINHEIRO') {
        methodString = `DINHEIRO (Troco: R$ ${change.toFixed(2)})`;
    }

    // Salvar no Histórico
    const now = new Date();
    const newSaleId = `#${orderNumber.toString().padStart(4, '0')}`;
    
    addSale({
      id: newSaleId,
      date: now.toLocaleString(),
      timestamp: now.getTime(),
      total: total,
      method: methodString,
      status: 'completed',
      items: cart.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        category: item.product.category
      }))
    });

    // Limpar e Resetar
    setOrderNumber(prev => prev + 1);
    setShowReceipt(false);
    setCart([]);
    setPaymentMethod('');
    setAmountPaid('');
    setIsProcessing(false);
    
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      
      {/* --- COLUNA ESQUERDA: CARRINHO --- */}
      <div className="w-full lg:w-1/3 bg-slate-800 rounded-xl flex flex-col shadow-2xl border border-slate-700 relative">
        <div className="p-4 border-b border-slate-700 bg-slate-850 rounded-t-xl flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <ShoppingCart size={20} />
                <h2 className="font-bold text-lg">Caixa Aberto</h2>
            </div>
            <p className="text-slate-400 text-sm">Operador: Gabriel Admin</p>
          </div>
          
          {/* BOTÃO ABRIR LISTA DE PENDENTES */}
          <button 
            onClick={() => setShowPendingModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold"
            title="Ver Vendas Suspensas"
          >
            <Clock size={16} />
            <span className="bg-amber-500/20 px-1.5 rounded text-amber-400">{pendingSales.length}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
              <Cpu size={48} className="mb-2" />
              <p>Aguardando itens...</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-700/30 p-3 rounded-lg border border-slate-600 animate-in fade-in slide-in-from-left-4 duration-200 hover:border-violet-500/30 transition-colors">
                <div>
                  <div className="text-white font-medium">{item.product.name}</div>
                  <div className="text-slate-400 text-sm">
                    {item.quantity}x R$ {item.product.price.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">R$ {(item.quantity * item.product.price).toFixed(2)}</span>
                  <div className="flex items-center gap-1 bg-slate-800 rounded p-1">
                    <button onClick={() => removeFromCart(item.product.id)} className="p-1 hover:text-red-400 text-slate-300 transition-colors"><Minus size={14} /></button>
                    <button onClick={() => addToCart(item.product)} className="p-1 hover:text-cyan-400 text-slate-300 transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-700 rounded-b-xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

          <div className="mb-4 relative z-10">
            <label className="text-slate-400 text-xs uppercase font-bold mb-2 block">Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO'].map((method) => (
                <button
                  key={method}
                  onClick={() => {
                    setPaymentMethod(method);
                    if (method !== 'DINHEIRO') setAmountPaid('');
                  }}
                  className={`p-2 rounded border text-xs font-bold flex items-center justify-center gap-2 transition-all
                    ${paymentMethod === method 
                      ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-cyan-400'}`}
                >
                  {method === 'PIX' && <QrCode size={14} />}
                  {method === 'DINHEIRO' && <Banknote size={14} />}
                  {(method === 'CREDITO' || method === 'DEBITO') && <CreditCard size={14} />}
                  {method}
                </button>
              ))}
            </div>

            {/* PAINEL DE DINHEIRO E TROCO */}
            {paymentMethod === 'DINHEIRO' && (
                <div className="mt-3 bg-slate-800 p-3 rounded-lg border border-slate-700 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Valor Entregue (R$)</label>
                            <input
                                ref={amountPaidInputRef}
                                type="number"
                                value={amountPaid}
                                onChange={e => setAmountPaid(e.target.value)}
                                className={`w-full bg-slate-900 border rounded-lg py-2 px-3 text-white outline-none font-mono text-lg transition-all ${isCashInsufficient && paidValue > 0 ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-cyan-500'}`}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="text-right min-w-[80px]">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Troco</span>
                            <span className={`text-xl font-bold font-mono ${change > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                R$ {change.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    {isCashInsufficient && paidValue > 0 && (
                        <p className="text-red-400 text-xs mt-2 flex items-center gap-1 font-bold animate-pulse">
                            <AlertCircle size={12}/> Valor insuficiente
                        </p>
                    )}
                </div>
            )}
          </div>

          <div className="flex justify-between items-end mb-4 relative z-10">
            <span className="text-slate-400">Total a Pagar</span>
            <span className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">R$ {total.toFixed(2)}</span>
          </div>

          <div className="flex gap-2 relative z-10">
            {/* Botão Cancelar */}
            <button 
              onClick={handleCancelCurrentSale}
              disabled={cart.length === 0}
              className="px-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="Cancelar Venda"
            >
              <Trash2 size={20} />
            </button>
            
            {/* Botão Suspender */}
             <button 
              onClick={handleParkSale}
              disabled={cart.length === 0}
              className="px-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="Suspender Venda (Atender outro cliente)"
            >
              <PauseCircle size={20} />
            </button>

            {/* Botão Finalizar */}
            <button 
              onClick={handleFinalizeClick}
              disabled={isCashInsufficient && paymentMethod === 'DINHEIRO'}
              className={`flex-1 font-bold py-4 rounded-lg text-lg transition-all flex items-center justify-center gap-2 border border-white/10
                ${isCashInsufficient && paymentMethod === 'DINHEIRO' 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed grayscale opacity-50' 
                    : 'bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 active:scale-95'
                }`}
            >
              <CheckCircle /> FINALIZAR
            </button>
          </div>
        </div>
      </div>

      {/* --- COLUNA DIREITA: PRODUTOS --- */}
      <div className="flex-1 bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col overflow-hidden">
        
        <div className="flex flex-col gap-4 mb-6 shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>
            Cardápio
            </h2>

            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-400 group-focus-within:text-violet-400 transition-colors">
                    <Zap size={20} className={searchTerm ? "animate-pulse" : ""} />
                </div>
                <input 
                    ref={searchInputRef}
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Venda Rápida: Digite nome ou código e tecle ENTER..."
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl pl-10 pr-4 py-4 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/10 transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">ENTER p/ Adicionar</span>
                </div>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
            {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                {searchTerm ? (
                      <>
                        <Search size={48} className="mb-2 opacity-50"/>
                        <p>Nenhum produto encontrado para "{searchTerm}".</p>
                      </>
                ) : (
                    <>
                        <Package size={48} className="mb-2 opacity-50"/>
                        <p>Nenhum produto cadastrado.</p>
                    </>
                )}
            </div>
            ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product, index) => (
                <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`bg-slate-700/50 hover:bg-slate-700 p-4 rounded-xl border border-slate-600 hover:border-cyan-500/50 transition-all group text-left flex flex-col justify-between min-h-[140px] relative overflow-hidden
                        ${index === 0 && searchTerm ? 'ring-2 ring-cyan-500 scale-[1.02] shadow-[0_0_15px_rgba(34,211,238,0.2)]' : ''}
                    `}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 to-cyan-500/0 group-hover:from-violet-600/10 group-hover:to-cyan-500/10 transition-all duration-300" />
                    
                    <div className="relative z-10">
                        <span className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1 block">{product.category}</span>
                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{product.name}</h3>
                    </div>
                    <div className="mt-4 flex justify-between items-end relative z-10">
                        <div>
                            <span className="text-slate-200 text-xl font-medium">R$ {product.price.toFixed(2)}</span>
                            <div className="text-[10px] text-slate-500">Estoque: {product.stock}</div>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${index === 0 && searchTerm ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white'}`}>
                            <Plus size={18} />
                        </div>
                    </div>
                </button>
                ))}
            </div>
            )}
        </div>
      </div>

      {/* --- MODAL DE VENDAS PENDENTES --- */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
               <div className="p-4 border-b border-slate-700 bg-slate-900 flex justify-between items-center">
                   <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                       <Clock size={20} /> Vendas Suspensas
                   </h3>
                   <button onClick={() => setShowPendingModal(false)} className="text-slate-400 hover:text-white">
                       <X size={20} />
                   </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                   {pendingSales.length === 0 ? (
                       <div className="text-center text-slate-500 py-8">
                           Nenhuma venda suspensa.
                       </div>
                   ) : (
                       pendingSales.map(sale => (
                           <div key={sale.id} className="bg-slate-700/50 border border-slate-600 p-4 rounded-lg flex justify-between items-center group hover:border-amber-500/50 transition-colors">
                               <div>
                                   <div className="text-white font-bold text-lg">{sale.customerName}</div>
                                   <div className="text-slate-400 text-xs flex items-center gap-2">
                                       <span>{new Date(sale.timestamp).toLocaleTimeString()}</span>
                                       <span>•</span>
                                       <span>{sale.items.reduce((acc, i) => acc + i.quantity, 0)} itens</span>
                                   </div>
                               </div>
                               
                               <div className="flex items-center gap-4">
                                   <span className="text-amber-400 font-bold text-xl">R$ {sale.total.toFixed(2)}</span>
                                   
                                   <div className="flex gap-2">
                                       <button 
                                        onClick={() => handleRestoreSale(sale)}
                                        className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors"
                                        title="Recuperar Venda"
                                       >
                                            <Play size={18} />
                                       </button>
                                       <button 
                                        onClick={() => handleDeletePending(sale.id)}
                                        className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                                        title="Descartar"
                                       >
                                            <Trash2 size={18} />
                                       </button>
                                   </div>
                               </div>
                           </div>
                       ))
                   )}
               </div>
           </div>
        </div>
      )}

      {/* --- MODAL DO CUPOM FISCAL --- */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          
          <div className="flex flex-col items-center gap-4">
            <div className="bg-cyan-500/10 text-cyan-400 px-6 py-2 rounded-full font-bold border border-cyan-500/20 flex items-center gap-2 animate-in slide-in-from-top-4 no-print shadow-[0_0_15px_rgba(34,211,238,0.2)]">
               <CheckCircle size={20} /> Venda Processada! Imprima ou Adicione mais itens.
            </div>

            <div 
              id="cupom-fiscal" 
              className="bg-white text-black w-[80mm] shadow-2xl overflow-hidden rounded-sm font-mono text-sm relative animate-in zoom-in duration-300 pb-4"
            >
              <div className="p-4 flex flex-col items-center text-center">
                <h3 className="font-bold text-xl mb-1 uppercase">{config.companyName}</h3>
                <p className="text-xs">CNPJ: {config.cnpj}</p>
                <p className="text-xs mb-2">{config.address}</p>
                <div className="w-full border-b border-dashed border-black my-2"></div>
                <p className="font-bold mb-2">RECIBO DE VENDA</p>
                <p className="text-[10px] font-bold mb-2">*** DOCUMENTO NÃO FISCAL ***</p>
                <div className="w-full text-left space-y-1 mb-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="truncate pr-2">{item.quantity}x {item.product.name}</span>
                      <span className="whitespace-nowrap">{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="w-full border-b border-dashed border-black my-2"></div>
                
                <div className="w-full flex justify-between font-bold text-lg">
                  <span>TOTAL</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>

                {/* INFO DE TROCO NO CUPOM */}
                {paymentMethod === 'DINHEIRO' && (
                    <div className="w-full mt-2 pt-2 border-t border-dotted border-gray-300">
                        <div className="w-full flex justify-between text-xs">
                             <span>Valor Pago:</span>
                             <span>R$ {paidValue.toFixed(2)}</span>
                        </div>
                        <div className="w-full flex justify-between text-xs font-bold">
                             <span>Troco:</span>
                             <span>R$ {change.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <div className="w-full flex justify-between text-xs mt-2 pt-2 border-t border-dashed border-black">
                  <span>Forma Pagto:</span>
                  <span>{paymentMethod}</span>
                </div>
                
                <div className="w-full border-b border-dashed border-black my-4"></div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs">Pedido: #{orderNumber.toString().padStart(4, '0')}</p>
                  <p className="text-xs">{new Date().toLocaleString()}</p>
                  <p className="text-[10px] mt-2 text-center">Obrigado pela preferência!</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-[80mm] no-print">
              <button 
                onClick={handlePrint}
                disabled={isProcessing}
                className="w-full bg-slate-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-600 font-bold transition-colors disabled:opacity-50"
              >
                <Printer size={18} /> 1. IMPRIMIR CUPOM
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                 <button 
                  onClick={handleAddMoreItems}
                  disabled={isProcessing}
                  className="bg-slate-800 text-cyan-400 border border-slate-600 py-3 rounded-lg flex items-center justify-center gap-1 hover:bg-slate-700 hover:border-cyan-500/50 font-bold transition-colors text-xs disabled:opacity-50"
                >
                  <ArrowLeft size={16} /> ADICIONAR ITEM
                </button>
                
                <button 
                  onClick={handleConfirmSale}
                  disabled={isProcessing}
                  className={`bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white py-3 rounded-lg flex items-center justify-center gap-1 font-bold transition-all text-xs shadow-lg shadow-violet-900/50 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin"/>
                        EMITINDO...
                      </>
                  ) : (
                      <>
                        <Check size={16} /> 
                        NOVA VENDA
                      </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}