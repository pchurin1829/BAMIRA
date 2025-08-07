const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePromoCards() {
  console.log('Actualizando tarjetas promocionales...');

  // Convertir las clases de Tailwind a valores hexadecimales
  const cardUpdates = [
    {
      title: "¡Nuevo!",
      subtitle: "Lamzu Maya X",
      description: "El mouse más esperado del año",
      imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&h=400&fit=crop",
      bgColor: "#1f2937" // Equivalente a from-gray-800 to-gray-900
    },
    {
      title: "Lanzamiento",
      subtitle: "Serie Gaming Pro X",
      description: "Nueva línea de periféricos profesionales",
      imageUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=400&fit=crop", 
      bgColor: "#d97706" // Equivalente a from-yellow-600 to-orange-600
    },
    {
      title: "¡Ya disponible!",
      subtitle: "Artisan FX Zero Black",
      description: "El mousepad favorito de los pros",
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=400&fit=crop",
      bgColor: "#111827" // Equivalente a from-gray-700 to-black
    }
  ];

  // Eliminar todas las tarjetas existentes
  await prisma.promoCard.deleteMany({});

  // Crear las nuevas tarjetas con valores hexadecimales
  for (const card of cardUpdates) {
    await prisma.promoCard.create({ data: card });
    console.log(`Tarjeta creada: ${card.title}`);
  }

  console.log('Tarjetas promocionales actualizadas exitosamente!');
}

async function main() {
  try {
    await updatePromoCards();
  } catch (error) {
    console.error('Error al actualizar las tarjetas promocionales:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();