import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useCart } from '../../components/CartContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [passwordError, setPasswordError] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('/cuenta/login');
  const router = useRouter();
  const { items } = useCart(); // Usar el contexto del carrito para verificar si hay productos

  useEffect(() => {
    // Verificar si hay una URL de redirección guardada
    if (typeof window !== 'undefined') {
      const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
      if (savedRedirect) {
        // Después del registro, redirigimos al login, pero mantenemos la URL del carrito para la redirección posterior
        setRedirectUrl('/cuenta/login');
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Validación instantánea de contraseña
    if (name === 'password') {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      setPasswordError(regex.test(value)
        ? ''
        : 'La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas y números'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Validaciones básicas
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio');
      toast.error('El nombre es obligatorio');
      setLoading(false);
      return;
    }
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError('Email inválido');
      toast.error('Email inválido');
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      toast.error('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('¡Registro exitoso! Redirigiendo al inicio de sesión...');
        // No eliminamos redirectAfterLogin para que la página de login lo use
        setTimeout(() => { 
          router.push(redirectUrl);
        }, 1200);
      } else {
        setError(data.error || 'Error al registrar');
        toast.error(data.error || 'Error al registrar');
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
        <h1 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h1>
        
        {redirectUrl === '/cuenta/login' && sessionStorage.getItem('redirectAfterLogin') === '/carrito' && hasItemsInCart && (
          <div className="bg-blue-900/30 border border-blue-500/50 text-blue-200 p-4 rounded mb-6">
            <p className="font-medium">Crea una cuenta para finalizar tu compra</p>
            <p className="text-sm mt-1 text-blue-300">Después de registrarte e iniciar sesión, volverás automáticamente a tu carrito.</p>
          </div>
        )}
        
        <form className="bg-gray-900 p-6 rounded-lg shadow-md space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 font-medium text-white">Nombre</label>
            <input 
              type="text" 
              name="nombre" 
              value={form.nombre} 
              onChange={handleChange} 
              required 
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" 
            />
          </div>
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
            {passwordError && <div className="text-yellow-400 text-sm mt-1">{passwordError}</div>}
          </div>
          {error && <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">{error}</div>}
          <button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading || Boolean(passwordError)}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <div className="text-center mt-4">
          <a href="/cuenta/login" className="text-red-600 hover:underline">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
