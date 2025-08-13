import React from 'react';
import { useCart } from './CartContext';
import { useRouter } from 'next/router';

export default function AddModal() {
  const { showAddModal, lastAddedName, closeAddModal } = useCart();
  const router = useRouter();

  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">¡Producto agregado al carrito!</h3>
          <p className="text-gray-400 mt-2">{lastAddedName}</p>
        </div>
        <div className="flex items-center justify-center">
          <button
            onClick={() => { closeAddModal(); }}
            className="px-4 py-2 border border-gray-700 rounded text-gray-300 hover:bg-gray-800 font-medium mr-2"
          >
            Seguir comprando
          </button>
          <button
            onClick={() => router.push('/carrito')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
          >
            Ir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
