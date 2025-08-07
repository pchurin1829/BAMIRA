import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../components/CartContext';

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

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    // Obtener usuario autenticado
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
          setForm(f => ({ ...f, email: data.user.email, nombre: data.user.nombre }));
        } else {
          // Redirigir a login si no autenticado
          window.location.href = '/cuenta/login';
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

  return (
    <>
      <Navbar />
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
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold text-lg transition-colors" onClick={() => setShowCheckout(true)}>
                Finalizar compra
              </button>
            </div>
            {showCheckout && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <form className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative" onSubmit={handleCheckout}>
                  <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowCheckout(false)}>&times;</button>
                  <h2 className="text-xl font-bold mb-4">Finalizar compra</h2>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Apellido</label>
                    <input name="apellido" value={form.apellido} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input name="email" type="email" value={form.email} readOnly className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Método de pago</label>
                    <select name="metodoPago" value={form.metodoPago} onChange={handleChange} className="w-full border rounded px-3 py-2">
                      {METODOS_PAGO.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  {(form.metodoPago === 'Efectivo' || form.metodoPago === 'Transferencia Bancaria') && (
                    <div className="mb-3 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-2 text-sm">
                      Si elegís Efectivo o Transferencia bancaria, tu pedido estará en reserva solo por 48 hs hábiles. Si no se registra el pago en ese plazo, el pedido será cancelado.
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Local de retiro</label>
                    <select name="localRetiro" value={form.localRetiro} onChange={handleChange} className="w-full border rounded px-3 py-2">
                      {LOCALES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
                  <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold w-full mt-2" disabled={loading}>
                    {loading ? 'Procesando...' : 'Confirmar compra'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
