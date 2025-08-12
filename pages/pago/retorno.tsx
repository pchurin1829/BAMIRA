import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RetornoPago() {
  const router = useRouter();
  const { orderId, payment_id } = router.query as { orderId?: string; payment_id?: string };
  const [estado, setEstado] = useState<string>('verificando');

  useEffect(() => {
    if (!orderId) return;
    let tries = 0;
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        const data = await res.json();
        if (res.ok) {
          setEstado(data.estado);
          if (data.estado === 'pagado' || data.estado === 'rejected') return; // stop polling on final states
        }
      } catch {}
      if (!cancelled && tries++ < 5) setTimeout(check, 1500 * tries);
    };

    check();
    return () => { cancelled = true; };
  }, [orderId]);

  // Fallback: si pasaron unos segundos y aún estamos "verificando" y tenemos payment_id, intentamos verificar
  useEffect(() => {
    if (!orderId || !payment_id) return;
    const t = setTimeout(async () => {
      if (estado !== 'verificando') return;
      try {
        const res = await fetch('/api/mercadopago/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, payment_id })
        });
        const data = await res.json();
        if (res.ok && data.estado) setEstado(data.estado);
      } catch {}
    }, 6000);
    return () => clearTimeout(t);
  }, [orderId, payment_id, estado]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded p-6 text-center">
          <h1 className="text-xl font-bold mb-2">Estado de tu pago</h1>
          <p className="text-gray-300 mb-4">Orden #{orderId}</p>
          {estado === 'verificando' && <div className="animate-pulse">Verificando con Mercado Pago…</div>}
          {estado === 'pagado' && <div className="text-green-400 font-bold">¡Pago aprobado!</div>}
          {estado !== 'verificando' && estado !== 'pagado' && (
            <div className="text-yellow-400">Estado: {estado}</div>
          )}
          <div className="mt-6">
            <a href="/" className="text-red-500 hover:underline">Volver al inicio</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
