import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaCustomClient';

function formatPriceNumber(price: number) {
  // Redondea y formatea con punto como separador de miles: 79999 -> "79.999"
  const n = Math.round(price);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Extrae números relevantes (weight, sensor, polling, dpi) desde textos de specs/dimensions/descripcion
function extractSpecNumbersFromText(text: string) {
  const t = (text || '').replace(/\s+/g, ' ');

  // weight: busca "39 g" o "weight: 39g"
  const weightMatch = t.match(/weight[:\s]*([\d]{1,3})\s*g/i) || t.match(/(\d{1,3})\s*g/i);

  // sensor: detecta menciones a PAW3950 / 3950 / 3950HS etc.
  const sensorMatch = /PAW\s*?3950|3950HS|3950hs|3950/i.test(t) ? 3950 : null;

  // polling: "8000Hz" o "8000 Hz"
  const pollingMatch = t.match(/(\d{3,5})\s*Hz/i);

  // dpi: "30000 DPI" o "DPI: 30000"
  const dpiMatch = t.match(/(\d{4,6})\s*DPI/i) || t.match(/DPI[:\s]*([\d]{3,6})/i);

  const weight = weightMatch ? parseInt(weightMatch[1] || (weightMatch[0].match(/\d+/) || ['39'])[0], 10) : null;
  const sensor = sensorMatch ?? null;
  const polling = pollingMatch ? parseInt(pollingMatch[1], 10) : null;
  const dpi = dpiMatch ? parseInt(dpiMatch[1], 10) : null;

  return {
    weight,
    sensor,
    polling,
    dpi
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const productoId = parseInt(id as string);

  if (isNaN(productoId)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }

  if (req.method === 'GET') {
    try {
      const producto = await prisma.producto.findUnique({
        where: { id: productoId },
        include: { categoria: true }
      });

      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Campos de presentación: precio formateado y estado de stock
      const formattedPrice = formatPriceNumber(producto.precio);
      const stockLabel = producto.stock > 0 ? 'Disponible' : 'No disponible';
      const disponible = producto.stock > 0;

      // Extraer specs numéricas SOLO desde el campo 'specs' (etiqueta ESPECIFICACIONES)
      const combinedText = `${(producto as any).specs || ''}`;
      const extracted = extractSpecNumbersFromText(combinedText);

      // Si el modelo ya tuviera campos numéricos, úsalos; sino usa lo extraído, y por último fallback
      const weight = (producto as any).weight ?? extracted.weight ?? 39;
      const sensor = (producto as any).sensor ?? extracted.sensor ?? 3950;
      const polling = (producto as any).polling ?? extracted.polling ?? 8000;
      const dpi = (producto as any).dpi ?? extracted.dpi ?? 30000;

      return res.status(200).json({
        ...producto,
        formattedPrice,
        stockLabel,
        disponible,
        // Campos numéricos para los counters en UI
        weight,
        sensor,
        polling,
        dpi
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { nombre, descripcion, precio, stock, categoriaId, imagenUrl, marca } = req.body;
      
      const producto = await prisma.producto.update({
        where: { id: productoId },
        data: {
          nombre,
          descripcion,
          precio: parseFloat(precio),
          stock: parseInt(stock),
          categoriaId: parseInt(categoriaId),
          imagenUrl,
          marca: marca || null,
        }
      });

      const formattedPrice = formatPriceNumber(producto.precio);
      const stockLabel = producto.stock > 0 ? 'Disponible' : 'No disponible';
      const disponible = producto.stock > 0;
      
      return res.status(200).json({
        ...producto,
        formattedPrice,
        stockLabel,
        disponible
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ error: 'Error al actualizar el producto' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Eliminar la relación en featuredProduct si existe
      await prisma.featuredProduct.deleteMany({
        where: { productoId: productoId }
      });
      // Eliminar el producto
      await prisma.producto.delete({
        where: { id: productoId }
      });
      
      return res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  }

  res.status(405).json({ error: 'Método no permitido' });
}