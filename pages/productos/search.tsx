import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const SearchResults = () => {
  const router = useRouter();
  const { q } = router.query;
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Actualizar el término de búsqueda cuando cambie el parámetro q
  useEffect(() => {
    if (q && typeof q === 'string') {
      setSearchTerm(q);
      fetchProducts(q);
    } else if (router.isReady) {
      // Si no hay término de búsqueda pero la ruta está lista, cargar todos los productos
      fetchProducts('');
    }
  }, [q, router.isReady]);

  // Buscar productos en la API
  const fetchProducts = async (term) => {
    setLoading(true);
    setError('');
    
    try {
      console.log(`Buscando productos con término: "${term}"`);
      
      // Usar la ruta correcta de API
      const res = await fetch(`/api/productos${term ? `?search=${encodeURIComponent(term)}` : ''}`);
      console.log('Estado de respuesta:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log(`Productos recibidos: ${data.length}`);
        setProducts(data);
      } else {
        console.error('Error en la respuesta de la API:', res.statusText);
        const errorText = await res.text();
        console.error('Detalles del error:', errorText);
        setError(`Error al buscar productos: ${res.statusText}`);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setError(`Error de conexión: ${error.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar la búsqueda cuando se envía el formulario
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push({
        pathname: '/productos/search',
        query: { q: searchTerm.trim() }
      }, undefined, { scroll: false });
    } else {
      // Si el término está vacío, mostrar todos los productos
      fetchProducts('');
    }
  };

  // Manejar clic en producto para ver detalles
  const handleProductClick = (productId) => {
    router.push(`/productos/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-white">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Formulario de búsqueda */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex max-w-lg mx-auto">
              <input 
                type="text" 
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-red-500 text-black"
              />
              <button 
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-r-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
          
          {/* Resultados */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white">
              {q ? `Resultados para "${q}"` : 'Todos los productos'}
            </h1>
            <p className="text-gray-300">
              {loading ? 'Buscando productos...' : `${products.length} productos encontrados`}
            </p>
            {error && (
              <p className="text-red-600 mt-2">{error}</p>
            )}
          </div>

          {/* Lista de productos */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="relative">
                    <img 
                      src={product.imagenUrl || '/placeholder.jpg'} 
                      alt={product.nombre}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                    {product.stock === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white bg-red-500">
                        AGOTADO
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 font-semibold mb-1">{product.marca || 'Marca'}</p>
                    <h3 className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">{product.nombre}</h3>
                    <div className="text-lg font-bold text-gray-900 mb-3">${product.precio}</div>
                    <button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Aquí puedes agregar la lógica para agregar al carrito
                      }}
                    >
                      Comprar ahora
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No se encontraron productos que coincidan con tu búsqueda.</p>
              <p className="text-gray-600 mt-2">Intenta con otros términos o explora nuestras categorías.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResults;