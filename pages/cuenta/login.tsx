import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useCart } from '../../components/CartContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('/');
  const router = useRouter();
  const { items } = useCart(); // Usar el contexto del carrito para verificar si hay productos

  useEffect(() => {
    // Verificar si hay una URL de redirección guardada
    if (typeof window !== 'undefined') {
      const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
      if (savedRedirect) {
        setRedirectUrl(savedRedirect);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('¡Bienvenido! Redirigiendo...');
        
        // Limpiar la URL guardada del sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('redirectAfterLogin');
        }
        
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1200);
      } else {
        setError(data.error || 'Error al iniciar sesión');
        toast.error(data.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error de conexión');
      toast.error('Error de conexión');
    }
    setLoading(false);
  };

  // Verificar si realmente hay productos en el carrito
  const hasItemsInCart = items.length > 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Toaster position="top-center" />
      <div className="max-w-md mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        
        {redirectUrl === '/carrito' && hasItemsInCart && (
          <div className="bg-blue-900/30 border border-blue-500/50 text-blue-200 p-4 rounded mb-6">
            <p className="font-medium">Necesitas iniciar sesión para finalizar tu compra</p>
            <p className="text-sm mt-1 text-blue-300">Después de iniciar sesión, volverás automáticamente a tu carrito.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-md space-y-6">
          <div>
            <label className="block mb-2 font-medium text-white">Email</label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-white">Contraseña</label>
            <input 
              type="password" 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" 
            />
          </div>
          {error && <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">{error}</div>}
          <button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="text-center mt-4">
          <a href="/cuenta/register" className="text-red-600 hover:underline">¿No tenes cuenta? Regístrate</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
