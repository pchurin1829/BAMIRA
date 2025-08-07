const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPromoCards() {
  console.log('Empezando a crear PromoCards de ejemplo...');

  // Eliminar registros previos para evitar duplicados
  await prisma.promoCard.deleteMany({});

  // Crear las PromoCards
  const promoCards = [
    {
      title: "¡Nuevo!",
      subtitle: "Lamzu Maya X",
      description: "El mouse más esperado del año",
      imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&h=400&fit=crop",
      bgColor: "bg-gradient-to-br from-gray-800 to-gray-900"
    },
    {
      title: "Lanzamiento",
      subtitle: "Serie Gaming Pro X",
      description: "Nueva línea de periféricos profesionales",
      imageUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=400&fit=crop", 
      bgColor: "bg-gradient-to-br from-yellow-600 to-orange-600"
    },
    {
      title: "¡Ya disponible!",
      subtitle: "Artisan FX Zero Black",
      description: "El mousepad favorito de los pros",
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=400&fit=crop",
      bgColor: "bg-gradient-to-br from-gray-700 to-black"
    }
  ];

  for (const card of promoCards) {
    await prisma.promoCard.create({ data: card });
  }

  console.log('PromoCards creadas exitosamente!');
}

async function main() {
  try {
    await seedPromoCards();
  } catch (error) {
    console.error('Error al crear las PromoCards:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();