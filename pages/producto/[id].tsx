import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Head from 'next/head';
import Link from 'next/link';
import { useCart } from '../../components/CartContext';
import React from 'react';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  marca: string;
  categoria: {
    id: number;
    nombre: string;
  };
  specs?: string;
  dimensions?: string;
  extraImages?: string;
  manualUrl?: string;
  // campos opcionales que pueden venir desde la API
  formattedPrice?: string;
  stockLabel?: string;
  // valores numéricos opcionales para usar directamente en los counters
  weight?: number;
  sensor?: number;
  polling?: number;
  dpi?: number;
}

function formatPriceNumber(price: number) {
  const n = Math.round(price);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Small animated counter component
function Counter({ end, suffix = '', label, duration = 1200 }: { end: number; suffix?: string; label?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const elRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = elRef.current;
    if (!node) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          startRef.current = null;
          const step = (timestamp: number) => {
            if (!startRef.current) startRef.current = timestamp;
            const progress = Math.min((timestamp - startRef.current) / duration, 1);
            const current = Math.floor(end * progress);
            setValue(current);
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(step);
            } else {
              setValue(end);
            }
          };
          rafRef.current = requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.3 });

    obs.observe(node);
    return () => {
      obs.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration]);

  const fmt = new Intl.NumberFormat('es-ES').format;

  return (
    <div ref={elRef} className="flex flex-col items-center">
      <div className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-none">
        {fmt(value)}{suffix && <span className="text-2xl align-super ml-1">{suffix}</span>}
      </div>
      {label && <div className="mt-2 text-sm text-gray-300">{label}</div>}
    </div>
  );
}

// helper to extract numbers from the 'specs' text only (fallbacks provided)
function extractSpecNumbers(prod: any) {
  const specsText = `${prod?.specs ?? ''}`.replace(/\s+/g, ' ');
  // try patterns for weight (g), sensor (3950), polling (Hz), dpi
  const weightMatch = specsText.match(/weight[:\s]*([\d]{1,3})\s*g/i) || specsText.match(/(\d{1,3})\s*g/i);
  const sensorMatch = /PAW\s*?3950|3950HS|3950hs|3950/i.test(specsText) ? 3950 : null;
  const pollingMatch = specsText.match(/(\d{3,5})\s*Hz/i);
  const dpiMatch = specsText.match(/(\d{4,6})\s*DPI/i) || specsText.match(/DPI[:\s]*([\d]{3,6})/i);

  const weight = weightMatch ? parseInt(weightMatch[1] || weightMatch[0].match(/\d+/)?.[0] || '39', 10) : 39;
  const sensor = sensorMatch ?? 3950;
  const polling = pollingMatch ? parseInt(pollingMatch[1], 10) : 8000;
  const dpi = dpiMatch ? parseInt(dpiMatch[1], 10) : 30000;

  return { weight, sensor, polling, dpi };
}

export default function ProductoDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const { addItem } = useCart();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [productosRelacionados, setProductosRelacionados] = useState<Producto[]>([]);
  const [productosCompradoJunto, setProductosCompradoJunto] = useState<Producto[]>([]);
  const [productosVistos, setProductosVistos] = useState<Producto[]>([]);
  // selección para "comprado junto"
  const [selectedComprado, setSelectedComprado] = useState<number[]>([]);
  useEffect(() => {
    // por defecto seleccionar todos los items cuando cambian las sugerencias
    setSelectedComprado(productosCompradoJunto.map(p => p.id));
  }, [productosCompradoJunto]);
  
  // helper: simple shuffle para elegir productos "comprado junto" como fallback
  const shuffle = <T,>(arr: T[]) => {
    return arr.slice().sort(() => Math.random() - 0.5);
  };
  const toggleSelectComprado = (id: number) => {
    setSelectedComprado(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };
  const toggleSelectAllComprado = () => {
    if (selectedComprado.length === productosCompradoJunto.length) {
      setSelectedComprado([]);
    } else {
      setSelectedComprado(productosCompradoJunto.map(p => p.id));
    }
  };
  const handleAgregarSeleccionados = () => {
    productosCompradoJunto
      .filter(p => selectedComprado.includes(p.id))
      .forEach(p => {
        try {
          addItem({ id: p.id.toString(), name: p.nombre, price: p.precio, image: p.imagenUrl || '', quantity: 1 });
        } catch (e) {
          console.error('Error adding product to cart', p.id, e);
        }
      });
  };
  const [nextProduct, setNextProduct] = useState<Producto | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prevProduct, setPrevProduct] = useState<Producto | null>(null);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [imagesByColor, setImagesByColor] = useState<Record<string, string[]>>({});
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
   const [currentExtraIndex, setCurrentExtraIndex] = useState(0);
  const colorKeysRef = useRef<string[]>([]);

  // render color swatches if multiple colors are available
  const ColorSwatches = () => {
    const keys = Object.keys(imagesByColor || {});
    if (!keys || keys.length <= 1) return null;
    const colorLabelEs: Record<string, string> = {
      default: 'Por defecto',
      white: 'Blanco',
      black: 'Negro',
      pink: 'Rosa',
      red: 'Rojo',
      blue: 'Azul',
      green: 'Verde',
      yellow: 'Amarillo',
      orange: 'Naranja',
    };
    const [hoveredColor, setHoveredColor] = useState<string | null>(null);

    return (
      <div className="relative mt-4">
        {/* Tooltip centered above swatches when hovering */}
        {hoveredColor && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none z-40">
            <div className="px-3 py-1 rounded-md bg-black/80 text-white text-lg md:text-xl font-semibold tracking-wide drop-shadow-md">
              {colorLabelEs[hoveredColor] ?? hoveredColor}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {keys.map(k => (
            <button
              key={k}
              onClick={() => setSelectedColor(k)}
              onMouseEnter={() => setHoveredColor(k)}
              onMouseLeave={() => setHoveredColor(null)}
              className={`w-8 h-8 rounded-full ring-1 ${selectedColor === k ? 'ring-white' : 'ring-white/20'} bg-white/5 flex items-center justify-center`}
              title={colorLabelEs[k] ?? k}
              aria-label={colorLabelEs[k] ?? k}
            >
              <span className="sr-only">{colorLabelEs[k] ?? k}</span>
              <span className="w-5 h-5 rounded-full" style={{ background: (k === 'default' ? '#ddd' : k) }} />
            </button>
          ))}
        </div>
      </div>
    );
  };
   // reset index when images change
   useEffect(() => {
     setCurrentExtraIndex(0);
   }, [extraImages]);
  useEffect(() => {
    setCurrentExtraIndex(0);
  }, [imagesByColor, selectedColor]);

  useEffect(() => {
    if (id) {
      // reset carousel index when loading new product
      setCurrentExtraIndex(0);
      fetchProducto();
      // Check admin
      fetch('/api/auth/me').then(res => res.ok ? res.json() : null).then(data => {
        if (data?.user?.rol === 'admin') setIsAdmin(true);
      });
    }
  }, [id]);

  const fetchProducto = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/productos/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProducto(data);
        // Extra images
        // Prefer imagesByColor (estructura recomendada desde backend)
        if ((data as any).imagesByColor && typeof (data as any).imagesByColor === 'object') {
          // normalize color keys to lowercase for consistency with admin input
          const raw = (data as any).imagesByColor as Record<string, string[]>;
          const grouped: Record<string, string[]> = {};
          Object.entries(raw).forEach(([k, v]) => {
            if (!Array.isArray(v)) return;
            const cleaned = v.map((s: any) => String(s).trim()).filter(Boolean);
            if (cleaned.length > 0) grouped[String(k).toLowerCase()] = cleaned;
          });
          setImagesByColor(grouped);
          const keys = Object.keys(grouped);
          colorKeysRef.current = keys;
          setSelectedColor(keys.length ? keys[0] : null);
          // keep extraImages empty (fallback)
          setExtraImages([]);
        } else if ((data as any).extraImages) {
          // compatibilidad antigua: coma-separado
          const raw = (data as any).extraImages.split(',').map((s: string) => s.trim()).filter(Boolean);
          setExtraImages(raw);
          // fallback grouping under "default"
          setImagesByColor(prev => ({ ...prev, default: raw.length ? raw : [data.imagenUrl].filter(Boolean) }));
          if (!selectedColor) {
            setSelectedColor('default');
            colorKeysRef.current = ['default'];
          }
        } else {
          // no extras: ensure default contains main image
          setImagesByColor(prev => ({ ...prev, default: [data.imagenUrl].filter(Boolean) }));
          if (!selectedColor) {
            setSelectedColor('default');
            colorKeysRef.current = ['default'];
          }
        }
        
        // Guardar en productos vistos (localStorage)
        const vistos = JSON.parse(localStorage.getItem('productosVistos') || '[]');
        const nuevosVistos = [data, ...vistos.filter((p: any) => p.id !== data.id)].slice(0, 6);
        localStorage.setItem('productosVistos', JSON.stringify(nuevosVistos));
        setProductosVistos(nuevosVistos.slice(1)); // Excluir el actual
        
        // Fetch productos relacionados de la misma categoría
        fetchProductosRelacionados(data.categoria.id, data.id);
        fetchNavigationProducts(data.id);
      } else {
        setError('Producto no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductosRelacionados = async (categoriaId: number, currentId: number) => {
    try {
      const res = await fetch('/api/productos');
      if (res.ok) {
        const data = await res.json();
        // primero tomar los de la misma categoría (excepto el actual)
        let relacionados = data.filter((p: Producto) => p.categoria.id === categoriaId && p.id !== currentId);
        // si hay menos de 4, completar con otros productos distintos al actual
        if (relacionados.length < 4) {
          const otros = data.filter((p: Producto) => p.id !== currentId && !relacionados.find(r => r.id === p.id));
          relacionados = [...relacionados, ...otros].slice(0, 4);
        } else {
          relacionados = relacionados.slice(0, 4);
        }
        setProductosRelacionados(relacionados);

        // Productos "Comprado junto frecuentemente": elegir un set distinto como fallback
        // preferir productos distintos a los relacionados y al actual
        let compradoJunto = data.filter((p: Producto) => p.id !== currentId && !relacionados.find(r => r.id === p.id));
        if (compradoJunto.length === 0) {
          compradoJunto = relacionados.slice(); // si no hay otros, reutilizar relacionados
        }
        compradoJunto = shuffle(compradoJunto).slice(0, 3); // <-- cambiado a 3 items
        setProductosCompradoJunto(compradoJunto);
      }
    } catch (err) {
      console.error('Error al cargar productos relacionados:', err);
    }
  };

  const fetchNavigationProducts = async (currentId: number) => {
    try {
      const res = await fetch('/api/productos');
      if (res.ok) {
        const data = await res.json();
        const currentIndex = data.findIndex((p: Producto) => p.id === currentId);
        if (currentIndex > 0) setPrevProduct(data[currentIndex - 1]);
        if (currentIndex < data.length - 1) setNextProduct(data[currentIndex + 1]);
      }
    } catch (err) {
      console.error('Error al cargar productos de navegación:', err);
    }
  };

  const handleAgregarCarrito = () => {
    if (producto) {
      addItem({
        id: producto.id.toString(),
        name: producto.nombre,
        price: producto.precio,
        image: producto.imagenUrl,
        quantity: cantidad
      });
    }
  };

  const incrementarCantidad = () => {
    if (cantidad < (producto?.stock || 1)) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="bg-black text-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando producto...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !producto) {
    return (
      <>
        <Navbar />
        <div className="bg-black text-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
            <p className="text-gray-400 mb-8">{error || 'Producto no encontrado'}</p>
            <Link href="/productos" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
              Ver todos los productos
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // imágenes para el carousel según color seleccionado (o fallback)
  const imagesForCarousel = (() => {
    if (!producto) return [];
    if (selectedColor && imagesByColor[selectedColor] && imagesByColor[selectedColor].length) {
      return imagesByColor[selectedColor];
    }
    // prefer default, else main + extras
    return imagesByColor['default'] ?? [producto.imagenUrl, ...(extraImages || [])].filter(Boolean);
  })();

  // Comprado junto: add function to add all shown products to cart
  const handleAddAllCompradoJunto = () => {
    productosCompradoJunto.forEach(p => {
      try {
        addItem({ id: p.id.toString(), name: p.nombre, price: p.precio, image: p.imagenUrl || '', quantity: 1 });
      } catch (e) {
        console.error('Error adding product to cart', p.id, e);
      }
    });
  };

  const images = producto ? [producto.imagenUrl, ...extraImages] : [];

  // compute spec numbers once producto exists
  // Prioriza campos numéricos explícitos (weight, sensor, polling, dpi) que puede devolver la API.
  // Si no existen, usa extractSpecNumbers(producto) como fallback.
  const fallbackSpecs = producto ? extractSpecNumbers(producto) : { weight: 39, sensor: 3950, polling: 8000, dpi: 30000 };
  const specNumbers = producto
    ? {
        weight: typeof (producto as any).weight === 'number' ? (producto as any).weight : fallbackSpecs.weight,
        sensor: typeof (producto as any).sensor === 'number' ? (producto as any).sensor : fallbackSpecs.sensor,
        polling: typeof (producto as any).polling === 'number' ? (producto as any).polling : fallbackSpecs.polling,
        dpi: typeof (producto as any).dpi === 'number' ? (producto as any).dpi : fallbackSpecs.dpi,
      }
    : fallbackSpecs;

  return (
    <>
      <Head>
        <title>{producto?.nombre} | Aim Exchange</title>
        <meta name="description" content={producto?.descripcion || ''} />
        <meta property="og:title" content={producto?.nombre || ''} />
        <meta property="og:description" content={producto?.descripcion || ''} />
        <meta property="og:image" content={producto?.imagenUrl || ''} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Navbar />
      <div className="bg-black text-white min-h-screen">
        {/* Breadcrumbs */}
        <div className="bg-gray-900 py-4">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Inicio
              </Link>
              <span className="text-gray-600">{'>'}</span>
              <Link href={`/productos/${producto.categoria.nombre.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors">
                {producto.categoria.nombre}
              </Link>
              <span className="text-gray-600">{'>'}</span>
              <span className="text-white">{producto.nombre}</span>
            </nav>
            {isAdmin && (
              <button
                onClick={() => router.push(`/admin/product/${id}`)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded font-medium text-sm"
              >
                Editar producto
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Navegación Prev/Next */}
          <div className="flex justify-between items-center mb-8">
            {prevProduct ? (
              <Link href={`/producto/${prevProduct.id}`} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Prev</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Prev</span>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {prevProduct && (
                <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden">
                  <img src={prevProduct.imagenUrl} alt={prevProduct.nombre} className="w-full h-full object-contain" />
                </div>
              )}
              {nextProduct && (
                <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden">
                  <img src={nextProduct.imagenUrl} alt={nextProduct.nombre} className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            {nextProduct ? (
              <Link href={`/producto/${nextProduct.id}`} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div className="flex items-center space-x-2 text-gray-600">
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Carrusel de imágenes (principal + extras) */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 aspect-square flex items-center justify-center">
                {/* Badge de descuento */}
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                  -20%
                </div>
                {/* Imagen actual del carrusel */}
                <img
                  src={imagesForCarousel.length ? imagesForCarousel[currentExtraIndex % imagesForCarousel.length] : producto.imagenUrl}
                  alt={`${producto.nombre}${currentExtraIndex > 0 ? ` (Extra ${currentExtraIndex})` : ''}`}
                  className="max-w-full max-h-full object-contain"
                />
                {/* Navegación */}
                {imagesForCarousel.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentExtraIndex((currentExtraIndex - 1 + imagesForCarousel.length) % imagesForCarousel.length)}
                      className="absolute left-2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentExtraIndex((currentExtraIndex + 1) % imagesForCarousel.length)}
                      className="absolute right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                {/* Color swatches intentionally moved to the product info column above quantity selector */}
              </div>
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">{producto.nombre}</h1>
              
              {/* Precio */}
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-white">${producto.formattedPrice ?? formatPriceNumber(producto.precio)}</span>
                <span className="text-xl text-gray-500 line-through">${formatPriceNumber(Math.round(producto.precio * 1.25))}</span>
              </div>
              
              {/* Specs (mostrar contenido de ESPECIFICACIONES encima de las especificaciones básicas) */}
              {(producto as any).specs && (
                <div className="prose prose-invert max-w-none mt-6 mb-4">
                  <div dangerouslySetInnerHTML={{ __html: (producto as any).specs }} />
                </div>
              )
              }

              {/* Especificaciones básicas */}
              <div className="space-y-3 border-t border-gray-700 pt-6">
                <div className="flex items-center">
                  <span className="text-gray-400 w-20">Marca:</span>
                  <span className="text-white">{producto.marca}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-20">Stock:</span>
                  <span className="text-white">{producto.stockLabel ?? (producto.stock > 0 ? 'Disponible' : 'No disponible')}</span>
                </div>
                {/* categoría removida según solicitud */}
              </div>

              {/* Color swatches */}
              <div className="mt-4">
                <ColorSwatches />
              </div>

              {/* Selector de cantidad */}
              <div className="space-y-4 border-t border-gray-700 pt-6">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">Cantidad:</span>
                  <div className="flex items-center border border-gray-600 rounded-lg">
                    <button 
                      onClick={decrementarCantidad}
                      className="px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                      disabled={cantidad <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-white bg-gray-800">{cantidad}</span>
                    <button 
                      onClick={incrementarCantidad}
                      className="px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                      disabled={cantidad >= producto.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Botón agregar al carrito */}
                <button 
                  onClick={handleAgregarCarrito}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                  disabled={producto.stock === 0}
                >
                  {producto.stock > 0 ? 'AGREGAR AL CARRITO' : 'SIN STOCK'}
                </button>
              </div>

              {/* Enlaces adicionales */}
              <div className="flex space-x-6 border-t border-gray-700 pt-6">
                <button className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Consultar sobre este producto</span>
                </button>
              </div>

              {/* Información de garantía */}
              <div className="border-t border-gray-700 pt-6">
                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-yellow-500 font-semibold mb-2">Información de garantía</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        AIM EXCHANGE ofrece una garantía limitada de 1 año para todos los productos. Si hay algún 
                        problema de calidad, envía imágenes o videos relevantes a <span className="text-red-400">support@aimexchange.com</span> para revisión.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprado junto frecuentemente: fila de items + total dentro del mismo contenedor (movido aquí) */}
              <div className="mb-6 mt-6">
                <h2 className="text-2xl font-bold text-white mb-4">Comprado junto frecuentemente</h2>
                {productosCompradoJunto.length === 0 ? (
                  <p className="text-gray-400">No hay sugerencias de compra conjunta para este producto.</p>
                ) : (
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
                      {productosCompradoJunto.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => toggleSelectComprado(prod.id)}
                          className="relative bg-gray-800 rounded-xl p-2 hover:bg-gray-700 transition-colors cursor-pointer group h-full flex flex-col"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSelectComprado(prod.id); } }}
                          aria-pressed={selectedComprado.includes(prod.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedComprado.includes(prod.id)}
                            onChange={() => toggleSelectComprado(prod.id)}
                            onClick={(e) => { e.stopPropagation(); }}
                            className="absolute top-3 right-3 w-4 h-4 text-red-600 bg-white/5 rounded"
                            aria-label={`Seleccionar ${prod.nombre}`}
                          />

                          <div className="w-full h-20 bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                            <img src={prod.imagenUrl} alt={prod.nombre} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                          </div>

                          <div className="mt-1">
                            <Link
                              href={`/producto/${prod.id}`}
                              onClick={(e) => { e.stopPropagation(); }}
                              className="font-bold text-white text-sm mb-1 line-clamp-2 hover:underline"
                              aria-label={`Ir a ${prod.nombre}`}
                            >
                              {prod.nombre}
                            </Link>
                          </div>

                          <div className="mt-auto">
                            <p className="text-red-500 font-bold text-sm">${prod.formattedPrice ?? formatPriceNumber(prod.precio)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedComprado.length === productosCompradoJunto.length}
                          onChange={toggleSelectAllComprado}
                          className="w-4 h-4"
                          aria-label="Seleccionar todos"
                        />
                        <span>Seleccionar todos</span>
                      </label>
                      <button
                        onClick={handleAgregarSeleccionados}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                        aria-label="Agregar seleccionados al carrito"
                        disabled={selectedComprado.length === 0}
                      >
                        Agregar seleccionados ({selectedComprado.length})
                      </button>
                    </div>
                  </div>
                 )}
              </div>
            </div>
          </div>

          {/* --- NEW: Big numeric specs row with animated counters --- */}
          <section className="mb-16">
            <div className="bg-black/0 rounded-lg p-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-stretch text-center">
                  <div className="p-6 bg-transparent rounded-lg">
                    <Counter end={specNumbers.weight} suffix="g" label="Gram Weight" />
                  </div>
                  <div className="p-6 bg-transparent rounded-lg">
                    <Counter end={specNumbers.sensor} suffix="HS" label="PixArt PAW" />
                  </div>
                  <div className="p-6 bg-transparent rounded-lg">
                    <Counter end={specNumbers.polling} suffix="Hz" label="Polling Rate" />
                  </div>
                  <div className="p-6 bg-transparent rounded-lg">
                    <Counter end={specNumbers.dpi} label="DPI" />
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* --- end counters --- */}

          {/* Tabs de información */}
          <div className="mb-16">
            <div className="border-b border-gray-700">
              <nav className="flex space-x-8">
                {[
                  { id: 'specifications', label: 'ESPECIFICACIONES' },
                  { id: 'dimensions', label: 'DIMENSIONES' },
                  { id: 'contents', label: 'CONTENIDO' },
                  { id: 'manual', label: 'MANUAL' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-500'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="py-8">
              {activeTab === 'specifications' && (
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: (producto as any).specs || producto.descripcion }} />
                </div>
              )}
              {activeTab === 'dimensions' && (
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: (producto as any).dimensions || '<p class="text-gray-300">Sin dimensiones disponibles</p>' }} />
                </div>
              )}
              {activeTab === 'contents' && (
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: (producto as any).descripcion || '<p class="text-gray-300">Sin contenido</p>' }} />
                </div>
              )}
              {activeTab === 'manual' && (
                <div className="prose prose-invert max-w-none">
                  {(producto as any).manualUrl ? (
                    <a
                      href={(producto as any).manualUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Descargar Manual
                    </a>
                  ) : (
                    <p className="text-gray-300">Manual no disponible</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Productos relacionados - Customers also purchased */}
          {/* Comprado junto frecuentemente: fila de items + total dentro del mismo contenedor */}

          {/* Los clientes también compraron (solo si hay relacionados específicos) */}
          {productosRelacionados.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Los clientes también compraron</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {productosRelacionados.map((prod) => (
                  <Link key={prod.id} href={`/producto/${prod.id}`}>
                    <div className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-colors cursor-pointer group">
                      <div className="aspect-square bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        <img src={prod.imagenUrl} alt={prod.nombre} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                      </div>
                      <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">{prod.nombre}</h3>
                      <p className="text-red-500 font-bold">${prod.formattedPrice ?? formatPriceNumber(prod.precio)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Vistos recientemente */}
          {productosVistos.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Vistos recientemente</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {productosVistos.map((p) => (
                  <Link key={p.id} href={`/producto/${p.id}`}>
                    <div className="bg-gray-900 rounded-lg p-3 hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="aspect-square bg-gray-800 rounded mb-2 flex items-center justify-center overflow-hidden">
                        <img src={p.imagenUrl} alt={p.nombre} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="text-sm text-white line-clamp-2">{p.nombre}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
