import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Obtener todos los comprobantes que han expirado y están pendientes de subida
    const comprobantesExpirados = await prisma.comprobante.findMany({
      where: {
        status: 'pendiente_subida',
        expiraEn: {
          lt: new Date() // menor que la fecha actual
        }
      }
    });

    if (comprobantesExpirados.length === 0) {
      return res.status(200).json({ 
        message: 'No hay comprobantes expirados para cancelar',
        cancelados: 0 
      });
    }

    // Actualizar todos los comprobantes expirados a "cancelado"
    const resultado = await prisma.comprobante.updateMany({
      where: {
        id: {
          in: comprobantesExpirados.map(c => c.id)
        }
      },
      data: {
        status: 'cancelado'
      }
    });

    res.status(200).json({ 
      message: `${resultado.count} comprobantes cancelados por expiración`,
      cancelados: resultado.count,
      ids: comprobantesExpirados.map(c => c.id)
    });

  } catch (error) {
    console.error('Error al cancelar comprobantes expirados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}
