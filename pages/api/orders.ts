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

  const { nombre, apellido, email, telefono, metodoPago, localRetiro, items } = req.body;

  if (!nombre || !email || !telefono || !localRetiro || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // metodoPago puede venir vacío desde el cliente; validar que sea un string no vacío
  if (!metodoPago || typeof metodoPago !== 'string' || metodoPago.trim() === '') {
    return res.status(400).json({ error: 'Método de pago inválido' });
  }

  try {
    // Calcular subtotal a partir de los items enviados (no confiar en un total del cliente)
    const subtotal = items.reduce((sum: number, item: any) => {
      const price = Number(item.precio) || 0;
      const qty = Number(item.cantidad) || 0;
      return sum + price * qty;
    }, 0);

    const isDiscounted = metodoPago === 'Transferencia Bancaria' || metodoPago === 'Efectivo';
    // aplicar 10% si corresponde; redondear a 2 decimales
    const total = Number((isDiscounted ? subtotal * 0.9 : subtotal).toFixed(2));

    const order = await prisma.order.create({
      data: {
        nombre,
        apellido,
        email,
        telefono,
        metodoPago,
        localRetiro,
        total,
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

    // Crear comprobante automáticamente con expiración en 48 horas
    await prisma.comprobante.create({
      data: {
        orderId: order.id,
        status: 'pendiente_subida',
        expiraEn: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
      }
    });

    return res.status(201).json({ order });
  } catch (error) {
    console.error('orders POST error:', error);
    return res.status(500).json({ error: 'Error al guardar la orden' });
  }
}
