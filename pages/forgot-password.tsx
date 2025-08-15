import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setMessage('Si tu email existe, recibirás un enlace para restablecer tu contraseña.');
      } else {
        throw new Error('Error al solicitar restablecimiento');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Algo salió mal');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">Recuperar contraseña</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold disabled:opacity-50"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
          {status === 'success' || status === 'error' ? (
            <p className={`mt-4 text-center ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  );
}
