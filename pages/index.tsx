import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, X, Star, Zap, Gamepad2, Headphones, Monitor, Cpu, Mouse, Keyboard, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCart } from '../components/CartContext';
import Link from 'next/link';

const GamingStore = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [promoCards, setPromoCards] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoverMarquee, setHoverMarquee] = useState(false);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const animationRef = React.useRef<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const router = useRouter();
  const { addItem } = useCart();
  
  // Formato de precios con punto como separador de miles (ej: 180.000)
  const formatPrice = (value: number) => {
    try {
      return new Intl.NumberFormat('es-ES').format(value);
    } catch {
      return String(value);
    }
  };
  
  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');
  
  useEffect(() => {
    fetch('/api/featured-products')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data.map(fp => fp.producto)));
  }, []);

  // Marquee perfecto con medidas exactas
  useEffect(() => {
    if (!marqueeRef.current) return;

    const marqueeElement = marqueeRef.current;
    const speed = 1; // píxeles por frame
    
    const animate = () => {
      if (!hoverMarquee && marqueeElement) {
        // Obtener el ancho exacto del contenido
        const contentWidth = marqueeElement.scrollWidth / 2; // dividir por 2 porque duplicamos
        
        setCurrentPosition(prev => {
          const newPos = prev - speed;
          // Reset exacto cuando hemos movido exactamente el ancho del contenido
          return newPos <= -contentWidth ? 0 : newPos;
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hoverMarquee]);

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
      name: "AUDIO", 
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

  const [mosaicLeft, setMosaicLeft] = useState('0.90fr');
  const [mosaicMiddle, setMosaicMiddle] = useState('0.85fr');
  const [mosaicRight, setMosaicRight] = useState('0.90fr');
  const [mosaicGap, setMosaicGap] = useState('0.75rem');

  // Mapea clases de tamaño de título por índice de card (ajustalo aquí)
  const titleClassMap: Record<number, string> = {
    0: 'text-3xl md:text-2xl lg:text-6xl', // izquierda (antes text-5xl/6xl/7xl)
    1: 'text-2xl md:text-3xl',             // centro arriba (si tuviera título)
    2: 'text-4xl md:text-5xl',             // centro abajo (antes text-4xl/5xl)
    3: 'text-5xl md:text-6xl lg:text-7xl'  // derecha (antes text-5xl/6xl/7xl)
  };
  
  return (
    <>
      <Head>
        <title>AIM EXCHANGE</title>
        <meta name="description" content="Tu destino premium para equipamiento gaming y esports." />
        <meta property="og:title" content="AIM EXCHANGE - Tu destino premium para perifericos gaming" />
        <meta property="og:description" content="Tu destino premium para equipamiento gaming y esports." />
        <meta property="og:image" content="https://aimexchange.com.ar/logos/logoaimexchangeconletrashd.jpeg" />
        <meta property="og:url" content="https://aimexchange.com.ar" />
        <meta property="og:type" content="website" />
      </Head>
      <div className="min-h-screen bg-black text-white">
        <div className="bg-gray-700 py-2 text-center">
          <span className="text-white font-semibold">Sumate a nuestro Discord!</span>
          <a
            href="https://discord.com/invite/KPctbF49" // Reemplaza por tu enlace real
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
              src="/logos/logoaimexchangepnghd.png" 
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
          className="bg-red-700 py-6 overflow-hidden"
          onMouseEnter={() => setHoverMarquee(true)}
          onMouseLeave={() => setHoverMarquee(false)}
        >
          <div
            ref={marqueeRef}
            className="flex whitespace-nowrap"
            style={{ 
              transform: `translateX(${currentPosition}px)`,
              transition: 'none'
            }}
          >
            {/* Contenido original */}
            <div className="flex whitespace-nowrap">
              {Array.from({ length: 15 }).map((_, i) => (
                <span key={`original-${i}`} className="inline-block mr-8 text-white font-bold text-lg flex-shrink-0">
                  <a href="/producto/1" className="text-white hover:text-gray-200 transition-colors">
                    ⚔️ WLMOUSE x The Swords 《剑来》
                  </a>
                  {" – Ya Disponible!"}
                </span>
              ))}
            </div>
            {/* Copia exacta para loop perfecto */}
            <div className="flex whitespace-nowrap">
              {Array.from({ length: 15 }).map((_, i) => (
                <span key={`copy-${i}`} className="inline-block mr-8 text-white font-bold text-lg flex-shrink-0">
                  <a href="/producto/1" className="text-white hover:text-gray-200 transition-colors">
                    ⚔️ WLMOUSE x The Swords 《剑来》
                  </a>
                  {" – Ya Disponible!"}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Categorías con efecto "Card Fan Out / Accordion" */}
        <section className="py-16 bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Productos destacados con scroll horizontal (mostrar 3 juntos más grandes) */}
        <section className="py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="text-red-600">PRODUCTOS</span> DESTACADOS
            </h2>

            {/* contenedor con scroll horizontal; los items usan flex-basis calculado para mostrar 3 por vista */}
            <div className="overflow-x-auto pb-6">
              <div
                className="flex items-start"
                style={{ gap: '1.5rem' }} // coincide con space-x-6 (1.5rem)
              >
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-black rounded-lg shadow-lg overflow-hidden group hover:shadow-red-600/30 transition-all flex-shrink-0"
                    // Mostrar 3 cards visibles: restamos 2 gaps (2 * 1.5rem = 3rem)
                    style={{ flex: '0 0 calc((100% - 3rem) / 3)', minWidth: '220px' }}
                  >
                    <div className="relative aspect-square bg-gradient-to-b from-gray-800 to-black p-4">
                      <Link href={`/producto/${product.id}`} className="block w-full h-full">
                        <img
                          src={product.imagenUrl}
                          alt={product.nombre}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      {product.stock === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-bold text-white bg-red-600">
                          AGOTADO
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 font-semibold">{product.marca}</p>
                      <Link href={`/producto/${product.id}`} className="block">
                        <h3 className="text-sm font-medium text-white mb-2 line-clamp-2 h-10 hover:underline">{product.nombre}</h3>
                        <div className="text-lg font-bold text-red-600 mb-4">${formatPrice(product.precio)}</div>
                      </Link>
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
          </div>
        </section>

        {/* Tarjetas promocionales con diseño moderno */}
        <section className="py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="text-red-600">NUEVOS</span> LANZAMIENTOS
            </h2>
            <div
              className="grid grid-cols-1 gap-4 md:gap-6 items-stretch banners-mosaic"
              style={
                {
                  '--mosaic-left': mosaicLeft,
                  '--mosaic-middle': mosaicMiddle,
                  '--mosaic-right': mosaicRight,
                  '--mosaic-gap': mosaicGap
                } as React.CSSProperties
              }
            >
              {/* prepare 4 cards: prefer API data, fall back to placeholders so layout is always correct */}
              {
                (() => {
                  const placeholders = [
                    { productoId: 1, title: 'Beast X Mini Pro', subtitle: '', imageUrl: '/logos/new-beast-x.png' },
                    { productoId: 2, title: '', subtitle: '', imageUrl: '/logos/wlmouse-beast-x-pro-7.png' },
                    { productoId: 3, title: 'Beast X Pro', subtitle: '', imageUrl: '/logos/wlmouse-beast-x-pro-6.png' },
                    { productoId: 4, title: 'Beast X Max', subtitle: '', imageUrl: '/logos/web-9.png' }
                  ];

                  const displayedPromoCards = Array.from({ length: 4 }).map((_, i) => {
                    return (promoCards && promoCards[i]) ? promoCards[i] : placeholders[i];
                  });

                  return displayedPromoCards.map((card: any, index: number) => {
                    const productId = card?.productoId || card?.productId || card?.product?.id;
                    const img = card.imageUrl || card.imagenUrl || card.image || '/logos/logoaimexchangehd.png';
                    const layoutMap: Record<number, string> = {
                      // alturas base (móvil) + alturas mayores en md
                      0: 'h-[360px] md:col-span-1 md:row-span-2 md:h-[440px]', // left tall
                      1: 'h-[160px] md:col-span-1 md:row-span-1 md:h-[160px]', // mid top
                      2: 'h-[240px] md:col-span-1 md:row-span-1 md:h-[260px]', // mid bottom
                      3: 'h-[360px] md:col-span-1 md:row-span-2 md:h-[440px]'  // right tall
                    };

                    const positioning = layoutMap[index] || '';

                    // index 0: left tall pink card -> image fills card
                    if (index === 0) {
                      return (
                        <div
                          key={`promo-${index}`}
                          data-mosaic-index={index}
                          className={`relative overflow-hidden rounded-2xl group ${positioning} cursor-pointer bg-gradient-to-br from-pink-200 via-pink-300 to-pink-100`}
                          onClick={() => { if (productId) router.push(`/producto/${productId}`); }}
                          role={productId ? 'link' : undefined}
                          tabIndex={productId ? 0 : -1}
                        >
                          {/* imagen que llena la card */}
                          <div className="absolute inset-0 z-0">
                            <img
                              src={img}
                              alt={card.title || `promo-${index}`}
                              className="w-full h-full object-cover transform-gpu transition-transform duration-600 ease-out group-hover:scale-110"
                            />
                          </div>

                          {/* overlay semi-transparente para contraste */}
                          <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none rounded-2xl"></div>

                          {card.title && (
                            <div className="absolute top-6 left-6 z-20 pointer-events-none max-w-[55%]">
                              <h3 className={`${titleClassMap[0]} font-extrabold text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)] leading-tight`}>{card.title}</h3>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // index 3: right tall purple card -> image fills card
                    if (index === 3) {
                      return (
                        <div
                          key={`promo-${index}`}
                          data-mosaic-index={index}
                          className={`relative overflow-hidden rounded-2xl group ${positioning} cursor-pointer bg-gradient-to-br from-violet-200 to-violet-300`}
                          onClick={() => { if (productId) router.push(`/producto/${productId}`); }}
                          role={productId ? 'link' : undefined}
                          tabIndex={productId ? 0 : -1}
                        >
                          <div className="absolute inset-0 z-0">
                            <img
                              src={img}
                              alt={card.title || `promo-${index}`}
                              className="w-full h-full object-cover transform-gpu transition-transform duration-600 ease-out group-hover:scale-105"
                            />
                          </div>

                          <div className="absolute inset-0 bg-black/12 z-10 pointer-events-none rounded-2xl"></div>

                          {card.title && (
                            <div className="absolute top-6 left-6 z-20 pointer-events-none max-w-[55%]">
                              <h3 className={`${titleClassMap[3]} font-extrabold text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)] leading-tight`}>{card.title}</h3>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // index 1: middle top small grey card -> image fills card
                    if (index === 1) {
                      return (
                        <div
                          key={`promo-${index}`}
                          data-mosaic-index={index}
                          className={`relative overflow-hidden rounded-lg group ${positioning} bg-gray-100 cursor-pointer`}
                          onClick={() => { if (productId) router.push(`/producto/${productId}`); }}
                          role={productId ? 'link' : undefined}
                          tabIndex={productId ? 0 : -1}
                        >
                          <div className="absolute inset-0 z-0">
                            <img src={img} alt={card.title || `promo-${index}`} className="w-full h-full object-cover transform-gpu transition-transform duration-600 ease-out group-hover:scale-105" />
                          </div>
                          <div className="absolute inset-0 bg-black/6 z-10 pointer-events-none rounded-lg"></div>
                        </div>
                      );
                    }

                    // index 2: middle bottom medium pastel with centered title -> image fills card
                    return (
                      <div
                        key={`promo-${index}`}
                        data-mosaic-index={index}
                        className={`relative overflow-hidden rounded-lg group ${positioning} cursor-pointer`}
                        onClick={() => { if (productId) router.push(`/producto/${productId}`); }}
                        role={productId ? 'link' : undefined}
                        tabIndex={productId ? 0 : -1}
                      >
                        <div className="absolute inset-0 z-0">
                          <img src={img} alt={card.title || `promo-${index}`} className="w-full h-full object-cover transform-gpu transition-transform duration-600 ease-out group-hover:scale-105" />
                        </div>
                        <div className="absolute inset-0 bg-black/8 z-10 pointer-events-none rounded-lg"></div>

                        {card.title && (
                          <div className="absolute right-6 bottom-6 z-20 pointer-events-none">
                            <h3 className={`${titleClassMap[2]} font-extrabold text-white drop-shadow-lg leading-tight`}>{card.title}</h3>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()
              }
              {/* Desired 4-card layout: [0] left tall (row-span-2), [1] middle top, [2] middle bottom, [3] right tall (row-span-2) */}
              {/* DB promo cards hidden for now */}
              {/* {promoCards.slice(0, 4).map((card, index) => {
                const productId = (card as any).productoId || (card as any).productId || (card as any).product?.id;
                const img = card.imageUrl || '/logos/logoaimexchangehd.png';

                // layout and sizing per position to match the reference
                const layoutMap: Record<number, string> = {
                  0: 'md:col-span-1 md:row-span-2 md:min-h-[520px]',
                  1: 'md:col-span-1 md:row-span-1 md:min-h-[220px]',
                  2: 'md:col-span-1 md:row-span-1 md:min-h-[320px]',
                  3: 'md:col-span-1 md:row-span-2 md:min-h-[520px]'
                };

                const positioning = layoutMap[index] || '';

                if (index === 0) {
                  // special left-tall card to match reference image: pink gradient, huge title, image on left-bottom
                  return (
                    <div
                      key={index}
                      className={`relative overflow-hidden rounded-2xl group perspective-[1000px] ${positioning} ${productId ? 'cursor-pointer' : ''} bg-gradient-to-br from-pink-200 via-pink-300 to-pink-100`}
                      onClick={() => { if (productId) router.push(`/producto/${productId}`); }}
                      role={productId ? 'link' : undefined}
                      tabIndex={productId ? 0 : -1}
                      onKeyDown={(e) => { if (productId && (e.key === 'Enter' || e.key === ' ')) router.push(`/producto/${productId}`); }}
                    >
                      {/* dark overlay for contrast on text */}
                      {/* <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none rounded-2xl"></div>

                      {/* large title top-left */}
                      {/* (card as any).title && (
                        <div className="absolute top-6 left-6 z-30 pointer-events-none max-w-[55%]">
                          <h3 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)] leading-tight">{(card as any).title}</h3>
                          {(card as any).subtitle && <p className="text-red-400 font-medium mt-2">{(card as any).subtitle}</p>}
                        </div>
                      )}

                      {/* image positioned bottom-left, larger and not cropped */}
                      {/* <div className="absolute inset-0 z-20 pointer-events-none">
                        <img
                          src={img}
                          alt={(card as any).title || `promo-${index}`}
                          className="absolute left-0 bottom-0 w-[62%] h-auto max-h-full object-contain transform-gpu transition-transform duration-600 ease-out group-hover:scale-105 group-hover:-translate-y-2 group-hover:rotate-1 -translate-x-4"
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={`relative overflow-hidden rounded-lg group perspective-[1000px] ${positioning} ${productId ? 'cursor-pointer' : ''}`}
                    onClick={() => { if (productId) router.push(`/producto/${productId}`); }}
                    role={productId ? 'link' : undefined}
                    tabIndex={productId ? 0 : -1}
                    onKeyDown={(e) => { if (productId && (e.key === 'Enter' || e.key === ' ')) router.push(`/producto/${productId}`); }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none rounded-lg"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 to-transparent z-0 pointer-events-none rounded-lg"></div>

                    <img
                      src={img}
                      alt={(card as any).title || `promo-${index}`}
                      className="w-full h-full object-cover transform-gpu transition-transform duration-600 ease-out group-hover:scale-105 group-hover:-translate-y-2 group-hover:rotate-1 rounded-lg"
                    />

                    {(card as any).title && (
                      <div className="absolute left-6 bottom-6 z-20 pointer-events-none">
                        <h3 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-tight">{(card as any).title}</h3>
                        {(card as any).subtitle && <p className="text-red-400 font-medium mt-1">{(card as any).subtitle}</p>}
                      </div>
                    )}
                  </div>
                );
              })} */}

              {/* render any additional promo cards below the 4-card layout in a normal grid */}
              {promoCards.length > 4 && promoCards.slice(4).map((card, idx) => {
                const productId = (card as any).productoId || (card as any).productId || (card as any).product?.id;
                const img = card.imageUrl || '/logos/logoaimexchangehd.png';
                return (
                  <div
                    key={`extra-${idx}`}
                    className="relative overflow-hidden rounded-lg aspect-video group"
                    onClick={() => { if (productId) router.push(`/producto/${productId}`); }}
                    role={productId ? 'link' : undefined}
                    tabIndex={productId ? 0 : -1}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none"></div>
                    <img src={img} alt={(card as any).title || `promo-extra-${idx}`} className="w-full h-full object-cover transform-gpu transition-transform duration-600 ease-out group-hover:scale-105 rounded-lg" />
                  </div>
                );
              })}
            </div>

            {/* Mosaic layout styles: editable via CSS variables */}
            <style jsx>{`
              .banners-mosaic {
                --mosaic-left: 1.3fr;
                --mosaic-middle: 0.9fr;
                --mosaic-right: 1.3fr;
                --mosaic-gap: 1rem;
                display: grid;
                gap: var(--mosaic-gap);
              }
              /* mobile: simple single column (already covered by tailwind grid-cols-1) */

              @media (min-width: 768px) {
                .banners-mosaic {
                  grid-template-columns: var(--mosaic-left) var(--mosaic-middle) var(--mosaic-right);
                  grid-template-rows: auto auto;
                  grid-template-areas:
                    "left midTop right"
                    "left midBottom right";
                  align-items: stretch;
                }
                .banners-mosaic > [data-mosaic-index="0"] { grid-area: left; }
                .banners-mosaic > [data-mosaic-index="1"] { grid-area: midTop; }
                .banners-mosaic > [data-mosaic-index="2"] { grid-area: midBottom; }
                .banners-mosaic > [data-mosaic-index="3"] { grid-area: right; }
              }
            `}</style>
          </div>
        </section>

        {/* Sección tipo "Mouse Skates" y "Grip Tapes" (oculta) */}
        <section className="py-16 bg-black hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             {/* Top small cards row (3 cards) */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
               <a href="/producto/5" className="relative rounded-lg overflow-hidden group block">
                 <div className="w-full h-52 bg-gray-900">
                   <img src="/logos/mousepad-banner1.jpg" alt="Purple" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-400" />
                 </div>
                 <div className="absolute left-6 bottom-6 text-white">
                   <h4 className="text-2xl font-bold">PURPLE</h4>
                   <p className="text-sm text-gray-300 mt-1">XSOFT</p>
                 </div>
               </a>
 
               <a href="/producto/6" className="relative rounded-lg overflow-hidden group block">
                 <div className="w-full h-52 bg-gray-900">
                   <img src="/logos/mousepad-banner2.jpg" alt="Sword" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-400" />
                 </div>
                 <div className="absolute left-6 bottom-6 text-white">
                   <h4 className="text-2xl font-bold">SWORD</h4>
                   <p className="text-sm text-gray-300 mt-1">XSOFT</p>
                 </div>
               </a>
 
               <a href="/producto/7" className="relative rounded-lg overflow-hidden group block">
                 <div className="w-full h-52 bg-gray-900">
                   <img src="/logos/mousepad-banner3.png" alt="Qisha" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-400" />
                 </div>
                 <div className="absolute left-6 bottom-6 text-white">
                   <h4 className="text-2xl font-bold">QISHA</h4>
                   <p className="text-sm text-gray-300 mt-1">XSOFT</p>
                 </div>
               </a>
             </div>
 
             {/* Two large banners (Mouse Skates / Grip Tapes) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <a
                 href="/productos/mousepad"
                 className="relative rounded-lg overflow-hidden block group"
                 aria-label="Mouse Skates"
               >
                 <div className="w-full h-44 md:h-56 bg-gradient-to-r from-gray-100 to-gray-200">
                   <img src="/logos/skates.png" alt="Mouse Skates" className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500" />
                 </div>
                 <div className="absolute inset-0 flex items-center justify-start p-8 pointer-events-none">
                   <div>
                     <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">Mouse Skates</h3>
                     <button onClick={(e) => { e.preventDefault(); router.push('/productos/mousepad'); }} className="bg-white text-red-600 hover:bg-gray-100 px-6 py-2 rounded-full font-medium text-sm transition-colors">
                       COMPRAR AHORA
                     </button>
                   </div>
                 </div>
               </a>
 
               <a
                 href="/productos/accesorios"
                 className="relative rounded-lg overflow-hidden block group"
                 aria-label="Grip Tapes"
               >
                 <div className="w-full h-44 md:h-56 bg-gradient-to-r from-gray-100 to-gray-200">
                   <img src="/logos/grip-tape.png" alt="Grip Tapes" className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500" />
                 </div>
                 <div className="absolute inset-0 flex items-center justify-end p-8">
                   <div className="text-right">
                     <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">Grip Tapes</h3>
                     <button onClick={(e) => { e.preventDefault(); router.push('/productos/accesorios'); }} className="bg-white text-red-600 hover:bg-gray-100 px-6 py-2 rounded-full font-medium text-sm transition-colors">
                       COMPRAR AHORA
                     </button>
                   </div>
                 </div>
               </a>
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
                <h2 className="text-3xl md:text-4xl font-bold text-white">UNITE A LA COMUNIDAD AIM EXCHANGE</h2>
                <p className="text-white text-opacity-80 max-w-lg">Sé parte de nuestra comunidad de gamers y enterate de las últimas novedades, torneos y descuentos exclusivos.</p>
              </div>
              <a
                href="https://discord.com/invite/KPctbF49"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-block bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition-colors"
              >
                UNIRSE AHORA
              </a>
            </div>
            <a
              href="https://discord.com/invite/KPctbF49"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 md:hidden w-full bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition-colors inline-block text-center"
            >
              UNIRSE AHORA
            </a>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              ¿Querés ser el <span className="text-red-600">primero en enterarte</span> de nuestras ofertas?
            </h2>
            <p className="text-gray-400 mb-8">
              Suscribite para recibir noticias sobre nuevos productos, descuentos exclusivos y guías gaming.
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
    </>
  );
};

export default GamingStore;
