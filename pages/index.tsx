import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, X, Star, Zap, Gamepad2, Headphones, Monitor, Cpu, Mouse, Keyboard, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';
import { useCart } from '../components/CartContext';

const GamingStore = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [promoCards, setPromoCards] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoverMarquee, setHoverMarquee] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();
  
  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');
  
  useEffect(() => {
    fetch('/api/promocards')
      .then(res => res.json())
      .then(setPromoCards);
    fetch('/api/featured-products')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data.map(fp => fp.producto)));
  }, []);

  // Función para manejar la búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push({
      pathname: '/productos/search',
      query: { q: searchTerm }
    });
  };

  const categories = [
    { 
      name: "MOUSE", 
      icon: <Mouse className="w-8 h-8" />, 
      href: "/productos/mouse",
      bgImage: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
    },
    { 
      name: "TECLADOS", 
      icon: <Keyboard className="w-8 h-8" />, 
      href: "/productos/teclados",
      bgImage: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
    },
    { 
      name: "MOUSEPADS", 
      icon: <div className="w-8 h-8 bg-current rounded" />, 
      href: "/productos/mousepad",
      bgImage: "https://images.pexels.com/photos/7915254/pexels-photo-7915254.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    },
    { 
      name: "ACCESORIOS", 
      icon: <Gamepad2 className="w-8 h-8" />, 
      href: "/productos/accesorios",
      bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
    },
    { 
      name: "AURICULARES", 
      icon: <Headphones className="w-8 h-8" />, 
      href: "/productos/audio",
      bgImage: "https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
    }
  ];

  const addToCart = (product) => {
    const item = {
      id: product.id,
      name: product.nombre,
      price: product.precio,
      image: product.imagenUrl,
      quantity: 1
    };
    addItem(item);
    setAddedProductName(product.nombre);
    setShowModal(true);
  };
  
  const handleGoToCart = () => {
    setShowModal(false);
    router.push('/carrito');
  };
  
  const handleContinueShopping = () => {
    setShowModal(false);
  };

  // Agrupar productos por categorías para el desplazamiento horizontal
  const productsByCategory = featuredProducts.reduce((acc, product) => {
    const category = product.categoria?.nombre || 'Otros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-black py-2 text-center">
        <span className="text-white font-semibold">Unite a nuestra comunidad en Discord!</span>
        <a
          href="https://discord.com/invite/tu-enlace" // Reemplaza por tu enlace real
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-red-600 font-bold hover:underline"
        >
          UNITE AHORA
        </a>
      </div>
      <Navbar />

      {/* Hero Section con producto destacado */}
      <section className="relative h-[80vh] bg-gradient-to-b from-black to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-black via-transparent to-transparent z-10 absolute"></div>
          <img 
            src="/logos/logoaimexchangehd.png" 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-contain object-center opacity-20"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center">
          <div className="container mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-8 lg:mb-0 space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="text-red-600">AIM</span> EXCHANGE
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                Tu destino premium para equipamiento gaming y esports.
              </p>
              <button onClick={() => router.push('/productos/mouse')} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-bold text-lg transition-colors inline-flex items-center">
                COMPRAR AHORA <ChevronRight className="ml-2" />
              </button>
            </div>
            <div className="lg:w-1/2 relative">
              {featuredProducts.length > 0 && (
                <img 
                  src={featuredProducts[0]?.imagenUrl} 
                  alt={featuredProducts[0]?.nombre} 
                  className="w-full max-h-[50vh] object-contain transform hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Banner con marquee dinámico */}
      <div
        className="bg-red-600 py-6 overflow-hidden"
        onMouseEnter={() => setHoverMarquee(true)}
        onMouseLeave={() => setHoverMarquee(false)}
      >
        <div
          className="flex whitespace-nowrap space-x-8 animate-marquee"
          style={{ animationPlayState: hoverMarquee ? 'paused' : 'running' }}
        >
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="inline-flex items-center space-x-2">
                <a
                  href="/producto/1"
                  className="text-white font-bold text-lg"
                >
                  ⚔️ WLMOUSE x The Swords 《剑来》
                </a>
                <span className="text-white font-bold text-lg">– Now Available!</span>
              </div>
            ))}
        </div>
      </div>

      {/* Categorías con efecto "Card Fan Out / Accordion" */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="text-red-600">CATEGORÍAS</span>
          </h2>
          
          <div className="flex overflow-hidden h-64">
            {categories.map((category, index) => {
              // Determinar si es el último elemento (auriculares)
              const isLastItem = index === categories.length - 1;
              
              return (
                <a 
                  key={index}
                  href={category.href}
                  className="group flex-1 hover:flex-[3] transition-all duration-500 ease-in-out relative overflow-hidden border border-black"
                  style={{ 
                    background: `url('${category.bgImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transformOrigin: isLastItem ? 'right' : 'left',
                  }}
                >
                  {/* Overlay solo en la parte inferior para el texto */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                    <div className="text-red-600 text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white text-center drop-shadow-lg">{category.name}</h3>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Productos destacados con scroll horizontal */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="text-red-600">PRODUCTOS</span> DESTACADOS
          </h2>
          
          <div className="flex overflow-x-auto pb-6 space-x-6 scrollbar-hide">
            {featuredProducts.map((product) => (
              <div 
                key={product.id}
                className="flex-shrink-0 w-64 bg-black rounded-lg shadow-lg overflow-hidden group hover:shadow-red-600/30 transition-all"
              >
                <div className="relative aspect-square bg-gradient-to-b from-gray-800 to-black p-4">
                  <img 
                    src={product.imagenUrl} 
                    alt={product.nombre}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-bold text-white bg-red-600">
                      AGOTADO
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 font-semibold">{product.marca}</p>
                  <h3 className="text-sm font-medium text-white mb-3 line-clamp-2 h-10">{product.nombre}</h3>
                  <div className="text-lg font-bold text-red-600 mb-4">${product.precio.toLocaleString()}</div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors text-sm"
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'AGOTADO' : 'COMPRAR AHORA'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarjetas promocionales con diseño moderno */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="text-red-600">NUEVOS</span> LANZAMIENTOS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {promoCards.map((card, index) => (
              <div 
                key={index}
                className="relative overflow-hidden rounded-lg aspect-video group"
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"
                ></div>
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-red-900/50 to-transparent z-0"
                ></div>
                <img 
                  src={card.imageUrl || "/logos/logoaimexchangehd.png"} 
                  alt={card.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="p-6 absolute bottom-0 left-0 right-0 z-20">
                  <h3 className="text-2xl font-bold mb-1 text-white">{card.title}</h3>
                  <h4 className="text-xl font-medium mb-1 text-red-400">{card.subtitle}</h4>
                  <p className="text-sm mb-4 text-gray-300 max-w-xs">{card.description}</p>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                    Ver más
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección tipo "Mouse Skates" y "Grip Tapes" */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg overflow-hidden relative flex items-center p-8">
              <div className="w-1/2">
                <h3 className="text-2xl font-bold mb-4 text-white">Mousepads Premium</h3>
                <button onClick={() => router.push('/productos/mousepad')} className="bg-white text-red-600 hover:bg-gray-200 px-6 py-2 rounded-full font-medium text-sm transition-colors">
                  COMPRAR AHORA
                </button>
              </div>
              <div className="w-1/2 flex justify-end">
                <img 
                  src="/logos/logoaimexchangehd.png" 
                  alt="Mousepads" 
                  className="max-w-full h-48 object-contain"
                />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg overflow-hidden relative flex items-center p-8">
              <div className="w-1/2">
                <h3 className="text-2xl font-bold mb-4 text-white">Accesorios Gaming</h3>
                <button onClick={() => router.push('/productos/accesorios')} className="bg-white text-red-600 hover:bg-gray-200 px-6 py-2 rounded-full font-medium text-sm transition-colors">
                  COMPRAR AHORA
                </button>
              </div>
              <div className="w-1/2 flex justify-end">
                <img 
                  src="/logos/logoaimexchangehd.png" 
                  alt="Accesorios" 
                  className="max-w-full h-48 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner comunitario */}
      <section className="py-12 bg-red-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900 to-transparent"></div>
          <img src="/logos/logoaimexchangeconletrashd.jpeg" alt="Community" className="w-full h-full object-cover object-center opacity-10" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">ÚNETE A LA COMUNIDAD AIM EXCHANGE</h2>
              <p className="text-white text-opacity-80 max-w-lg">Sé parte de nuestra comunidad de gamers y entérate de las últimas novedades, torneos y descuentos exclusivos.</p>
            </div>
            <button className="hidden md:block bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition-colors">
              UNIRSE AHORA
            </button>
          </div>
          <button className="mt-4 md:hidden w-full bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition-colors">
            UNIRSE AHORA
          </button>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            ¿Quieres ser el <span className="text-red-600">primero en enterarte</span> de nuestras ofertas?
          </h2>
          <p className="text-gray-400 mb-8">
            Suscríbete para recibir noticias sobre nuevos productos, descuentos exclusivos y guías gaming.
          </p>
          <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-2">
            <input 
              type="email" 
              placeholder="Tu correo electrónico"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-red-500 text-white"
            />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-bold transition-colors">
              SUSCRIBIRSE
            </button>
          </form>
        </div>
      </section>
      
      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full animate-fade-in">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">¡Producto agregado al carrito!</h3>
              <p className="text-gray-400 mt-2">{addedProductName}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button 
                onClick={handleContinueShopping}
                className="px-4 py-2 border border-gray-700 rounded text-gray-300 hover:bg-gray-800 flex-1 font-medium"
              >
                Seguir comprando
              </button>
              <button 
                onClick={handleGoToCart}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex-1 font-bold"
              >
                Ir al carrito
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default GamingStore;
