import { prisma } from '../lib/prisma';

async function swapDescripcionMarca() {
  const productos = await prisma.producto.findMany();
  for (const prod of productos) {
    await prisma.producto.update({
      where: { id: prod.id },
      data: {
        marca: prod.descripcion,
        descripcion: prod.marca ?? '',
      },
    });
  }
  console.log('Swap completado.');
  process.exit(0);
}

swapDescripcionMarca().catch(e => { console.error(e); process.exit(1); });
