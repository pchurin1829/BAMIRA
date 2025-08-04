import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Solo las 5 categorías principales
    const categorias = await prisma.categoria.findMany({
      where: {
        nombre: {
          in: ['Accesorios', 'Audio', 'Mouse', 'Mousepad', 'Teclados']
        }
      }
    });
    return res.status(200).json({ categorias });
  }
  res.status(405).json({ error: 'Método no permitido' });
}
