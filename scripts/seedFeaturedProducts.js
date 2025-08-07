const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedFeaturedProducts() {
  console.log('Empezando a asignar productos destacados...');

  // Eliminar registros previos para evitar duplicados
  await prisma.featuredProduct.deleteMany({});

  // Obtener los primeros 4 productos de la base de datos para destacarlos
  const productos = await prisma.producto.findMany({
    take: 4,
    where: {
      stock: {
        gt: 0 // Solo productos con stock disponible
      }
    }
  });

  if (productos.length === 0) {
    console.log('No se encontraron productos para destacar. Por favor, asegúrate de tener productos en la base de datos.');
    return;
  }

  // Crear los productos destacados
  for (const producto of productos) {
    await prisma.featuredProduct.create({
      data: {
        productoId: producto.id
      }
    });
    console.log(`Producto destacado creado: ${producto.nombre}`);
  }

  console.log(`${productos.length} productos destacados creados exitosamente!`);
}

async function main() {
  try {
    await seedFeaturedProducts();
  } catch (error) {
    console.error('Error al crear los productos destacados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();