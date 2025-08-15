import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaCustomClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { search, categoria } = req.query;
      let where: any = {};
      
      // Búsqueda por texto (versión compatible con SQLite)
      if (search && typeof search === 'string') {
        // Uso de búsqueda case-insensitive en PostgreSQL
        where.OR = [
          { nombre: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } },
          { marca: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      // Filtro por categoría usando relación anidada
      if (categoria && typeof categoria === 'string') {
        where.categoria = { nombre: categoria };
      }
      
      // Obtener productos con su categoría
      const productos = await prisma.producto.findMany({
        where,
        include: {
          categoria: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });
      
      // Registrar mensaje de búsqueda solo cuando hay un término de búsqueda definido
      if (search) {
        console.log(`Búsqueda: "${search}", Encontrados: ${productos.length} productos`);
      } else if (categoria) {
        console.log(`Categoría: "${categoria}", Encontrados: ${productos.length} productos`);
      } else {
        console.log(`Total productos encontrados: ${productos.length}`);
      }
      
      // Devolver directamente el array de productos para facilitar el uso en el frontend
  res.status(200).json(productos);
  return;
    } catch (error) {
      console.error('Error al buscar productos:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
  return;
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { nombre, descripcion, precio, stock, categoriaId, imagenUrl, marca } = req.body;
      
      const producto = await prisma.producto.create({
        data: {
          nombre,
          descripcion,
          precio: parseFloat(precio),
          stock: parseInt(stock),
          categoriaId: parseInt(categoriaId),
          imagenUrl,
          marca: marca || null,
        },
      });
      
  res.status(201).json(producto);
  return;
    } catch (error) {
      console.error('Error al crear producto:', error);
      return res.status(500).json({ error: 'Error al crear el producto' });
    }
  }
  
  res.status(405).json({ error: 'Método no permitido' });
  return;
}