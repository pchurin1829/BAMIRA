import React, { useEffect, useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../components/CartContext';
import { useRouter } from 'next/router';
import Head from 'next/head';

function stripHtml(html: string) {
  if (!html) return '';
  // remove tags
  const s = html.replace(/<br\s*\/?>(\s*)/gi, '\n').replace(/<[^>]+>/g, '');
  try {
    const ta = typeof document !== 'undefined' ? document.createElement('textarea') : null;
    if (ta) { ta.innerHTML = s; return ta.value.trim(); }
  } catch (e) { /* ignore */ }
  return s.trim();
}

const marcas = ['Todas', 'Logitech', 'Razer', 'Corsair', 'HyperX'];
const disponibilidad = ['Todas', 'Disponible', 'Agotado'];
const rangos = ['Todos', 'Menos de $50.000', '$50.000 - $100.000', 'Más de $100.000'];
const ordenarPor = ['Mayor precio', 'Menor precio', 'Lo más nuevo'];

export default function MousePage() {
  const [productos, setProductos] = useState([]);
  const [marca, setMarca] = useState('Todas');
  const [disp, setDisp] = useState('Todas');
  const [rango, setRango] = useState('Todos');
  const [orden, setOrden] = useState('Lo más nuevo');
  const { addItem } = useCart();
  const router = useRouter();

  // Ejemplo de producto para agregar (debería venir de tu base de datos)
  const exampleProduct = {
    id: 'mouse-1',
    name: 'Mouse Ejemplo',
    price: 49990,
    image: '',
    quantity: 1,
  };

  useEffect(() => {
    fetch('/api/productos?categoria=Mouse')
      .then(res => res.json())
      .then(data => {
        // La API devuelve directamente un array de productos, no un objeto con propiedad productos
        setProductos(data || []);
        console.log(`Cargados ${data.length} productos de la categoría Mouse`);
      })
      .catch(error => {
        console.error('Error al cargar productos:', error);
      });
  }, []);

  // Client-side filtered products based on selected filters
  const filteredProductos = useMemo(() => {
    let filtered = [...productos];
    if (marca !== 'Todas') {
      filtered = filtered.filter(p => p.marca === marca);
    }
    if (disp !== 'Todas') {
      filtered = filtered.filter(p => disp === 'Disponible' ? p.stock > 0 : p.stock === 0);
    }
    if (rango !== 'Todos') {
      if (rango === 'Menos de $50.000') {
        filtered = filtered.filter(p => p.precio < 50000);
      } else if (rango === '$50.000 - $100.000') {
        filtered = filtered.filter(p => p.precio >= 50000 && p.precio <= 100000);
      } else if (rango === 'Más de $100.000') {
        filtered = filtered.filter(p => p.precio > 100000);
      }
    }
    if (orden === 'Mayor precio') {
      filtered = [...filtered].sort((a, b) => b.precio - a.precio);
    } else if (orden === 'Menor precio') {
      filtered = [...filtered].sort((a, b) => a.precio - b.precio);
    } else if (orden === 'Lo más nuevo') {
      filtered = [...filtered].sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());
    }
    return filtered;
  }, [productos, marca, disp, rango, orden]);

  return (
    <>
      <Head>
        <title>Mouse – AIM Exchange</title>
      </Head>
      <Navbar />
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Mouse</h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProductos.length === 0 ? (
              <div className="bg-gray-800 rounded shadow p-4 text-center text-gray-400">No hay productos para mostrar.</div>
            ) : (
              filteredProductos.map(prod => (
                <div key={prod.id} className="bg-gray-900 rounded shadow p-4 text-center cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => router.push(`/producto/${prod.id}`)}>
                  <img src={prod.imagenUrl || ''} alt={prod.nombre} className="w-full h-32 object-contain mb-2" />
                  <div className="font-bold text-lg text-white">{prod.nombre}</div>
                  <div className="text-sm text-gray-400">{stripHtml(String(prod.descripcion || ''))}</div>
                  <div className="text-red-600 font-bold mt-2">${prod.precio}</div>
                  <button
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold w-full transition-colors"
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
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
