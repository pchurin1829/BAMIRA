import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  toastMessage: string | null;
  showAddModal: boolean;
  lastAddedName: string;
  closeAddModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart-items');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cart-items', JSON.stringify(items));
    }
  }, [items, isMounted]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastAddedName, setLastAddedName] = useState('');
  const addItem = (item: CartItem) => {
    setItems(prev => {
      const found = prev.find(i => i.id === item.id);
      const updated = found
        ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
        : [...prev, item];
  // Trigger toast with product name
  setToastMessage(`¡Añadido ${item.name} al carrito!`);
  // Show global add modal
  setLastAddedName(item.name);
  setShowAddModal(true);
  // Auto-close modal after 2s
  setTimeout(() => setShowAddModal(false), 2000);
      // Clear toast after 2s
      setTimeout(() => setToastMessage(null), 2000);
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  if (!isMounted) return null;

  const closeAddModal = () => setShowAddModal(false);
  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, updateQuantity, toastMessage, showAddModal, lastAddedName, closeAddModal }}>
      {children}
    </CartContext.Provider>
  );
}
