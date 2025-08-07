import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaCustomClient';

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

      return res.status(200).json(producto);
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
      
      return res.status(200).json(producto);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ error: 'Error al actualizar el producto' });
    }
  }

  if (req.method === 'DELETE') {
    try {
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