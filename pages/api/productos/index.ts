import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const productos = await prisma.producto.findMany();
    return res.status(200).json({ productos });
  }
  if (req.method === 'POST') {
    const { nombre, descripcion, precio, stock, categoriaId, imagenUrl, promo } = req.body;
    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        categoriaId: parseInt(categoriaId),
        imagenUrl,
        promo: !!promo,
      },
    });
    return res.status(201).json({ producto });
  }
  res.status(405).json({ error: 'Método no permitido' });
}
