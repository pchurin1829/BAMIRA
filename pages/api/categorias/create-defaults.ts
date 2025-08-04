import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const nombres = ["Teclados", "Mouse", "Mousepad", "Accesorios", "Audio"];
  let creadas = [];
  for (const nombre of nombres) {
    const existe = await prisma.categoria.findFirst({ where: { nombre } });
    if (!existe) {
      const nueva = await prisma.categoria.create({ data: { nombre } });
      creadas.push(nueva);
    }
  }
  return res.status(200).json({ creadas });
}
