import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method === 'PUT') {
    const { nombre, marca, descripcion, precio, stock, categoriaId, imagenUrl } = req.body;
    const producto = await prisma.producto.update({
      where: { id: Number(id) },
      data: {
        nombre,
        marca,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        categoriaId: parseInt(categoriaId),
        imagenUrl,
      },
    });
    return res.status(200).json({ producto });
  }
  if (req.method === 'DELETE') {
    await prisma.producto.delete({ where: { id: Number(id) } });
    return res.status(204).end();
  }
  res.status(405).json({ error: 'Método no permitido' });
}
