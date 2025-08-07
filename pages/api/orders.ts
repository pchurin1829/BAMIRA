import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { getSession } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Obtener usuario autenticado
    const session = getSession(req);
    if (!session || !session.email) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    try {
      const orders = await prisma.order.findMany({
        where: { email: session.email },
        include: { items: { include: { producto: true } } },
        orderBy: { creadoEn: 'desc' }
      });
      return res.status(200).json({ orders });
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener las órdenes' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { nombre, email, telefono, metodoPago, localRetiro, items } = req.body;

  if (!nombre || !email || !telefono || !metodoPago || !localRetiro || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const order = await prisma.order.create({
      data: {
        nombre,
        email,
        telefono,
        metodoPago,
        localRetiro,
        items: {
          create: items.map((item: any) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precio: item.precio
          }))
        }
      },
      include: { items: true }
    });
    return res.status(201).json({ order });
  } catch (error) {
    return res.status(500).json({ error: 'Error al guardar la orden' });
  }
}
