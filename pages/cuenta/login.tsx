import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useCart } from '../../components/CartContext';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [token2fa, setToken2fa] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
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
      // If we don't yet know if 2FA is required, perform initial credential check
      if (!needs2FA) {
        const result = await signIn('credentials', { redirect: false, email: form.email, password: form.password });
        if (result?.error) {
          // If server indicates 2FA is required, prompt for code
          const msg = String(result.error || '').toLowerCase();
          if (msg.includes('2fa') || msg.includes('código 2fa') || msg.includes('codigo 2fa')) {
            setNeeds2FA(true);
            setError('Código 2FA requerido. Ingresa el código de tu app de autenticación.');
          } else {
            setError(result.error as string);
            toast.error(result.error as string);
          }
        } else {
          toast.success('¡Bienvenido! Redirigiendo...');
          // Limpiar la URL guardada del sessionStorage
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('redirectAfterLogin');
          }
          setTimeout(() => router.push(redirectUrl), 1200);
        }
      } else {
        // We already asked for 2FA -> now verify with token included
        const result = await signIn('credentials', { redirect: false, email: form.email, password: form.password, token: token2fa });
        if (result?.error) {
          setError(result.error as string);
          toast.error(result.error as string);
        } else {
          toast.success('¡Bienvenido! Redirigiendo...');
          if (typeof window !== 'undefined') sessionStorage.removeItem('redirectAfterLogin');
          setTimeout(() => router.push(redirectUrl), 1200);
        }
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
          {needs2FA && (
            <div>
              <label className="block mb-2 font-medium text-white">Código 2FA</label>
              <input
                type="text"
                name="token"
                value={token2fa}
                onChange={e => setToken2fa(e.target.value)}
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              <p className="text-sm text-gray-400 mt-2">Ingresa el código de tu app de autenticación.</p>
            </div>
          )}
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
