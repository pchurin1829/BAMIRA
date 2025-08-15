import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseñas no coinciden');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      if (res.ok) {
        setStatus('success');
        setMessage('Contraseña restablecida. Puedes iniciar sesión.');
      } else {
        const err = await res.json();
        setStatus('error');
        setMessage(err.error || 'Error al restablecer contraseña');
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
          <h1 className="text-2xl font-bold mb-4 text-center">Restablecer contraseña</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold disabled:opacity-50"
            >
              {status === 'loading' ? 'Procesando...' : 'Cambiar contraseña'}
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
