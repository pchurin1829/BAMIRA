import { useEffect, useState } from 'react';

export default function CurrentHomePreview() {
  const [promoCards, setPromoCards] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetch('/api/promocards')
      .then(res => res.json())
      .then(setPromoCards);
    fetch('/api/featured-products')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data.map(fp => fp.producto)));
  }, []);

  return (
    <div className="space-y-8">
      {/* Tarjetas Promocionales */}
      <div>
        <h3 className="text-lg font-bold mb-2 text-center">Tarjetas Promocionales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promoCards.map(card => (
            <div key={card.id} className="rounded-lg p-6 text-white relative overflow-hidden" style={{ background: card.bgColor }}>
              {card.imageUrl && (
                <div className="absolute right-0 top-0 w-24 h-24 opacity-20">
                  <img src={card.imageUrl} alt="img" className="w-full h-full object-cover rounded" />
                </div>
              )}
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-1">{card.title}</h4>
                <h5 className="text-lg mb-2">{card.subtitle}</h5>
                <p className="text-sm mb-2 opacity-90">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Productos Destacados */}
      <div>
        <h3 className="text-lg font-bold mb-2 text-center">Productos Destacados</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {featuredProducts.map(product => (
            <div key={product.id} className="bg-gray-900 rounded-lg shadow p-4 overflow-hidden text-white">
              {product.imagenUrl && (
                <img src={product.imagenUrl} alt={product.nombre} className="w-full h-24 object-contain mb-2 rounded" />
              )}
              <h4 className="font-bold text-lg mb-1">{product.nombre}</h4>
              <p className="text-xs text-gray-400 mb-1">{product.marca}</p>
              <p className="text-sm text-gray-300 mb-2">{product.descripcion}</p>
              <div className="text-red-600 font-bold">${product.precio}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}