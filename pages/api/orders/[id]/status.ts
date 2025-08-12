import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ error: 'id inválido' });

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    const estado = (order as any).estado ?? 'pendiente';
    return res.status(200).json({ estado });
  } catch (e) {
    return res.status(500).json({ error: 'Error al consultar estado' });
  }
}
