import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration: extraImages -> imagesByColor.default');
  const productos = await prisma.producto.findMany({ where: { extraImages: { not: null } } });
  console.log(`Found ${productos.length} products with extraImages`);
  for (const p of productos) {
    try {
      const arr = p.extraImages ? String(p.extraImages).split(',').filter(Boolean) : [];
      if (arr.length === 0) continue;
  const byColor = { default: arr };
  await prisma.producto.update({ where: { id: p.id }, data: { imagesByColor: byColor } });
      console.log(`Updated product ${p.id} with ${arr.length} images`);
    } catch (e) {
      console.error('Failed updating product', p.id, e);
    }
  }
  console.log('Migration complete');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
