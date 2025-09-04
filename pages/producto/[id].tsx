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
  
  // Estados principales
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [productosRelacionados, setProductosRelacionados] = useState<Producto[]>([]);
  const [productosCompradoJunto, setProductosCompradoJunto] = useState<Producto[]>([]);
  const [productosVistos, setProductosVistos] = useState<Producto[]>([]);
  const [selectedComprado, setSelectedComprado] = useState<number[]>([]);
  const [nextProduct, setNextProduct] = useState<Producto | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prevProduct, setPrevProduct] = useState<Producto | null>(null);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [imagesByColor, setImagesByColor] = useState<Record<string, string[]>>({});
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [currentExtraIndex, setCurrentExtraIndex] = useState(0);
  const [stickyIndex, setStickyIndex] = useState(0);
  const [activeStickyIndex, setActiveStickyIndex] = useState(0);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  
  // Refs
  const colorKeysRef = useRef<string[]>([]);
  const sectionRefs = useRef<HTMLDivElement[]>([]);
  const activeIndexRef = useRef(0);

  // Effects
  useEffect(() => {
    // por defecto seleccionar todos los items cuando cambian las sugerencias
    setSelectedComprado(productosCompradoJunto.map(p => p.id));
  }, [productosCompradoJunto]);

  // reset index when images change
  useEffect(() => {
    setCurrentExtraIndex(0);
  }, [extraImages]);
  
  // NO resetear cuando cambia selectedColor - eso causa el problema!

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

  // useEffect para IntersectionObserver de sticky sections
  useEffect(() => {
    if (!sectionRefs.current || sectionRefs.current.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-idx'));
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setActiveStickyIndex(idx);
            activeIndexRef.current = idx;
          }
        });
      },
      {
        threshold: [0, 0.5, 1],
        root: null,
        rootMargin: '0px'
      }
    );

    sectionRefs.current.forEach((el) => {
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, [producto]); // Cambio la dependencia a producto en lugar de stickySections.length

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomPosition({ x: 50, y: 50 });
  };

  // render color swatches if multiple colors are available
  const ColorSwatches = () => {
    const keys = Object.keys(imagesByColor || {});
    // Filtrar 'default' de los colores mostrados, solo mostrar colores reales
    const colorKeys = keys.filter(k => k !== 'default');
    
    if (!colorKeys || colorKeys.length <= 0) return null;
    
    console.log('Available color keys:', colorKeys);
    console.log('Hovered color:', hoveredColor);
    
    // Detectar si es mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    
    return (
      <div className="relative mt-4">
        {/* Tooltip - solo mostrar en desktop o cuando está específicamente hovereado */}
        {hoveredColor && !isMobile && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none z-40">
            <div className="px-3 py-1 rounded-md bg-red-600 text-white text-lg font-semibold tracking-wide drop-shadow-md border border-white/20">
              {hoveredColor === 'white' ? 'BLANCO' : 
               hoveredColor === 'black' ? 'NEGRO' : 
               hoveredColor === 'red' ? 'ROJO' :
               hoveredColor === 'blue' ? 'AZUL' :
               hoveredColor === 'default' ? 'ORIGINAL' : 
               hoveredColor.toUpperCase()}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <span className="text-white text-sm">Colores:</span>
          {colorKeys.map(color => {
            // Función inline para obtener el color hex correcto
            const getColorDisplay = (colorKey: string): string => {
              const lowerKey = colorKey.toLowerCase().trim();
              
              if (lowerKey === 'white') return '#ffffff';
              if (lowerKey === 'black') return '#000000';
              if (lowerKey === 'red') return '#ff0000';
              if (lowerKey === 'blue') return '#0000ff';
              if (lowerKey === 'green') return '#00ff00';
              if (lowerKey === 'yellow') return '#ffff00';
              if (lowerKey === 'pink') return '#ff69b4';
              if (lowerKey === 'purple') return '#800080';
              if (lowerKey === 'orange') return '#ffa500';
              if (lowerKey === 'gray' || lowerKey === 'grey') return '#808080';
              if (lowerKey === 'default') return '#d1d5db';
              
              return '#cccccc'; // fallback gris claro
            };

            const hexColor = getColorDisplay(color);
            console.log(`Color: ${color}, Hex: ${hexColor}`);
            
            return (
              <button
                key={color}
                onClick={() => {
                  console.log('=== COLOR CLICK DEBUG ===');
                  console.log('Selected color:', color);
                  console.log('imagesByColor object:', imagesByColor);
                  console.log('allImages array:', allImages);
                  
                  setSelectedColor(color);
                  
                  // Buscar las imágenes de este color directamente en imagesByColor
                  // Primero intentar con el color tal como está
                  let colorImages: string[] = [];
                  
                  if (imagesByColor[color] && imagesByColor[color].length > 0) {
                    colorImages = imagesByColor[color];
                    console.log('Found images directly:', colorImages);
                  } else {
                    // Si no encuentra, buscar en el formato backend original
                    const backendKey = `["${color}"]`;
                    if (imagesByColor[backendKey] && imagesByColor[backendKey].length > 0) {
                      colorImages = imagesByColor[backendKey];
                      console.log('Found images with backend key:', backendKey, colorImages);
                    }
                  }
                  
                  if (colorImages.length > 0) {
                    // Tomar la primera imagen del color y buscar su índice en allImages
                    const firstColorImage = colorImages[0];
                    const targetIndex = allImages.indexOf(firstColorImage);
                    
                    console.log('First color image:', firstColorImage);
                    console.log('Target index:', targetIndex);
                    
                    if (targetIndex !== -1) {
                      setCurrentExtraIndex(targetIndex);
                      console.log('Successfully navigated to index:', targetIndex);
                    } else {
                      console.log('Image not found in allImages array');
                    }
                  } else {
                    console.log('No images found for color:', color);
                  }
                  
                  console.log('=== END COLOR CLICK DEBUG ===');
                  
                  // En mobile, limpiar el hover al hacer click
                  if (isMobile) {
                    setHoveredColor(null);
                  }
                }}
                onMouseEnter={() => {
                  // Solo activar hover en desktop
                  if (!isMobile) {
                    console.log('Hovering color:', color);
                    setHoveredColor(color);
                  }
                }}
                onMouseLeave={() => {
                  // Solo limpiar hover en desktop
                  if (!isMobile) {
                    console.log('Stopped hovering');
                    setHoveredColor(null);
                  }
                }}
                onTouchStart={() => {
                  // En mobile, opcional: mostrar brevemente el color al tocar
                  if (isMobile) {
                    setHoveredColor(color);
                    // Limpiar después de 1 segundo
                    setTimeout(() => setHoveredColor(null), 1000);
                  }
                }}
                className={`w-10 h-10 rounded-full ring-2 ${
                  selectedColor === color ? 'ring-red-500 ring-2' : 'ring-gray-400 ring-1'
                } transition-all duration-200 hover:scale-110 hover:ring-red-400 active:scale-95 border border-white/20`}
                style={{ backgroundColor: hexColor }}
              >
                <span className="sr-only">{color}</span>
              </button>
            );
          })}
        </div>
        
        {/* Indicador visual del color seleccionado en mobile */}
        {isMobile && selectedColor && selectedColor !== 'default' && (
          <div className="mt-2 text-center">
            <span className="text-gray-400 text-sm">
              Seleccionado: {
                selectedColor === 'white' ? 'Blanco' : 
                selectedColor === 'black' ? 'Negro' : 
                selectedColor === 'red' ? 'Rojo' :
                selectedColor === 'blue' ? 'Azul' :
                selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)
              }
            </span>
          </div>
        )}
      </div>
    );
  };

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
          
          console.log('Raw imagesByColor from API:', raw);
          
          // Primero procesar todos los colores excepto 'default'
          Object.entries(raw).forEach(([k, v]) => {
            if (!Array.isArray(v)) return;
            const cleaned = v.map((s: any) => String(s).trim()).filter(Boolean);
            
            // Parsear la key si viene en formato ["color"] 
            let colorKey = String(k).toLowerCase();
            if (colorKey.startsWith('["') && colorKey.endsWith('"]')) {
              // Remover los corchetes y comillas: ["black"] -> black
              colorKey = colorKey.slice(2, -2);
            }
            
            console.log(`Processing color: ${k} -> ${colorKey}, images:`, cleaned);
            
            if (cleaned.length > 0 && colorKey !== 'default') {
              grouped[colorKey] = cleaned;
            }
          });
          
          // Asegurar que siempre hay un color "default" con la imagen principal al inicio
          const defaultImages = data.imagenUrl ? [data.imagenUrl] : [];
          if (raw['default'] && Array.isArray(raw['default'])) {
            const defaultExtras = raw['default'].map((s: any) => String(s).trim()).filter(Boolean);
            // Agregar extras de default solo si no incluyen ya la imagen principal
            defaultExtras.forEach((img: string) => {
              if (img !== data.imagenUrl) {
                defaultImages.push(img);
              }
            });
          }
          
          // Colocar 'default' al inicio del objeto
          const finalGrouped: Record<string, string[]> = {};
          if (defaultImages.length > 0) {
            finalGrouped['default'] = defaultImages;
          }
          
          // Agregar los demás colores después
          Object.entries(grouped).forEach(([k, v]) => {
            finalGrouped[k] = v;
          });
          
          console.log('Final processed imagesByColor:', finalGrouped);
          
          setImagesByColor(finalGrouped);
          const keys = Object.keys(finalGrouped);
          colorKeysRef.current = keys;
          // No seleccionar automáticamente ningún color, dejar que el usuario elija
          setSelectedColor(null);
          setExtraImages([]);
        } else if ((data as any).extraImages) {
          // compatibilidad antigua: coma-separado
          const raw = (data as any).extraImages.split(',').map((s: string) => s.trim()).filter(Boolean);
          setExtraImages(raw);
          // fallback grouping under "default" - siempre incluir imagen principal al inicio
          const defaultImages = data.imagenUrl ? [data.imagenUrl, ...raw] : raw;
          setImagesByColor({ default: defaultImages });
          setSelectedColor(null);
          colorKeysRef.current = ['default'];
        } else {
          // no extras: ensure default contains main image
          const defaultImages = data.imagenUrl ? [data.imagenUrl] : [];
          setImagesByColor({ default: defaultImages });
          setSelectedColor(null);
          colorKeysRef.current = ['default'];
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
    
    // Si hay un color seleccionado y tiene imágenes, usarlas
    if (selectedColor && imagesByColor[selectedColor] && imagesByColor[selectedColor].length) {
      return imagesByColor[selectedColor];
    }
    
    // Si hay imágenes en "default", usarlas
    if (imagesByColor['default'] && imagesByColor['default'].length) {
      return imagesByColor['default'];
    }
    
    // Fallback: imagen principal + extras si existen
    const fallbackImages = [producto.imagenUrl, ...(extraImages || [])].filter(Boolean);
    return fallbackImages.length ? fallbackImages : [producto.imagenUrl];
  })();

  // Todas las imágenes disponibles para el carrusel completo
  const allImages = (() => {
    if (!producto) return [];
    
    const imageSet = new Set<string>();
    
    // Siempre empezar con la imagen principal
    if (producto.imagenUrl) {
      imageSet.add(producto.imagenUrl);
    }
    
    // Agregar todas las imágenes de todos los colores
    Object.values(imagesByColor || {}).forEach(colorImages => {
      if (Array.isArray(colorImages)) {
        colorImages.forEach(img => imageSet.add(img));
      }
    });
    
    // Agregar imágenes extras si existen
    if (extraImages && extraImages.length > 0) {
      extraImages.forEach(img => imageSet.add(img));
    }
    
    // Convertir a array, asegurando que la imagen principal esté primera
    const allImagesArray = Array.from(imageSet);
    if (producto.imagenUrl && allImagesArray[0] !== producto.imagenUrl) {
      // Mover imagen principal al inicio
      const mainIndex = allImagesArray.indexOf(producto.imagenUrl);
      if (mainIndex > 0) {
        allImagesArray.splice(mainIndex, 1);
        allImagesArray.unshift(producto.imagenUrl);
      }
    }
    
    return allImagesArray;
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

  // Sticky sections: varias secciones completas (cada una con título, texto e imagen distinta)
  const baseCopy = [
    {
      title: 'Presentación',
      text:
        (producto as any)?.shortIntro ??
        producto?.descripcion ??
        'Diseño pensado para rendimiento, ligereza y durabilidad. Ideal para sesiones largas y uso intensivo.'
    },
    {
      title: 'Características destacadas',
      text:
        (producto as any).marketing ??
        'Estructura ultra ligera, sensor de alta precisión y componentes optimizados para competición.'
    },
    {
      title: 'Rendimiento superior',
      text: 'Tecnología avanzada que garantiza precisión milimétrica y respuesta instantánea en cada movimiento.'
    },
    {
      title: 'Diseño ergonómico',
      text: 'Forma estudiada para largas sesiones de juego, reduciendo la fatiga y maximizando el control.'
    }
  ];

  const imagesPool = allImages.length ? allImages : [producto.imagenUrl];

  // Genera exactamente 4 secciones completas
  const stickySections = baseCopy.map((base, i) => ({
    title: base.title,
    text: base.text,
    image: imagesPool[i % imagesPool.length] || producto.imagenUrl
  }));

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
        {/* Breadcrumbs - OCULTO */}
        <div className="bg-gray-900 py-4 hidden">
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
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Navegación Prev/Next - OCULTA */}
          <div className="justify-between items-center mb-8 hidden">
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
              {/* fondo del contenedor de imagen ahora transparente (o usar bg-black si querés que coincida) */}
              <div 
                className="bg-transparent rounded-2xl p-8 aspect-square flex items-center justify-center overflow-hidden cursor-zoom-in relative"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                 {/* Badge de descuento */}
                 <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold z-10 pointer-events-none">
                   -20%
                 </div>
                 {/* Imagen actual del carrusel */}
                 <img
                   src={allImages.length ? allImages[currentExtraIndex % allImages.length] : producto.imagenUrl}
                   alt={`${producto.nombre}${currentExtraIndex > 0 ? ` (Imagen ${currentExtraIndex + 1})` : ''}`}
                   className="max-w-full max-h-full object-contain transition-all duration-300 ease-out"
                   style={{
                     transform: isZooming ? 'scale(2.5)' : 'scale(1)',
                     transformOrigin: isZooming ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'
                   }}
                 />
                
                {/* Contador de imágenes */}
                {allImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm z-10 pointer-events-none">
                    {currentExtraIndex + 1} / {allImages.length}
                  </div>
                )}
              </div>
              
              {/* Navegación fuera del contenedor de zoom */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentExtraIndex((currentExtraIndex - 1 + allImages.length) % allImages.length)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full z-30 transition-opacity"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentExtraIndex((currentExtraIndex + 1) % allImages.length)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full z-30 transition-opacity"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Indicadores de posición fuera del contenedor de zoom */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentExtraIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentExtraIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">{producto.nombre}</h1>
                {isAdmin && (
                  <button
                    onClick={() => router.push(`/admin/product/${id}`)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Editar</span>
                  </button>
                )}
              </div>
              
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
              <div className="flex space-x-6 border-t border-gray-700 pt-6 hidden">
                <button className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Consultar sobre este producto</span>
                </button>
              </div>

              {/* Información de garantía (oculta visualmente) */}
              <div className="border-t border-gray-700 pt-6 hidden">
                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.35 16.5l13.856-13.856c.77-.833 2.034-.833 2.804 0 .77.833.77 2.178 0 2.964L7.154 19.5c-.77.833-2.034.833-2.804 0-.77-.833-.77-2.178 0-2.964z" />
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

              {/* Comprado junto frecuentemente (oculto visualmente) */}
              <div className="mb-6 mt-6 hidden">
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
          {/* Reemplazo: cuadro único con especificaciones + detalle y debajo la imagen mini + mini-descripción */}
          <div className="mb-16">
            {/* Especificacion: cuadro principal (marco) con tarjeta interna para mantener la paleta actual */}
            <div className="mb-16">
              {/* Marco exterior: tono más claro para simular el 'fondo blanco' en la paleta oscura */}
              <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-6">
                {/* Tarjeta interior: el contenido real (mantiene bg y bordes actuales) */}
                <div className="bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-800">
                  <div className="max-w-7xl mx-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-900">
                          <th className="text-left text-white font-bold text-base py-3 px-2">Especificación</th>
                          <th className="text-left text-white font-bold text-base py-3 px-2">Detalles</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-800">
                          <td className="py-3 text-gray-300 w-1/3">Marca</td>
                          <td className="py-3 text-white">{producto.marca}</td>
                        </tr>
                        <tr className="border-t border-gray-800">
                          <td className="py-3 text-gray-300">Modelo</td>
                          <td className="py-3 text-white">{producto.nombre}</td>
                        </tr>
                        <tr className="border-t border-gray-800">
                          <td className="py-3 text-gray-300">DPI</td>
                          <td className="py-3 text-white">{specNumbers.dpi ?? '—'}</td>
                        </tr>
                        <tr className="border-t border-gray-800">
                          <td className="py-3 text-gray-300">Sensor</td>
                          <td className="py-3 text-white">{specNumbers.sensor ?? (producto as any).sensor ?? '—'}</td>
                        </tr>
                        <tr className="border-t border-gray-800">
                          <td className="py-3 text-gray-300">Polling Rate</td>
                          <td className="py-3 text-white">{specNumbers.polling ? `${specNumbers.polling} Hz` : '—'}</td>
                        </tr>
                        <tr className="border-t border-gray-800">
                          <td className="py-3 text-gray-300">Peso</td>
                          <td className="py-3 text-white">{specNumbers.weight ? `${specNumbers.weight} g` : '—'}</td>
                        </tr>
                        <tr className="border-t border-gray-800">
                          <td className="py-3 text-gray-300">Dimensiones</td>
                          <td className="py-3 text-white">{producto.dimensions ?? '—'}</td>
                        </tr>
                        <tr className="border-t border-gray-800">
                          <td className="py-3 text-gray-300">Conectividad</td>
                          <td className="py-3 text-white">{(producto as any).connectivity ?? '—'}</td>
                        </tr>
                        <tr className="border-t border-gray-800">
                          <td className="py-3 text-gray-300">Batería</td>
                          <td className="py-3 text-white">{(producto as any).battery ?? '—'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Imagen + mini-descripción: deben ir debajo del cuadro de especificacion */}
            <div className="mt-6 relative">
              {stickySections.map((sec, idx) => (
                <div 
                  key={idx} 
                  data-idx={idx}
                  ref={(el) => { if (el) sectionRefs.current[idx] = el; }}
                  className="sticky w-full flex items-center bg-black"
                  style={{ 
                    top: '0px',
                    zIndex: idx + 1,
                    height: '100vh',
                    marginBottom: '100vh'
                  }}
                >
                  <div className="container max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center min-h-[60vh]">
                      {/* Left: título + texto */}
                      <div className="md:col-span-1 space-y-6">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                          {sec.title}
                        </h3>
                        <p className="text-gray-400 text-lg max-w-prose leading-relaxed">
                          {sec.text}
                        </p>
                      </div>

                      {/* Right: imagen asociada a esta sección */}
                      <div className="md:col-span-1 flex items-center justify-center">
                        <img
                          src={sec.image}
                          alt={`${producto.nombre} ${idx + 1}`}
                          className="max-w-full max-h-[520px] object-contain transform transition-transform duration-700 ease-out"
                          style={{
                            transform: activeStickyIndex === idx ? 'scale(1) rotate(0deg)' : 'scale(0.95) rotate(-2deg)',
                            opacity: activeStickyIndex === idx ? 1 : 0.8
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Espacio adicional para permitir scroll después de la última sección */}
              <div style={{ height: '100vh' }}></div>
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
