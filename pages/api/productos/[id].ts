import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaCustomClient';

function formatPriceNumber(price: number) {
  // Redondea y formatea con punto como separador de miles: 79999 -> "79.999"
  const n = Math.round(price);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const productoId = parseInt(id as string);

  if (isNaN(productoId)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }

  if (req.method === 'GET') {
    try {
      const producto = await prisma.producto.findUnique({
        where: { id: productoId },
        include: { categoria: true }
      });

      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Campos de presentación: precio formateado y estado de stock
      const formattedPrice = formatPriceNumber(producto.precio);
      const stockLabel = producto.stock > 0 ? 'Disponible' : 'No disponible';
      const disponible = producto.stock > 0;

      return res.status(200).json({
        ...producto,
        formattedPrice,
        stockLabel,
        disponible
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { nombre, descripcion, precio, stock, categoriaId, imagenUrl, marca } = req.body;
      
      const producto = await prisma.producto.update({
        where: { id: productoId },
        data: {
          nombre,
          descripcion,
          precio: parseFloat(precio),
          stock: parseInt(stock),
          categoriaId: parseInt(categoriaId),
          imagenUrl,
          marca: marca || null,
        }
      });

      const formattedPrice = formatPriceNumber(producto.precio);
      const stockLabel = producto.stock > 0 ? 'Disponible' : 'No disponible';
      const disponible = producto.stock > 0;
      
      return res.status(200).json({
        ...producto,
        formattedPrice,
        stockLabel,
        disponible
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ error: 'Error al actualizar el producto' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Eliminar la relación en featuredProduct si existe
      await prisma.featuredProduct.deleteMany({
        where: { productoId: productoId }
      });
      // Eliminar el producto
      await prisma.producto.delete({
        where: { id: productoId }
      });
      
      return res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  }

  res.status(405).json({ error: 'Método no permitido' });
}