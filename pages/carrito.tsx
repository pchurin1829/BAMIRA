import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../components/CartContext';
import { useRouter } from 'next/router';

const METODOS_PAGO = [
  { value: 'Transferencia Bancaria', label: 'Transferencia Bancaria' },
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'MercadoPago', label: 'MercadoPago' },
];
const LOCALES = [
  { value: 'CABA', label: 'Ciudad Autónoma de Buenos Aires' },
  { value: 'La Plata', label: 'La Plata' },
];

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', metodoPago: METODOS_PAGO[0].value, localRetiro: LOCALES[0].value });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<number|null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  const router = useRouter();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    // Comprobar si el usuario está autenticado, pero no redirigir automáticamente
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          setForm(f => ({ ...f, email: data.user.email, nombre: data.user.nombre }));
        } else {
          setIsAuthenticated(false);
        }
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(item => ({
            productoId: Number(item.id),
            cantidad: item.quantity,
            precio: item.price
          }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setOrderId(data.order.id);
        clearCart();
      } else {
        setError(data.error || 'Error al procesar la orden');
      }
    } catch (err) {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCheckout = () => {
    if (!isAuthenticated) {
      // Guardar la URL actual en sessionStorage para volver después de iniciar sesión
      sessionStorage.setItem('redirectAfterLogin', '/carrito');
      router.push('/cuenta/login');
    } else {
      setShowCheckout(true);
    }
  };

  // Mostrar un mensaje de carga mientras se verifica la autenticación
  if (isAuthenticated === null) {
    return (
      <>
        <Navbar />
        <div className="bg-black text-white min-h-screen">
          <div className="max-w-3xl mx-auto px-4 py-12 text-center">
            <div className="animate-pulse">Cargando...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-8 text-center">Carrito de compras</h1>
          {success ? (
            <div className="bg-green-100 border border-green-300 text-green-800 p-6 rounded text-center mb-8">
              <div className="text-xl font-bold mb-2">¡Gracias por tu compra!</div>
              <div>Tu pedido #{orderId} fue registrado correctamente.<br />Te contactaremos para coordinar el retiro.</div>
              <button className="mt-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded" onClick={() => setSuccess(false)}>Volver al carrito</button>
            </div>
          ) : items.length === 0 ? (
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
                        className="w-16 border rounded px-2 py-1 text-center bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              
              {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-6">
                  <p className="font-medium">Para finalizar tu compra necesitas iniciar sesión o registrarte.</p>
                  <p className="text-sm mt-1">Al hacer clic en "Finalizar compra" serás redirigido al formulario de inicio de sesión.</p>
                </div>
              )}
              
              <div className="text-center">
                <button 
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold text-lg transition-colors" 
                  onClick={handleStartCheckout}
                >
                  Finalizar compra
                </button>
              </div>
              
              {showCheckout && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                  <form className="bg-gray-900 text-white rounded-lg shadow-lg p-8 w-full max-w-md relative border border-gray-700" onSubmit={handleCheckout}>
                    <button 
                      type="button"
                      className="absolute top-4 right-4 text-gray-400 hover:text-white"
                      onClick={() => setShowCheckout(false)}
                    >
                      ✕
                    </button>
                    <h2 className="text-xl font-bold mb-6">Finalizar compra</h2>
                    
                    {error && (
                      <div className="bg-red-900 text-red-200 border border-red-700 p-3 rounded mb-4">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input
                          type="text"
                          name="nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Apellido</label>
                        <input
                          type="text"
                          name="apellido"
                          value={form.apellido}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <input
                          type="tel"
                          name="telefono"
                          value={form.telefono}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Método de pago</label>
                        <select
                          name="metodoPago"
                          value={form.metodoPago}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        >
                          {METODOS_PAGO.map(metodo => (
                            <option key={metodo.value} value={metodo.value}>{metodo.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Local de retiro</label>
                        <select
                          name="localRetiro"
                          value={form.localRetiro}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        >
                          {LOCALES.map(local => (
                            <option key={local.value} value={local.value}>{local.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-bold transition-colors"
                      >
                        {loading ? 'Procesando...' : 'Confirmar compra'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
