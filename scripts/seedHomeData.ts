import fetch from 'node-fetch';

async function seedPromoCards() {
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
    await fetch('http://localhost:3000/api/promocards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });
  }
}

async function seedFeaturedProducts() {
  // Debes crear los productos primero y obtener sus IDs reales
  // Aquí solo se muestra la estructura, debes adaptar los IDs según tu base
  const featured = [
    { productoId: 1 },
    { productoId: 2 },
    { productoId: 3 },
    { productoId: 4 }
  ];
  for (const fp of featured) {
    await fetch('http://localhost:3000/api/featured-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fp)
    });
  }
}

async function main() {
  await seedPromoCards();
  await seedFeaturedProducts();
  console.log('Datos iniciales insertados');
}

main();