import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        setTimeout(() => { window.location.href = '/'; }, 1200);
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

  return (
    <>
      <Navbar />
      <Toaster position="top-center" />
      <div className="max-w-md mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-2 font-medium">Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="text-center mt-4">
          <a href="/cuenta/register" className="text-red-600 hover:underline">¿No tienes cuenta? Regístrate</a>
        </div>
      </div>
      <Footer />
    </>
  );
}
