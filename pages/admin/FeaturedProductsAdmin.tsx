import { useEffect, useState } from 'react';

export default function FeaturedProductsAdmin() {
  const [featured, setFeatured] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/featured-products')
      .then(res => res.json())
      .then(setFeatured);
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data.productos || []));
  }, []);

  const handleAdd = async e => {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    await fetch('/api/featured-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productoId: Number(selectedId) })
    });
    fetch('/api/featured-products').then(res => res.json()).then(setFeatured);
    setSelectedId('');
    setLoading(false);
  };

  const handleDelete = async productoId => {
    setLoading(true);
    await fetch('/api/featured-products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productoId })
    });
    fetch('/api/featured-products').then(res => res.json()).then(setFeatured);
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="mb-6 flex gap-2 items-center">
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Seleccionar producto</option>
          {productos.map(prod => (
            <option key={prod.id} value={prod.id}>{prod.nombre}</option>
          ))}
        </select>
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded font-bold" disabled={loading || !selectedId}>{loading ? 'Agregando...' : 'Agregar destacado'}</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {featured.map(fp => (
          <div key={fp.productoId} className="rounded shadow p-4 relative bg-white">
            <button onClick={() => handleDelete(fp.productoId)} className="absolute top-2 right-2 text-red-600 font-bold">X</button>
            {fp.producto?.imagenUrl && <img src={fp.producto.imagenUrl} alt="img" className="mb-2 w-full h-24 object-contain rounded" />}
            <h3 className="font-bold text-lg">{fp.producto?.nombre}</h3>
            <p className="text-sm text-gray-500">{fp.producto?.descripcion}</p>
            <div className="text-red-600 font-bold">${fp.producto?.precio}</div>
          </div>
        ))}
      </div>
    </div>
  );
}