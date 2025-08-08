import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

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

  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    fetch('/api/orders', { credentials: 'include' })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          setOrders([]);
        }
        setOrdersLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setOrdersLoading(false);
      });
  }, [user]);

  const handleLogout = () => {
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/';
  };

  if (loading) {
    return <div className="bg-black min-h-screen flex items-center justify-center text-gray-300">Cargando perfil...</div>;
  }
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="bg-black min-h-screen flex items-center justify-center text-red-500 font-bold">No has iniciado sesión</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-md mx-auto py-12 px-4">
          <h1 className="text-2xl font-bold mb-6 text-center">Perfil de usuario</h1>
          <div className="bg-gray-800 rounded shadow p-6 mb-6">
            <div className="mb-2"><span className="font-bold">Nombre:</span> {user.nombre}</div>
            <div className="mb-2"><span className="font-bold">Email:</span> {user.email}</div>
            <div className="mb-2"><span className="font-bold">Rol:</span> {user.rol}</div>
          </div>
          <div className="bg-gray-800 rounded shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Mis pedidos</h2>
            {ordersLoading ? (
              <div className="text-gray-300">Cargando pedidos...</div>
            ) : orders.length === 0 ? (
              <div className="text-gray-300">No hay pedidos.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-2 py-1 border border-gray-600">ID</th>
                      <th className="px-2 py-1 border border-gray-600">Fecha</th>
                      <th className="px-2 py-1 border border-gray-600">Total</th>
                      <th className="px-2 py-1 border border-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-600">
                        <td className="px-2 py-1 border border-gray-600">{order.id}</td>
                        <td className="px-2 py-1 border border-gray-600">{order.creadoEn ? new Date(order.creadoEn).toLocaleString() : ''}</td>
                        <td className="px-2 py-1 border border-gray-600">${order.total?.toFixed(2) ?? '0.00'}</td>
                        <td className="px-2 py-1 border border-gray-600">{order.estado ?? 'Pendiente'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors">Cerrar sesión</button>
        </div>
      </div>
      <Footer />
    </>
  );
}
