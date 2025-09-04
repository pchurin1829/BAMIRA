import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prismaCustomClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const productoId = parseInt(id as string);

  if (isNaN(productoId)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }

  if (req.method === 'POST') {
    try {
      const { precio, duracion } = req.body;

      if (!precio || precio <= 0) {
        return res.status(400).json({ error: 'Precio de promoción inválido' });
      }

      if (!duracion || duracion <= 0) {
        return res.status(400).json({ error: 'Duración de promoción inválida' });
      }

      // Obtener el producto actual
      const productoActual = await prisma.producto.findUnique({
        where: { id: productoId }
      }) as any;

      if (!productoActual) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Calcular descuento porcentual
      const precioOriginal = productoActual.precioOriginal || productoActual.precio;
      const nuevoPrecio = parseFloat(precio);
      const descuento = Math.round(((precioOriginal - nuevoPrecio) / precioOriginal) * 100);

      // Calcular fecha de expiración
      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + parseInt(duracion));

      // Actualizar producto con promoción
      const productoActualizado = await prisma.producto.update({
        where: { id: productoId },
        data: {
          precio: nuevoPrecio,
          promocion: true,
          descuento: descuento,
          precioOriginal: productoActual.precioOriginal || productoActual.precio,
          promoExpira: fechaExpiracion
        } as any
      });

      return res.status(200).json({
        message: 'Promoción aplicada exitosamente',
        producto: productoActualizado
      });

    } catch (error) {
      console.error('Error al aplicar promoción:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Obtener el producto actual
      const productoActual = await prisma.producto.findUnique({
        where: { id: productoId }
      }) as any;

      if (!productoActual) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Remover promoción y restaurar precio original
      const productoActualizado = await prisma.producto.update({
        where: { id: productoId },
        data: {
          precio: productoActual.precioOriginal || productoActual.precio,
          promocion: false,
          descuento: null,
          precioOriginal: null,
          promoExpira: null
        } as any
      });

      return res.status(200).json({
        message: 'Promoción removida exitosamente',
        producto: productoActualizado
      });

    } catch (error) {
      console.error('Error al remover promoción:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  res.status(405).json({ error: 'Método no permitido' });
}
