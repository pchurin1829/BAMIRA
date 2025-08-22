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
  // Retrieve existing product
  const prod = await prisma.producto.findUnique({ where: { id: productId } });
  const existing = prod?.extraImages ? String(prod.extraImages).split(',') : [];
  const beforeSnapshot = {
    imagesByColor: prod?.imagesByColor ?? null,
    extraImages: prod?.extraImages ?? null,
  };
  // imagesByColor existing (may be null) — normalize keys to lowercase to avoid case mismatches
  const rawExistingByColor = (prod?.imagesByColor ?? {}) as Record<string, any>;
  const existingByColor: Record<string, string[]> = {};
  Object.entries(rawExistingByColor || {}).forEach(([color, urls]: any) => {
    const key = String(color || 'default').toLowerCase();
    if (!Array.isArray(urls)) return;
    existingByColor[key] = existingByColor[key] ? existingByColor[key].concat(urls) : Array.from(urls);
  });
  // If there was no imagesByColor saved but there are extraImages, map them under 'default'
  if (Object.keys(existingByColor).length === 0 && existing.length > 0) {
    existingByColor['default'] = Array.from(existing);
  }
      // Handle removals specified by admin (applies to extraImages list)
      // formidable may return a single string or an array; normalize into string[]
      let removeListRaw = fields.removeImages;
      let removeList: string[] = [];
      if (!removeListRaw) {
        removeList = [];
      } else if (Array.isArray(removeListRaw)) {
        // array of strings or mixed; flatten and split comma-separated entries
        removeList = (removeListRaw as any[]).flatMap(r => String(r).split(',')).map(s => s.trim()).filter(Boolean);
      } else {
        // single value
        removeList = String(removeListRaw).split(',').map(s => s.trim()).filter(Boolean);
      }
  const keptExisting = existing.filter(url => !removeList.includes(url));
  // existingImageColors may be provided to change colors of existing images
  let providedExistingColors: Record<string, string> = {};
  if (fields.existingImageColors) {
    try {
      providedExistingColors = JSON.parse(String(fields.existingImageColors));
    } catch (e) {
      // ignore parse errors
    }
  }
      let newImages: string[] = [];
      // imageColors can be provided as JSON string mapping index->color or comma-separated list aligned with files
      // Expecting fields.imageColors either as JSON string like '["black","pink"]' or 'black,pink'
      const rawImageColors = fields.imageColors;
      let imageColorsArr: string[] = [];
      if (rawImageColors) {
        try {
          imageColorsArr = Array.isArray(rawImageColors) ? (rawImageColors as string[]).map(String) : JSON.parse(String(rawImageColors));
        } catch (e) {
          imageColorsArr = String(rawImageColors).split(',').map(s => s.trim()).filter(Boolean);
        }
      }

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
          const url = `/uploads/products/${productId}/${fname}`;
          newImages.push(url);
          // assign to imagesByColor under provided color or 'default'
          const idx = newImages.length - 1; // index in newImages
          const providedColor = String(imageColorsArr[idx] || 'default').toLowerCase();
          if (!existingByColor[providedColor]) existingByColor[providedColor] = [];
          existingByColor[providedColor].push(url);
        }
      }
  const allImages = [...keptExisting, ...newImages].slice(0, 20);
  // Ensure kept existing images are represented in imagesByColor.default if not present
  if (keptExisting.length > 0) {
    if (!existingByColor['default']) existingByColor['default'] = [];
    keptExisting.forEach(u => {
      if (!existingByColor['default'].includes(u)) existingByColor['default'].push(u);
    });
  }
  // Apply providedExistingColors to move existing URLs to the desired color buckets
  Object.entries(providedExistingColors).forEach(([url, color]) => {
    const key = String(color || 'default').toLowerCase();
    // remove url from any current buckets
    Object.keys(existingByColor).forEach(k => {
      existingByColor[k] = (existingByColor[k] || []).filter((u: string) => u !== url);
    });
    if (!existingByColor[key]) existingByColor[key] = [];
    if (!existingByColor[key].includes(url)) existingByColor[key].push(url);
  });
  // Physically delete removed files from disk and remove from all buckets
  const deletedFiles: string[] = [];
  const failedDeletes: { url: string; reason: string }[] = [];
  const normalize = (raw: string) => {
    if (!raw) return '';
    let s = String(raw).trim();
    // strip host if absolute
    s = s.replace(/^https?:\/\/[\w\-.:]+/, '');
    // strip querystring / fragment
    s = s.split(/[?#]/)[0];
    // try to decode URL-encoded parts (filename may contain encoded chars)
    try {
      // decode entire path; if malformed, fall back to original
      s = decodeURIComponent(s);
    } catch (e) {
      // ignore decode errors
    }
    return s;
  };

  if (removeList.length > 0) {
    for (const originalUrl of removeList) {
      const cleanedUrl = normalize(originalUrl);
      if (!cleanedUrl) continue;
      try {
        // Expect path like /uploads/products/<id>/filename
        if (cleanedUrl.startsWith('/uploads/products/')) {
          const rel = cleanedUrl.replace('/uploads/products/', '');
          const parts = rel.split('/');
          if (parts[0] === String(productId)) {
            const filename = parts.slice(1).join('/');
            // decode filename component again, defensively
            let filenameDecoded = filename;
            try { filenameDecoded = decodeURIComponent(filename); } catch (e) { /* ignore */ }
            const full = path.join(uploadDir, filenameDecoded);
            if (fs.existsSync(full)) {
              try {
                fs.unlinkSync(full);
                deletedFiles.push(cleanedUrl);
                console.log('Deleted file', full);
              } catch (err) {
                failedDeletes.push({ url: cleanedUrl, reason: String(err) });
                console.error('Failed to unlink file', full, err);
              }
            } else {
              // file does not exist on disk
              failedDeletes.push({ url: cleanedUrl, reason: 'not_found_on_disk' });
              console.log('File not found for deletion', full);
            }
          } else {
            // product id mismatch
            failedDeletes.push({ url: cleanedUrl, reason: 'product_id_mismatch' });
          }
        } else {
          // Not in uploads/products path — skip physical deletion but attempt to remove from DB
          failedDeletes.push({ url: cleanedUrl, reason: 'not_in_uploads_products_path' });
        }
      } catch (e) {
        failedDeletes.push({ url: cleanedUrl, reason: String(e) });
        console.error('Error deleting file', originalUrl, e);
      }

      // remove from all color buckets by normalized comparison
      Object.keys(existingByColor).forEach(k => {
        existingByColor[k] = (existingByColor[k] || []).filter((u: string) => normalize(u) !== cleanedUrl);
      });
    }
  }
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
          extraImages: Object.keys(existingByColor).length ? Object.values(existingByColor).flat().join(',') : allImages.join(','),
          imagesByColor: Object.keys(existingByColor).length ? existingByColor : null,
          specs: cleanedSpecs,
          manualUrl: manualUrl ? String(manualUrl) : null,
          dimensions: cleanedDimensions,
        },
      });
  const afterSnapshot = {
    imagesByColor: Object.keys(existingByColor).length ? existingByColor : null,
    extraImages: Object.keys(existingByColor).length ? Object.values(existingByColor).flat().join(',') : allImages.join(','),
  };

  return res.status(200).json({ updated, deleted: deletedFiles, failed: failedDeletes, before: beforeSnapshot, after: afterSnapshot });
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
