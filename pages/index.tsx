import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, X, Star, Zap, Gamepad2, Headphones, Monitor, Cpu, Mouse, Keyboard } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const GamingStore = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const categories = [
    { name: "MOUSE", icon: <Mouse className="w-8 h-8" />, href: "/productos/mouse" },
    { name: "TECLADOS", icon: <Keyboard className="w-8 h-8" />, href: "/productos/teclados" },
    { name: "MOUSEPADS", icon: <div className="w-8 h-8 bg-current rounded" />, href: "/productos/mousepad" },
    { name: "ACCESORIOS", icon: <Gamepad2 className="w-8 h-8" />, href: "/productos/accesorios" },
    { name: "AURICULARES", icon: <Headphones className="w-8 h-8" />, href: "/productos/audio" }
  ];

  const addToCart = (productId) => {
    setCartCount(cartCount + 1);
  };

  const handleAccountClick = () => {
    // Lógica para manejar el clic en la cuenta
    console.log("Cuenta clickeada");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero Section con logo */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 mb-2">¡Bienvenido a <span className="text-red-600 font-bold">Aim Exchange</span>, el lugar ideal para los apasionados del gaming y los esports!</p>
                <p className="text-gray-600">Nos especializamos en ofrecerte un catálogo amplio y variado para todo tipo de jugadores.</p>
              </div>
              <div className="space-y-2">
                <p className="text-red-600 font-medium">• Periféricos de alto rendimiento</p>
                <p className="text-red-600 font-medium">• Accesorios</p>
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold text-lg transition-colors">
                EXPLORAR PRODUCTOS
              </button>
            </div>
            <div className="flex justify-center">
              <img src="/logos/logoaimexchangeconletrashd.jpeg" alt="Aim Exchange Logo" className="h-44 w-auto rounded-lg shadow-lg bg-black p-4" />
            </div>
          </div>
        </div>
      </section>



      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Encuentra tu <span className="text-red-600">próximo equipamiento</span>
          </h2>
          <p className="text-gray-600 mb-8">
            Busca entre nuestra amplia colección de periféricos y accesorios gaming de alta calidad
          </p>
          <div className="flex max-w-lg mx-auto">
            <input 
              type="text" 
              placeholder="Buscar productos..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-red-500"
            />
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-r-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="relative">
                  <img 
                    src={product.imagenUrl} 
                    alt={product.nombre}
                    className="w-full h-48 object-cover"
                  />
                  {product.stock === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white bg-red-500">
                      AGOTADO
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 font-semibold mb-1">{product.marca}</p>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">{product.nombre}</h3>
                  <div className="text-lg font-bold text-gray-900 mb-3">${product.precio}</div>
                  <button 
                    onClick={() => addToCart(product.id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors text-sm"
                  >
                    Comprar ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded font-medium transition-colors">
              Ver más
            </button>
          </div>
        </div>
      </section>

      {/* Promotional Cards */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promoCards.map((card, index) => {
              // Manejar tanto valores hexadecimales como clases de Tailwind
              const isHexColor = card.bgColor && (card.bgColor.startsWith('#') || card.bgColor.startsWith('rgb'));
              
              return (
                <div 
                  key={index}
                  style={isHexColor ? { background: card.bgColor } : {}}
                  className={`${!isHexColor ? card.bgColor || 'bg-gray-800' : ''} rounded-lg overflow-hidden`}
                >
                  <div className="p-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">{card.title}</h3>
                    <h4 className="text-xl font-medium mb-1">{card.subtitle}</h4>
                    <p className="text-sm mb-4">{card.description}</p>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                      Ver más
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Categorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <a 
                key={index}
                href={category.href}
                className="text-center group cursor-pointer no-underline"
              >
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-red-600 mb-3 flex justify-center group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter & Footer Combined */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Newsletter */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Únete a la <span className="text-red-600">comunidad Aim Exchange</span>
          </h2>
          <p className="text-gray-600 mb-6">
            Suscríbete para recibir noticias sobre nuevos productos, descuentos exclusivos y guías gaming.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-2 mb-12">
            <input 
              type="email" 
              placeholder="Tu correo electrónico"
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-500"
            />
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold transition-colors">
              SUSCRIBIRSE
            </button>
          </div>
          {/* Logo grande */}
          <div className="flex justify-center mb-8">
            <img src="/logos/logoaimexchangeconletrashd.jpeg" alt="Aim Exchange Logo" className="h-24 w-auto rounded-lg shadow-lg bg-black p-4" />
          </div>
          <p className="text-gray-600">Tu destino premium para gaming y esports</p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default GamingStore;
