import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { mpPayment } from '../../../lib/mercadopago';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const {
      token,
      amount,
      installments,
      orderId,
      email,
      payment_method_id,
      issuer_id,
    } = req.body as {
      token: string;
      amount: number;
      installments: number;
      orderId: number;
      email: string;
      payment_method_id: string;
      issuer_id: string | number;
    };
    if (!token || !amount || !orderId || !email) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    // Crear pago en Mercado Pago
    const paymentResponse: any = await mpPayment.create({
      body: {
        token,
        transaction_amount: amount,
        installments,
        payer: { email },
        payment_method_id,
        issuer_id: Number(issuer_id),
        // external_reference: String(orderId),
      },
    });
    const status = paymentResponse.status || 'pending';
    // Actualizar estado de la orden
    await prisma.order.update({
      where: { id: Number(orderId) },
      data: { estado: status } as any,
    });
    return res.status(200).json({ status });
  } catch (e: any) {
    console.error('Error process-payment', e);
    return res.status(500).json({ error: 'No se pudo procesar el pago' });
  }
}
