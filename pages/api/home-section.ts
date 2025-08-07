import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { getSession } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Devuelve el primer registro, si no existe crea uno por defecto
    let section = await prisma.homeSection.findFirst();
    if (!section) {
      section = await prisma.homeSection.create({
        data: {
          titulo: '¡Nuevo!',
          subtitulo: 'Lanzamiento exclusivo - ¡Ya disponible!',
          textoBoton: 'Ver productos',
          linkBoton: '/productos',
          colorFondo: '#fff',
          colorTexto: '#d90429',
          imagenUrl: '/logos/logoaimexchangehd.png',
        },
      });
    }
    return res.status(200).json(section);
  }

  if (req.method === 'PUT') {
    const session = await getSession(req);
    if (!session || session.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const { titulo, subtitulo, textoBoton, linkBoton, colorFondo, colorTexto, imagenUrl } = req.body;
    const section = await prisma.homeSection.upsert({
      where: { id: 1 },
      update: { titulo, subtitulo, textoBoton, linkBoton, colorFondo, colorTexto, imagenUrl },
      create: { titulo, subtitulo, textoBoton, linkBoton, colorFondo, colorTexto, imagenUrl },
    });
    return res.status(200).json(section);
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
