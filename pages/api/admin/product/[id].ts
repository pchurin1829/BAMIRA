import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export const config = {
  api: { bodyParser: false },
};
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
    body,
  } = req;
  const productId = parseInt(id as string);

  // TODO: Add admin authentication check
  // const session = await getSession({ req });
  // if (!session || session.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  try {
    if (method === 'GET') {
      const product = await prisma.producto.findUnique({
        where: { id: productId },
      });
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      return res.status(200).json(product);
    } else if (method === 'PUT') {
      // Parse multipart form data
      const formidable = require('formidable');
      const fs = require('fs');
      const path = require('path');
      const form = new formidable.IncomingForm({ multiples: true });
      const { fields, files } = await new Promise<any>((resolve, reject) => {
        form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
      });
      // Extract text fields
      const {
        nombre,
        descripcion,
        precio,
        stock,
        marca,
        specs,
        manualUrl,
        dimensions,
      } = fields;
      // Handle file uploads
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', String(productId));
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      // Retrieve existing extraImages
      const prod = await prisma.producto.findUnique({ where: { id: productId } });
  const prodAny = prod as any;
  const existing = prodAny?.extraImages ? (prodAny.extraImages as string).split(',') : [];
      let newImages: string[] = [];
      if (files.images) {
        const fileArr = Array.isArray(files.images) ? files.images : [files.images];
        // Limit to 20 images total
        const toProcess = fileArr.slice(0, Math.max(0, 20 - existing.length));
        for (const file of toProcess) {
          const fname = `${Date.now()}-${file.originalFilename}`;
          const dest = path.join(uploadDir, fname);
          fs.renameSync(file.filepath, dest);
          newImages.push(`/uploads/products/${productId}/${fname}`);
        }
      }
      const allImages = [...existing, ...newImages].slice(0, 20);
      // Update record
      const updated = await prisma.producto.update({
        where: { id: productId },
        // @ts-ignore
        data: {
          nombre,
          descripcion,
          precio: parseFloat(precio as string),
          stock: parseInt(stock as string),
          marca,
          extraImages: allImages.join(','),
          specs,
          manualUrl,
          dimensions,
        } as any,
      });
      return res.status(200).json(updated);
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
