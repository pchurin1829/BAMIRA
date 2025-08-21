import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import sanitizeHtml from 'sanitize-html';
import { sanitize, sanitizeFromText } from '../../../../lib/sanitizeHtml';

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
      // Extract and normalize text fields from form
      const rawNombre = fields.nombre;
      const rawDescripcion = fields.descripcion;
      const rawPrecio = fields.precio;
      const rawStock = fields.stock;
      const rawMarca = fields.marca;
      const rawSpecs = fields.specs;
      const rawManualUrl = fields.manualUrl;
      const rawDimensions = fields.dimensions;
      const nombre = Array.isArray(rawNombre) ? rawNombre[0] : rawNombre;
      const descripcion = Array.isArray(rawDescripcion) ? rawDescripcion[0] : rawDescripcion;
      const precioStr = Array.isArray(rawPrecio) ? rawPrecio[0] : rawPrecio;
      const stockStr = Array.isArray(rawStock) ? rawStock[0] : rawStock;
      const marca = Array.isArray(rawMarca) ? rawMarca[0] : rawMarca;
  const specs = Array.isArray(rawSpecs) ? rawSpecs[0] : rawSpecs;
      const manualUrl = Array.isArray(rawManualUrl) ? rawManualUrl[0] : rawManualUrl;
      const dimensions = Array.isArray(rawDimensions) ? rawDimensions[0] : rawDimensions;
      // Basic validation
      if (!nombre || !descripcion) {
        return res.status(400).json({ error: 'Nombre y descripción son requeridos' });
      }
      if (isNaN(parseFloat(precioStr)) || isNaN(parseInt(stockStr, 10))) {
        return res.status(400).json({ error: 'Precio y stock deben ser números válidos' });
      }
      // Handle file uploads
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', String(productId));
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  // Retrieve existing extraImages
  const prod = await prisma.producto.findUnique({ where: { id: productId } });
  const prodAny = prod as any;
  const existing = prodAny?.extraImages ? (prodAny.extraImages as string).split(',') : [];
  // Handle removals specified by admin
  const removeList = fields.removeImages ? (fields.removeImages as string).split(',') : [];
  const keptExisting = existing.filter(url => !removeList.includes(url));
      let newImages: string[] = [];
      if (files.images) {
        const fileArr = Array.isArray(files.images) ? files.images : [files.images];
        // Limit to 20 images total
        const toProcess = fileArr.slice(0, Math.max(0, 20 - existing.length));
        for (const file of toProcess) {
          const fname = `${Date.now()}-${file.originalFilename}`;
          const dest = path.join(uploadDir, fname);
          // Copy file to destination and remove temp file to handle cross-device issues
          fs.copyFileSync(file.filepath, dest);
          fs.unlinkSync(file.filepath);
          newImages.push(`/uploads/products/${productId}/${fname}`);
        }
      }
  const allImages = [...keptExisting, ...newImages].slice(0, 20);
      // Helper: convierte texto plano con saltos de línea a HTML seguro (p + br) y luego sanitiza.
      // Si el input ya contiene HTML (tags detectables), asumimos que viene HTML y sólo sanitizamos
      // para evitar doble-escape / doble-wrapping al editar.
  // Convert and sanitize specs / descripcion / dimensions preserving newlines
  const cleanedSpecs = sanitizeFromText(specs);
  const cleanedDescripcion = sanitizeFromText(descripcion) ?? String(descripcion);
  const cleanedDimensions = sanitizeFromText(dimensions) ?? (dimensions ? String(dimensions) : null);

      // Update record
      const updated = await prisma.producto.update({
        where: { id: productId },
        data: {
          nombre: String(nombre),
          descripcion: cleanedDescripcion,
          precio: parseFloat(precioStr),
          stock: parseInt(stockStr, 10),
          marca: marca ? String(marca) : null,
          extraImages: allImages.join(','),
          specs: cleanedSpecs,
          manualUrl: manualUrl ? String(manualUrl) : null,
          dimensions: cleanedDimensions,
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
