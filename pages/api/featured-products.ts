import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prismaCustomClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Devuelve los productos destacados con los datos del producto
      const featured = await prisma.featuredProduct.findMany({
        include: { producto: true }
      });
      return res.status(200).json(featured);
    }
    if (req.method === 'POST') {
      // Agrega un producto destacado
      const { productoId } = req.body;
      const fp = await prisma.featuredProduct.create({
        data: { productoId }
      });
      return res.status(201).json(fp);
    }
    if (req.method === 'DELETE') {
      // Elimina un producto destacado
      const { productoId } = req.body;
      await prisma.featuredProduct.delete({ where: { productoId } });
      return res.status(204).end();
    }
    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en API de productos destacados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}