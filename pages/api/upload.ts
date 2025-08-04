import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Espera un archivo subido en req.body (usando formidable, multer, etc.)
  const filePath = path.join(process.cwd(), 'PEDIDO TECLADOS - MOUSE - PADS - ETC.xlsx');
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'Archivo no encontrado en la carpeta principal.' });
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  // Mapas de variantes para categorías
  const categoriaVariantes = {
    Teclados: ["teclado", "teclados"],
    Mouse: ["mouse", "mouses"],
    Mousepad: ["mousepad", "mousepads", "pad", "pads"],
    Accesorios: ["accesorio", "accesorios"],
    Audio: ["audio", "auricular", "auriculares"]
  };

  // Obtener todos los IDs de categorías por nombre
  const categoriasDb = await prisma.categoria.findMany();
  let count = 0;
  for (const row of rows) {
    if (!row.MODELO) continue;
    let categoriaNombre = String(row.PRODUCTO || '').toLowerCase().trim();
    let categoriaId = null;
    for (const catDb of categoriasDb) {
      const variantes = categoriaVariantes[catDb.nombre] || [];
      if (variantes.some(v => categoriaNombre.includes(v))) {
        categoriaId = catDb.id;
        break;
      }
    }
    if (!categoriaId) continue; // Ignorar si no hay coincidencia válida

    const existing = await prisma.producto.findFirst({ where: { nombre: String(row.MODELO) } });
    if (existing) {
      await prisma.producto.update({
        where: { id: existing.id },
        data: {
          descripcion: row.MARCA ? String(row.MARCA) : '',
          imagenUrl: row["ENLACE OFICIAL"] ? String(row["ENLACE OFICIAL"]) : '',
          categoriaId,
        }
      });
    } else {
      await prisma.producto.create({
        data: {
          nombre: String(row.MODELO),
          descripcion: row.MARCA ? String(row.MARCA) : '',
          precio: 0,
          stock: 0,
          categoriaId,
          imagenUrl: row["ENLACE OFICIAL"] ? String(row["ENLACE OFICIAL"]) : '',
        }
      });
    }
    count++;
  }

  return res.status(200).json({ message: `Importados ${count} productos desde el Excel.` });
}