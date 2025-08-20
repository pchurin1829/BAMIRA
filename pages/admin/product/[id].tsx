import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

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
  extraImages?: string; // comma-separated URLs
}

export default function AdminProductEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  // Manage existing images preview and removals
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  // Form validation schema
  const validationSchema = Yup.object({
    nombre: Yup.string().required('Nombre es requerido'),
    descripcion: Yup.string().required('Contenido es requerido'),
    specs: Yup.string(),
    precio: Yup.number().typeError('Precio inválido').positive('Debe ser mayor a 0').required('Precio es requerido'),
    stock: Yup.number().typeError('Stock inválido').integer('Debe ser entero').min(0, 'No puede ser negativo').required('Stock es requerido'),
    manualUrl: Yup.string().url('URL inválida').nullable(),
    dimensions: Yup.string().nullable(),
    marca: Yup.string().nullable(),
  });
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: yupResolver(validationSchema) });

  useEffect(() => {
    if (!id) return;
    // Only admin should access; implement auth as needed
    fetch(`/api/admin/product/${id}`)
      .then(res => res.json())
      .then((data: any) => {
        setProduct(data);
        reset({
          nombre: data.nombre,
          // mostrar en textarea como texto plano con saltos
          descripcion: htmlToPlain(data.descripcion),
          specs: htmlToPlain(data.specs || ''),
          precio: data.precio,
          stock: data.stock,
          manualUrl: data.manualUrl || '',
          dimensions: htmlToPlain(data.dimensions || ''),
          marca: data.marca || '',
        });
        // parse existing extraImages
        const extras = data.extraImages ? (data.extraImages as string).split(',') : [];
        setExistingImages(extras);
      })
      .catch(() => setError('Error al cargar producto'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };
  const handleImageRemove = (url: string) => {
    setRemovedImages(prev => [...prev, url]);
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const onSubmitForm = async (formDataValues: any) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      // Prepare multipart/form-data
      const formData = new FormData();
      // Append text fields
  Object.entries(formDataValues).forEach(([key, value]) => formData.append(key, String(value)));
      // Append image files
      if (selectedFiles) Array.from(selectedFiles).forEach(file => formData.append('images', file));
      const res = await fetch(`/api/admin/product/${id}`, { method: 'PUT', body: formData });
      if (res.ok) setSuccess(true);
      else {
        const err = await res.json();
        setError(err.error || 'Error al guardar');
      }
    } catch {
      setError('Error de red');
    } finally {
      setSaving(false);
    }
  };

  // Helper: convierte HTML guardado a texto plano con saltos para mostrar en textareas
  function htmlToPlain(html: string | null | undefined) {
    if (!html) return '';
    // reemplaza <br> por salto de línea
    let txt = String(html).replace(/<br\s*\/?>/gi, '\n');
    // convierte </p> en doble salto (párrafo)
    txt = txt.replace(/<\/p>\s*/gi, '\n\n');
    // listas: <li> -> "- " y cierre de li -> salto
    txt = txt.replace(/<li\s*[^>]*>/gi, '- ');
    txt = txt.replace(/<\/li>/gi, '\n');
    // elimina cualquier tag restante
    txt = txt.replace(/<[^>]+>/g, '');
    // decode entidades HTML (usa elemento DOM)
    try {
      const ta = typeof document !== 'undefined' ? document.createElement('textarea') : null;
      if (ta) {
        ta.innerHTML = txt;
        return ta.value.trim();
      }
    } catch (e) {
      /* ignore */
    }
    return txt.trim();
  }

  // Ejemplo de uso en el fetch que rellena el formulario (dentro del useEffect que carga producto):
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/productos/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      // setea otros campos...
      // para specs/dimensions/descripcion: convertir a texto plano para el textarea
      setSpecs(htmlToPlain(data.specs));
      setDimensions(htmlToPlain(data.dimensions));
      setDescripcion(htmlToPlain(data.descripcion));
      // ...
    }
    load();
  }, [id]);

  // Al enviar el form envías los valores tal cual (texto plano). Tu API ya convierte/sanitiza al guardarlo.

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
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <input
                {...register('nombre')}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
            </div>
            {/* Marca */}
            <div>
              <label className="block text-sm font-medium">Marca</label>
              <input
                {...register('marca')}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
              />
            </div>
            {/* Precio y Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Precio</label>
                <input
                  {...register('precio')}
                  type="number"
                  step="0.01"
                  className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
                />
                {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Stock</label>
                <input
                  {...register('stock')}
                  type="number"
                  className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
              </div>
            </div>
            {/* Especificaciones */}
            <div>
              <label className="block text-sm font-medium">Especificaciones (HTML o texto)</label>
              <textarea
                {...register('specs')}
                rows={6}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700 resize-vertical"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Contenido</label>
              <textarea
                {...register('descripcion')}
                rows={6}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700 resize-vertical"
              />
              {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>}
            </div>
            {/* Dimensiones y peso */}
            <div>
              <label className="block text-sm font-medium">Dimensiones y peso</label>
              <textarea
                {...register('dimensions')}
                rows={4}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700 resize-vertical"
              />
            </div>
            {/* Manual */}
            <div>
              <label className="block text-sm font-medium">Manual</label>
              <input
                {...register('manualUrl')}
                className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
              />
            </div>
            {/* Images upload and existing images */}
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
            {/* Preview existing extraImages */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium">Imágenes Existentes</label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt={`Imagen ${idx + 1}`} className="w-full h-auto rounded" />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(url)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                        title="Eliminar imagen"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
