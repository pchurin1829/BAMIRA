import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        toast.success('¡Registro exitoso! Redirigiendo...');
        setTimeout(() => { window.location.href = '/cuenta/login'; }, 1200);
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

  return (
    <>
      <Navbar />
      <Toaster position="top-center" />
      <div className="max-w-md mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 font-medium">Nombre</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
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
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <div className="text-center mt-4">
          <a href="/cuenta/login" className="text-red-600 hover:underline">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      </div>
      <Footer />
    </>
  );
}
