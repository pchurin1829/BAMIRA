import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Listar todos los pedidos con sus comprobantes
      const orders = await prisma.order.findMany({
        include: {
          comprobante: true,
          items: {
            include: {
              producto: true
            }
          }
        },
        orderBy: {
          creadoEn: 'desc'
        }
      });

      res.status(200).json(orders);
    } 
    else if (req.method === 'PATCH') {
      const { comprobanteId, status, orderId, accion } = req.body;

      // Actualizar status de comprobante
      if (comprobanteId && status) {
        const validStatuses = ['pendiente_revision', 'pago_recibido', 'cancelado'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: 'Status inválido' });
        }

        const comprobante = await prisma.comprobante.update({
          where: { id: comprobanteId },
          data: { status },
          include: {
            order: true
          }
        });

        return res.status(200).json({ 
          message: 'Status actualizado exitosamente',
          comprobante 
        });
      }

      // Marcar pedido como retirado y descontar stock
      if (orderId && accion === 'marcar_retirado') {
        // Verificar que el pedido existe y tiene pago confirmado
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            comprobante: true,
            items: {
              include: {
                producto: true
              }
            }
          }
        });

        if (!order) {
          return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        if (!order.comprobante || order.comprobante.status !== 'pago_recibido') {
          return res.status(400).json({ message: 'El pedido debe tener pago confirmado antes de ser retirado' });
        }

        if (order.estado === 'retirado') {
          return res.status(400).json({ message: 'El pedido ya fue marcado como retirado' });
        }

        // Verificar que hay stock suficiente para todos los productos
        for (const item of order.items) {
          if (item.producto.stock < item.cantidad) {
            return res.status(400).json({ 
              message: `Stock insuficiente para ${item.producto.nombre}. Stock disponible: ${item.producto.stock}, cantidad solicitada: ${item.cantidad}` 
            });
          }
        }

        // Actualizar stock de cada producto y marcar pedido como retirado
        await prisma.$transaction(async (tx) => {
          // Descontar stock de cada producto
          for (const item of order.items) {
            await tx.producto.update({
              where: { id: item.productoId },
              data: {
                stock: {
                  decrement: item.cantidad
                }
              }
            });
          }

          // Marcar pedido como retirado
          await tx.order.update({
            where: { id: orderId },
            data: { estado: 'retirado' }
          });
        });

        return res.status(200).json({ 
          message: 'Pedido marcado como retirado y stock actualizado exitosamente'
        });
      }

      return res.status(400).json({ message: 'Parámetros inválidos' });
    }
    else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error en API de pedidos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}
