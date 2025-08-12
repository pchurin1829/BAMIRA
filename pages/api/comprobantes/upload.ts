import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const form = formidable({
      uploadDir: './public/comprobantes',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: ({ mimetype }) => {
        return mimetype?.includes('image/') || false;
      },
    });

    // Crear directorio si no existe
    const uploadDir = './public/comprobantes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);
    const orderId = Array.isArray(fields.orderId) ? fields.orderId[0] : fields.orderId;
    
    if (!orderId) {
      return res.status(400).json({ message: 'ID de pedido requerido' });
    }

    // Verificar que el pedido existe
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { comprobante: true }
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar si ya expiró
    if (order.comprobante && new Date() > order.comprobante.expiraEn) {
      return res.status(400).json({ message: 'El tiempo para subir el comprobante ha expirado' });
    }

    const uploadedFile = Array.isArray(files.comprobante) ? files.comprobante[0] : files.comprobante;
    
    if (!uploadedFile) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(uploadedFile.originalFilename || '');
    const fileName = `${timestamp}_${randomString}${fileExtension}`;
    const newPath = path.join(uploadDir, fileName);

    // Mover archivo a ubicación final
    fs.renameSync(uploadedFile.filepath, newPath);

    const archivoUrl = `/comprobantes/${fileName}`;

    // Crear o actualizar comprobante
    const comprobante = await prisma.comprobante.upsert({
      where: { orderId: parseInt(orderId) },
      update: {
        archivoUrl,
        status: 'pendiente_revision',
      },
      create: {
        orderId: parseInt(orderId),
        archivoUrl,
        status: 'pendiente_revision',
        expiraEn: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
      },
    });

    res.status(200).json({ 
      message: 'Comprobante subido exitosamente',
      comprobante 
    });

  } catch (error) {
    console.error('Error al subir comprobante:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}
