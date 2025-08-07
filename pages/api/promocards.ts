import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prismaCustomClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const cards = await prisma.promoCard.findMany();
      return res.status(200).json(cards);
    }
    if (req.method === 'POST') {
      const { title, subtitle, description, imageUrl, bgColor } = req.body;
      const card = await prisma.promoCard.create({
        data: { title, subtitle, description, imageUrl, bgColor }
      });
      return res.status(201).json(card);
    }
    if (req.method === 'PUT') {
      const { id, title, subtitle, description, imageUrl, bgColor } = req.body;
      const card = await prisma.promoCard.update({
        where: { id },
        data: { title, subtitle, description, imageUrl, bgColor }
      });
      return res.status(200).json(card);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      await prisma.promoCard.delete({ where: { id } });
      return res.status(204).end();
    }
    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en API de promocards:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}