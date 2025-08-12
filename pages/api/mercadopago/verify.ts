import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { mpPayment } from '../../../lib/mercadopago';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const { payment_id, orderId } = req.body as { payment_id?: string, orderId?: number };
  if (!payment_id || !orderId) return res.status(400).json({ error: 'Datos inválidos' });
  try {
    const payment: any = await mpPayment.get({ id: payment_id });
    const estado = payment.status === 'approved' ? 'pagado' : (payment.status || 'pendiente');
    await prisma.order.update({ where: { id: Number(orderId) }, data: { estado } as any });
    return res.status(200).json({ estado });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo verificar' });
  }
}
