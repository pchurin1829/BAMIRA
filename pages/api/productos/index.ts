import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { search, categoria } = req.query;
    let where: any = {};
    if (search && typeof search === 'string') {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (categoria && typeof categoria === 'string') {
      // Buscar el id de la categoría por nombre (coincidencia exacta, insensible)
      const categorias = await prisma.categoria.findMany();
      const cat = categorias.find(c => c.nombre.toLowerCase() === categoria.toLowerCase());
      if (cat) {
        where.categoriaId = cat.id;
      } else {
        return res.status(200).json({ productos: [] });
      }
    }
    const productos = await prisma.producto.findMany({ where });
    return res.status(200).json({ productos });
  }
  if (req.method === 'POST') {
    const { nombre, marca, descripcion, precio, stock, categoriaId, imagenUrl } = req.body;
    const producto = await prisma.producto.create({
      data: {
        nombre,
        marca,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        categoriaId: parseInt(categoriaId),
        imagenUrl,
      },
    });
    return res.status(201).json({ producto });
  }
  res.status(405).json({ error: 'Método no permitido' });
}