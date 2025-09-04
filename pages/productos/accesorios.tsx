import React, { useEffect, useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../components/CartContext';
import { useRouter } from 'next/router';
import Head from 'next/head';

const marcas = ['Todas', 'GameSir', 'Logitech', 'Razer', 'Corsair'];
const disponibilidad = ['Todas', 'Disponible', 'Agotado'];
const rangos = ['Todos', 'Menos de $10.000', '$10.000 - $30.000', 'Más de $30.000'];
const ordenarPor = ['Mayor precio', 'Menor precio', 'Lo más nuevo'];

export default function AccesoriosPage() {
  const [productos, setProductos] = useState([]);
  const [marca, setMarca] = useState('Todas');
  const [disp, setDisp] = useState('Todas');
  const [rango, setRango] = useState('Todos');
  const [orden, setOrden] = useState('Lo más nuevo');
  const { addItem } = useCart();
  const router = useRouter();

  // Aplicar filtros y orden en cliente
  const filteredProductos = useMemo(() => {
    let filtered = [...productos];
    if (marca !== 'Todas') filtered = filtered.filter(p => p.marca === marca);
    if (disp !== 'Todas') filtered = filtered.filter(p => disp === 'Disponible' ? p.stock > 0 : p.stock === 0);
    if (rango !== 'Todos') {
      if (rango === 'Menos de $10.000') filtered = filtered.filter(p => p.precio < 10000);
      else if (rango === '$10.000 - $30.000') filtered = filtered.filter(p => p.precio >= 10000 && p.precio <= 30000);
      else if (rango === 'Más de $30.000') filtered = filtered.filter(p => p.precio > 30000);
    }
    if (orden === 'Mayor precio') filtered = [...filtered].sort((a, b) => b.precio - a.precio);
    else if (orden === 'Menor precio') filtered = [...filtered].sort((a, b) => a.precio - b.precio);
    else if (orden === 'Lo más nuevo') filtered = [...filtered].sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());
    return filtered;
  }, [productos, marca, disp, rango, orden]);

  useEffect(() => {
    fetch('/api/productos?categoria=Accesorios')
      .then(res => res.json())
      .then(data => {
        // La API devuelve directamente un array de productos, no un objeto con propiedad productos
        setProductos(data || []);
        console.log(`Cargados ${data.length} productos de la categoría Accesorios`);
      })
      .catch(error => {
        console.error('Error al cargar productos:', error);
      });
  }, []);

  return (
    <>
      <Head>
        <title>Accesorios – AIM Exchange</title>
      </Head>
      <Navbar />
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Accesorios</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div>
              <label className="block mb-2 font-medium">Disponibilidad</label>
              <select value={disp} onChange={e => setDisp(e.target.value)} className="w-full border rounded px-3 py-2 bg-gray-800 border-gray-700 text-white">
                {disponibilidad.map(op => <option key={op}>{op}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-medium">Marca</label>
              <select value={marca} onChange={e => setMarca(e.target.value)} className="w-full border rounded px-3 py-2 bg-gray-800 border-gray-700 text-white">
                {marcas.map(op => <option key={op}>{op}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-medium">Rango de Precios</label>
              <select value={rango} onChange={e => setRango(e.target.value)} className="w-full border rounded px-3 py-2 bg-gray-800 border-gray-700 text-white">
                {rangos.map(op => <option key={op}>{op}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-medium">Ordenar por</label>
              <select value={orden} onChange={e => setOrden(e.target.value)} className="w-full border rounded px-3 py-2 bg-gray-800 border-gray-700 text-white">
                {ordenarPor.map(op => <option key={op}>{op}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProductos.length === 0 ? (
              <div className="col-span-full bg-gray-800 rounded shadow p-4 text-center text-gray-400">No hay productos para mostrar.</div>
            ) : (
              filteredProductos.map(prod => (
                <div key={prod.id} className="bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                  {/* Imagen clickeable */}
                  <div 
                    className="cursor-pointer relative" 
                    onClick={() => router.push(`/producto/${prod.id}`)}
                  >
                    <div className="aspect-square bg-gray-800 flex items-center justify-center overflow-hidden">
                      {/* Badge de disponibilidad */}
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white z-10 ${
                        prod.stock > 0 ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {prod.stock > 0 ? 'Disponible' : 'Sin Stock'}
                      </div>
                      {/* Badge de descuento - solo si hay promoción */}
                      {prod.promocion && prod.descuento > 0 && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold z-10">
                          -{prod.descuento}%
                        </div>
                      )}
                      <img 
                        src={prod.imagenUrl || ''} 
                        alt={prod.nombre} 
                        className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                  </div>
                  
                  {/* Contenido */}
                  <div className="p-6 space-y-4">
                    {/* Título clickeable */}
                    <h3 
                      className="font-bold text-xl text-white hover:text-red-400 cursor-pointer transition-colors line-clamp-2"
                      onClick={() => router.push(`/producto/${prod.id}`)}
                    >
                      {prod.nombre}
                    </h3>
                    
                    {/* Precio */}
                    <div className="text-2xl font-bold text-red-500">
                      ${prod.precio}
                    </div>
                    
                    {/* Botón agregar al carrito */}
                    <button
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem({
                          id: prod.id,
                          name: prod.nombre,
                          price: prod.precio,
                          image: prod.imagenUrl || '',
                          quantity: 1
                        });
                      }}
                      disabled={prod.stock === 0}
                    >
                      {prod.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
