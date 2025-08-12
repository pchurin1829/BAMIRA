import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { mpPayment, mpMerchantOrder } from '../../../lib/mercadopago';

export const config = {
  api: { bodyParser: false }, // MP may send different content types; we only read query and re-fetch
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Mercado Pago sends topic/type and id. We fetch details server-side.
  try {
    const topic = (req.query.topic || req.query.type) as string;
    const id = req.query.id as string;

    if (!topic || !id) {
      return res.status(400).json({});
    }

    if (topic === 'payment') {
      const payment: any = await mpPayment.get({ id });
      const extRef = payment.external_reference || '';
      const orderId = Number(extRef || 0);

      if (orderId) {
        const estado = payment.status === 'approved' ? 'pagado' : (payment.status || 'pendiente');
        await prisma.order.update({ where: { id: orderId }, data: { estado } });
      }
    } else if (topic === 'merchant_order') {
      const mo = await mpMerchantOrder.get({ merchantOrderId: id });
      const extRef = mo.external_reference;
      const orderId = Number(extRef || 0);
      if (orderId) {
        // Evaluate total paid
        const paid = (mo.payments || []).reduce((acc: number, p: any) => acc + (p.total_paid_amount || 0), 0);
        const estado = paid > 0 ? 'pagado' : 'pendiente';
        await prisma.order.update({ where: { id: orderId }, data: { estado } });
      }
    }

    return res.status(200).json({});
  } catch (e) {
    // Always 200 to avoid retries storm; but log it
    console.error('MP webhook error', e);
    return res.status(200).json({});
  }
}
