import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean|null>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState({ nombre: '', marca: '', categoriaId: '', precio: 0, stock: 0, imagenUrl: '', descripcion: '', disponible: true, promo: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsAdmin(data.user?.rol === 'admin');
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      })
      .catch(() => {
        setUser(null);
        setIsAdmin(false);
      });
  }, []);

  // Obtener productos y categorías reales
  useEffect(() => {
    if (isAdmin) {
      fetch('/api/productos', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setProductos(data.productos || []));
      fetch('/api/categorias', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setCategorias(data.categorias || []));
    }
  }, [isAdmin]);

  // Agregar producto
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
      credentials: 'include',
    });
    // Refrescar productos
    fetch('/api/productos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProductos(data.productos || []));
    setForm({ nombre: '', marca: '', categoriaId: '', precio: 0, stock: 0, imagenUrl: '', descripcion: '', disponible: true, promo: false });
  };

  // Editar producto
  const handleEdit = (prod: any) => {
    setEditId(prod.id);
    setForm({ ...prod });
  };
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/productos/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
      credentials: 'include',
    });
    fetch('/api/productos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProductos(data.productos || []));
    setEditId(null);
    setForm({ nombre: '', marca: '', categoriaId: '', precio: 0, stock: 0, imagenUrl: '', descripcion: '', disponible: true, promo: false });
  };

  // Eliminar producto
  const handleDelete = async (id: string) => {
    await fetch(`/api/productos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    fetch('/api/productos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProductos(data.productos || []));
  };

  // Activar promo
  const handlePromo = async (id: string) => {
    await fetch(`/api/productos/${id}/promo`, {
      method: 'POST',
      credentials: 'include',
    });
    fetch('/api/productos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProductos(data.productos || []));
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.url) {
      setForm({ ...form, imagenUrl: data.url });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Verificando acceso...</div>;
  }
  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center text-2xl text-red-600 font-bold">Acceso denegado</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8 text-center">Panel de Administración</h1>
        <div className="mb-12">
          <h2 className="font-bold mb-4">Agregar nuevo producto</h2>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" onSubmit={editId ? handleUpdate : handleAdd}>
            <div className="flex flex-col gap-4 md:flex-row md:gap-4 col-span-3">
              <input type="text" placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required className="bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-500 shadow-sm text-center w-full" />
              <input type="text" placeholder="Marca" value={form.marca || ''} onChange={e => setForm({ ...form, marca: e.target.value })} required className="bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-500 shadow-sm text-center w-full" />
              <select value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: Number(e.target.value) })} required className="bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-500 shadow-sm text-center w-full">
                <option value="">Seleccionar categoría</option>
                {['Accesorios','Audio','Mouse','Mousepad','Teclados'].map((cat) => (
                  <option key={cat} value={categorias.find(c => c.nombre === cat)?.id || ''}>{cat}</option>
                ))}
              </select>
              <input type="number" placeholder="Precio" value={form.precio === 0 ? '' : form.precio} onChange={e => setForm({ ...form, precio: Number(e.target.value) })} required className="bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-500 shadow-sm text-center w-full" />
              <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} required className="bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-500 shadow-sm text-center w-full" />
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:gap-4 col-span-3">
              <input type="text" placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-500 shadow-sm text-center w-full" />
              <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} className="bg-white border border-gray-300 rounded px-3 py-2 flex flex-col items-center justify-center cursor-pointer transition hover:bg-gray-100 shadow-sm text-center w-full" style={{ minHeight: 48 }}>
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                <button type="button" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors mb-2" onClick={() => fileInputRef.current?.click()}>Seleccionar imagen</button>
                <span className="text-xs text-gray-500">Arrastra aquí o usa el botón</span>
                {form.imagenUrl && <img src={form.imagenUrl} alt="preview" className="mt-2 w-16 h-16 object-contain rounded shadow" />}
              </div>
            </div>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors col-span-3">{editId ? 'Actualizar' : 'Agregar'}</button>
          </form>
        </div>
        <div>
          <h2 className="font-bold mb-4">Productos</h2>
          <table className="w-full border mb-8 overflow-x-auto block">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 whitespace-nowrap text-xs md:text-sm">Nombre</th>
                <th className="p-2 whitespace-nowrap text-xs md:text-sm">Marca</th>
                <th className="p-2 whitespace-nowrap text-xs md:text-sm">Categoría</th>
                <th className="p-2 whitespace-nowrap text-xs md:text-sm">Precio</th>
                <th className="p-2 whitespace-nowrap text-xs md:text-sm">Stock</th>
                <th className="p-2 whitespace-nowrap text-xs md:text-sm">Imagen</th>
                <th className="p-2 whitespace-nowrap text-xs md:text-sm">Descripción</th>
                <th className="p-2 whitespace-nowrap text-xs md:text-sm">Promo</th>
                <th className="p-2 whitespace-nowrap text-xs md:text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod: any) => (
                <tr key={prod.id} className="border-t">
                  <td className="p-2 font-bold whitespace-nowrap text-xs md:text-sm max-w-[160px] truncate">{prod.nombre}</td>
                  <td className="p-2 whitespace-nowrap text-xs md:text-sm">{prod.marca || ''}</td>
                  <td className="p-2 whitespace-nowrap text-xs md:text-sm">{categorias.find((cat: any) => cat.id === prod.categoriaId)?.nombre || ''}</td>
                  <td className="p-2 whitespace-nowrap text-xs md:text-sm">${prod.precio.toLocaleString()}</td>
                  <td className="p-2 whitespace-nowrap text-xs md:text-sm">{prod.stock}</td>
                  <td className="p-2 whitespace-nowrap text-xs md:text-sm"><img src={prod.imagenUrl} alt={prod.nombre} className="w-12 h-12 object-contain mx-auto" /></td>
                  <td className="p-2 whitespace-nowrap text-xs md:text-sm max-w-[120px] truncate">{prod.descripcion}</td>
                  <td className="p-2 whitespace-nowrap text-xs md:text-sm">{prod.promo ? 'Sí' : 'No'}</td>
                  <td className="p-2 whitespace-nowrap text-xs md:text-sm">
                    <div className="flex gap-1 justify-center flex-wrap">
                      <button
                        className="flex items-center justify-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold shadow-sm transition-all border border-blue-200 text-xs min-w-[70px]"
                        onClick={() => handleEdit(prod)}
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13z" /></svg>
                        <span className="text-xs text-center">Editar</span>
                      </button>
                      <button
                        className="flex items-center justify-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold shadow-sm transition-all border border-red-200 text-xs min-w-[70px]"
                        onClick={() => handleDelete(prod.id)}
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        <span className="text-xs text-center">Eliminar</span>
                      </button>
                      <button
                        className="flex items-center justify-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-semibold shadow-sm transition-all border border-green-200 text-xs min-w-[70px]"
                        onClick={() => handlePromo(prod.id)}
                        title="Promo"
                      >
                        {/* Icono de etiqueta clásico */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H8a1 1 0 01-1-1V7zm0 0l10 10" />
                          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                        </svg>
                        <span className="text-xs text-center">Promo</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
}
