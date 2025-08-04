import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../components/CartContext';

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8 text-center">Carrito de compras</h1>
        {items.length === 0 ? (
          <div className="text-center text-gray-500">Tu carrito está vacío.</div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 mb-8">
              {items.map(item => (
                <li key={item.id} className="flex items-center py-4">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-gray-500">${item.price.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateQuantity(item.id, Number(e.target.value))}
                      className="w-16 border rounded px-2 py-1 text-center"
                    />
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => removeItem(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mb-8">
              <div className="text-lg font-bold">Total: ${total.toLocaleString()}</div>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium"
                onClick={clearCart}
              >
                Vaciar carrito
              </button>
            </div>
            <div className="text-center">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold text-lg transition-colors">
                Finalizar compra
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
