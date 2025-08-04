import React, { useState } from 'react';
import { ShoppingCart, Search, User, Menu, X, Star, Zap, Gamepad2, Headphones, Monitor, Cpu, Mouse, Keyboard } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const GamingStore = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const featuredProducts = [
    {
      id: 1,
      name: "EpicTiger Pioneer Talismano V2",
      brand: "ESPTIGER",
      price: "$63.999",
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop",
      badge: "AGOTADO",
      badgeColor: "bg-red-500"
    },
    {
      id: 2,
      name: "Lamzu Maya X Gaming Mouse",
      brand: "LAMZU", 
      price: "$150.999",
      image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&h=300&fit=crop",
      badge: "AGOTADO",
      badgeColor: "bg-red-500"
    },
    {
      id: 3,
      name: "EpicTiger Yang Duo Gaming",
      brand: "ESPTIGER",
      price: "$63.999", 
      image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop",
      badge: "AGOTADO",
      badgeColor: "bg-red-500"
    },
    {
      id: 4,
      name: "GameSir Tarantula Pro",
      brand: "GAMESIR",
      price: "$129.999",
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=300&fit=crop",
      badge: "AGOTADO", 
      badgeColor: "bg-red-500"
    }
  ];

  const categories = [
    { name: "MOUSE", icon: <Mouse className="w-8 h-8" />, href: "/productos/mouse" },
    { name: "TECLADOS", icon: <Keyboard className="w-8 h-8" />, href: "/productos/teclados" },
    { name: "MOUSEPADS", icon: <div className="w-8 h-8 bg-current rounded" />, href: "/productos/mousepad" },
    { name: "ACCESORIOS", icon: <Gamepad2 className="w-8 h-8" />, href: "/productos/accesorios" },
    { name: "AURICULARES", icon: <Headphones className="w-8 h-8" />, href: "/productos/audio" }
  ];

  const promoCards = [
    {
      title: "¡Nuevo!",
      subtitle: "Lamzu Maya X",
      description: "El mouse más esperado del año",
      image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&h=400&fit=crop",
      bgColor: "bg-gradient-to-br from-gray-800 to-gray-900"
    },
    {
      title: "Lanzamiento",
      subtitle: "Serie Gaming Pro X",
      description: "Nueva línea de periféricos profesionales",
      image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=400&fit=crop", 
      bgColor: "bg-gradient-to-br from-yellow-600 to-orange-600"
    },
    {
      title: "¡Ya disponible!",
      subtitle: "Artisan FX Zero Black",
      description: "El mousepad favorito de los pros",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=400&fit=crop",
      bgColor: "bg-gradient-to-br from-gray-700 to-black"
    }
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
      {/* El resto del contenido de la página, sin el header hardcodeado */}

      {/* Hero Section */}
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
                <p className="text-red-600 font-medium">• Accesorios para <span className="underline">mouse gamer</span></p>
              </div>
              
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold text-lg transition-colors">
                EXPLORAR PRODUCTOS
              </button>
            </div>
            
            <div className="flex justify-center">
              <div className="bg-black text-white p-12 rounded-lg">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2"></div>
                  <div className="text-sm tracking-widest">AIM EXCHANGE</div>
                </div>
              </div>
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
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white ${product.badgeColor}`}>
                    {product.badge}
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-xs text-gray-500 font-semibold mb-1">{product.brand}</p>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">{product.name}</h3>
                  
                  <div className="text-lg font-bold text-gray-900 mb-3">{product.price}</div>
                  
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
            {promoCards.map((card, index) => (
              <div 
                key={index}
                className={`${card.bgColor} rounded-lg p-8 text-white relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                  <h4 className="text-xl mb-3">{card.subtitle}</h4>
                  <p className="text-sm mb-6 opacity-90">{card.description}</p>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold transition-colors">
                    Ver más
                  </button>
                </div>
                <div className="absolute right-0 top-0 w-32 h-32 opacity-20">
                  <img src={card.image} alt="" className="w-full h-full object-cover rounded" />
                </div>
              </div>
            ))}
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
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-black text-white p-8 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">AIM EXCHANGE</div>
              </div>
            </div>
          </div>
          <p className="text-gray-600">Tu destino premium para gaming y esports</p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default GamingStore;
