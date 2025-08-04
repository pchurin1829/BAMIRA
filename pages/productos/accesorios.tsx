import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

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

  useEffect(() => {
    fetch('/api/productos?categoria=Accesorios')
      .then(res => res.json())
      .then(data => setProductos(data.productos || []));
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Accesorios</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block mb-2 font-medium">Disponibilidad</label>
            <select value={disp} onChange={e => setDisp(e.target.value)} className="w-full border rounded px-3 py-2">
              {disponibilidad.map(op => <option key={op}>{op}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium">Marca</label>
            <select value={marca} onChange={e => setMarca(e.target.value)} className="w-full border rounded px-3 py-2">
              {marcas.map(op => <option key={op}>{op}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium">Rango de Precios</label>
            <select value={rango} onChange={e => setRango(e.target.value)} className="w-full border rounded px-3 py-2">
              {rangos.map(op => <option key={op}>{op}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium">Ordenar por</label>
            <select value={orden} onChange={e => setOrden(e.target.value)} className="w-full border rounded px-3 py-2">
              {ordenarPor.map(op => <option key={op}>{op}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productos.length === 0 ? (
            <div className="bg-white rounded shadow p-4 text-center text-gray-500">No hay productos para mostrar.</div>
          ) : (
            productos.map(prod => (
              <div key={prod.id} className="bg-white rounded shadow p-4 text-center">
                <img src={prod.imagenUrl || ''} alt={prod.nombre} className="w-full h-32 object-contain mb-2" />
                <div className="font-bold text-lg">{prod.nombre}</div>
                <div className="text-sm text-gray-500">{prod.descripcion}</div>
                <div className="text-red-600 font-bold mt-2">${prod.precio}</div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
