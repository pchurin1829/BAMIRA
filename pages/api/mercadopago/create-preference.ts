import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { mpPreference, isMpConfigured } from '../../../lib/mercadopago';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!isMpConfigured()) return res.status(500).json({ error: 'Mercado Pago no configurado' });

  const { orderId } = req.body as { orderId?: number };
  if (!orderId) return res.status(400).json({ error: 'orderId requerido' });

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { producto: true } } } });
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

  // Calcular total si no está
  const total = order.items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

  const host = (req.headers.host as string) || 'localhost:3000';
  const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;

  const preference = {
    items: order.items.map((it) => ({
      id: String(it.productoId),
      title: it.producto?.nombre || `Producto ${it.productoId}`,
      currency_id: 'ARS',
      quantity: it.cantidad,
      unit_price: Number(it.precio),
    })),
    payer: {
      name: order.nombre,
      email: order.email,
    },
    external_reference: String(order.id),
    back_urls: {
      success: `${baseUrl}/pago/retorno?status=success&orderId=${order.id}`,
      failure: `${baseUrl}/pago/retorno?status=failure&orderId=${order.id}`,
      pending: `${baseUrl}/pago/retorno?status=pending&orderId=${order.id}`,
    },
    notification_url: `${baseUrl}/api/mercadopago/webhook`,
    binary_mode: false,
  } as any;

  try {
    const pref = await mpPreference.create({ body: preference });

    return res.status(200).json({ init_point: pref.init_point, id: pref.id });
  } catch (e: any) {
    console.error('MP create preference error', e?.message || e, { baseUrl, host, hasBackUrls: Boolean((preference as any).back_urls?.success) });
    return res.status(500).json({ error: 'No se pudo crear la preferencia' });
  }
}
