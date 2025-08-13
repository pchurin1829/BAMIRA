import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  marca?: string;
  specs?: string;
  manualUrl?: string;
  dimensions?: string;
}

export default function AdminProductEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [formValues, setFormValues] = useState<Product>({
    id: 0,
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    marca: '',
    specs: '',
    manualUrl: '',
    dimensions: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (!id) return;
    // Only admin should access; implement auth as needed
    fetch(`/api/admin/product/${id}`)
      .then(res => res.json())
      .then((data: Product) => {
        setProduct(data);
        setFormValues(data);
      })
      .catch(() => setError('Error al cargar producto'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      // Prepare multipart/form-data
      const formData = new FormData();
      // Append text fields
      ['nombre','descripcion','precio','stock','marca','specs','manualUrl','dimensions'].forEach(key => {
        formData.append(key, (formValues as any)[key]);
      });
      // Append image files
      if (selectedFiles) {
        Array.from(selectedFiles).forEach(file => formData.append('images', file));
      }
      const res = await fetch(`/api/admin/product/${id}`, {
        method: 'PUT',
        body: formData,
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const err = await res.json();
        setError(err.error || 'Error al guardar');
      }
    } catch {
      setError('Error de red');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (!product) return <div className="p-8 text-center text-red-500">Producto no encontrado</div>;

  return (
    <>
      <Navbar />
      <div className="bg-black text-white min-h-screen p-8">
        <div className="max-w-3xl mx-auto bg-gray-900 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Editar Producto #{product.id}</h1>
          {error && <div className="mb-4 p-2 bg-red-700 rounded">{error}</div>}
          {success && <div className="mb-4 p-2 bg-green-700 rounded">Guardado exitosamente</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <input
                name="nombre"
                value={formValues.nombre}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Contenido</label>
              <textarea
                name="descripcion"
                value={formValues.descripcion}
                onChange={handleChange}
                rows={4}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700 resize-vertical"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Precio</label>
                <input
                  name="precio"
                  type="number"
                  step="0.01"
                  value={formValues.precio}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Stock</label>
                <input
                  name="stock"
                  type="number"
                  value={formValues.stock}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Marca</label>
              <input
                name="marca"
                value={formValues.marca}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Especificaciones (HTML o texto)</label>
              <textarea
                name="specs"
                value={formValues.specs}
                onChange={handleChange}
                rows={4}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700 resize-vertical"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Manual</label>
              <input
                name="manualUrl"
                value={formValues.manualUrl}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Dimensiones y peso</label>
              <input
                name="dimensions"
                value={formValues.dimensions}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Imágenes (hasta 20 archivos)</label>
              <div className="mt-1 flex items-center space-x-2">
                <label htmlFor="images-upload" className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded">
                  Seleccionar archivos
                </label>
                <span className="text-sm text-gray-400">
                  {selectedFiles && selectedFiles.length > 0
                    ? `${selectedFiles.length} archivo(s) seleccionado(s)`
                    : 'No hay archivos seleccionados'}
                </span>
              </div>
              <input
                id="images-upload"
                type="file"
                name="images"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/producto/${product.id}`)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium"
              >
                Volver al detalle
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
