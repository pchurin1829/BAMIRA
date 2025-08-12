import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email requerido' });
    }

    const orders = await prisma.order.findMany({
      where: {
        email: email as string
      },
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

  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}
