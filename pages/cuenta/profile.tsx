import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando perfil...</div>;
  }
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center text-2xl text-red-600 font-bold">No has iniciado sesión</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Perfil de usuario</h1>
        <div className="bg-white rounded shadow p-6 mb-6">
          <div className="mb-2"><span className="font-bold">Nombre:</span> {user.nombre}</div>
          <div className="mb-2"><span className="font-bold">Email:</span> {user.email}</div>
          <div className="mb-2"><span className="font-bold">Rol:</span> {user.rol}</div>
        </div>
        <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors">Cerrar sesión</button>
      </div>
      <Footer />
    </>
  );
}
