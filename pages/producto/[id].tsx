import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { useCart } from '../../components/CartContext';

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
  const [productosVistos, setProductosVistos] = useState<Producto[]>([]);
  const [nextProduct, setNextProduct] = useState<Producto | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prevProduct, setPrevProduct] = useState<Producto | null>(null);

  useEffect(() => {
    if (id) {
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
        const relacionados = data
          .filter((p: Producto) => p.categoria.id === categoriaId && p.id !== currentId)
          .slice(0, 4);
        setProductosRelacionados(relacionados);
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

  return (
    <>
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
            {/* Imagen del producto */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 aspect-square flex items-center justify-center">
                {/* Badge de descuento */}
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                  -20%
                </div>
                <img 
                  src={producto.imagenUrl} 
                  alt={producto.nombre}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">{producto.nombre}</h1>
              
              {/* Precio */}
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-white">${producto.precio.toLocaleString()}</span>
                <span className="text-xl text-gray-500 line-through">${(producto.precio * 1.25).toFixed(0)}</span>
              </div>

              {/* Especificaciones básicas */}
              <div className="space-y-3 border-t border-gray-700 pt-6">
                <div className="flex items-center">
                  <span className="text-gray-400 w-20">Marca:</span>
                  <span className="text-white">{producto.marca}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-20">Stock:</span>
                  <span className="text-white">{producto.stock} unidades</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-20">Categoría:</span>
                  <span className="text-white">{producto.categoria.nombre}</span>
                </div>
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
            </div>
          </div>

          {/* Frequently bought together */}
          {productosRelacionados.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Frecuentemente comprados juntos</h2>
              <div className="bg-gray-900 rounded-xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                  {/* Producto actual */}
                  <div className="text-center">
                    <div className="relative">
                      <div className="aspect-square bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        <img src={producto.imagenUrl} alt={producto.nombre} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                        -20%
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">{producto.nombre}</h3>
                    <p className="text-red-500 font-bold">${producto.precio.toLocaleString()}</p>
                  </div>

                  {/* Símbolo + */}
                  <div className="flex justify-center">
                    <span className="text-gray-400 text-2xl font-bold">+</span>
                  </div>

                  {/* Productos relacionados */}
                  {productosRelacionados.slice(0, 2).map((prod, index) => (
                    <div key={prod.id}>
                      <div className="text-center">
                        <div className="aspect-square bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                          <img src={prod.imagenUrl} alt={prod.nombre} className="max-w-full max-h-full object-contain" />
                        </div>
                        <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">{prod.nombre}</h3>
                        <p className="text-red-500 font-bold">${prod.precio.toLocaleString()}</p>
                      </div>
                      {index === 0 && productosRelacionados.length > 1 && (
                        <div className="flex justify-center mt-4">
                          <span className="text-gray-400 text-2xl font-bold">+</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                    AGREGAR PRODUCTOS SELECCIONADOS AL CARRITO
                  </button>
                  <p className="text-gray-400 text-sm mt-2">
                    Precio total: ${(producto.precio + productosRelacionados.slice(0, 2).reduce((sum, p) => sum + p.precio, 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

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
                  <p className="text-gray-300 leading-relaxed">{producto.descripcion}</p>
                </div>
              )}
              {activeTab === 'dimensions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Dimensiones del producto</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li><strong>Largo:</strong> 125mm</li>
                      <li><strong>Ancho:</strong> 65mm</li>
                      <li><strong>Alto:</strong> 40mm</li>
                      <li><strong>Peso:</strong> 75g</li>
                    </ul>
                  </div>
                </div>
              )}
              {activeTab === 'contents' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Contenido de la caja</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• 1x {producto.nombre}</li>
                    <li>• 1x Cable USB</li>
                    <li>• 1x Manual de usuario</li>
                    <li>• 1x Tarjeta de garantía</li>
                  </ul>
                </div>
              )}
              {activeTab === 'manual' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Manual de usuario</h3>
                  <p className="text-gray-300">El manual de usuario está disponible para descarga en formato PDF.</p>
                  <button className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
                    Descargar Manual
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Productos relacionados - Customers also purchased */}
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
                      <p className="text-red-500 font-bold">${prod.precio.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Productos vistos recientemente */}
          {productosVistos.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">Productos vistos recientemente</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosVistos.map((prod) => (
                  <Link key={prod.id} href={`/producto/${prod.id}`}>
                    <div className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-colors cursor-pointer group">
                      <div className="aspect-square bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        <img src={prod.imagenUrl} alt={prod.nombre} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                      </div>
                      <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">{prod.nombre}</h3>
                      <p className="text-red-500 font-bold">${prod.precio.toLocaleString()}</p>
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
