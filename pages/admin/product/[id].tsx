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
  const [deletionReport, setDeletionReport] = useState<{ deleted: string[]; failed: { url: string; reason: string }[] } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [newImageColors, setNewImageColors] = useState<string[]>([]);
  // Manage existing images preview and removals
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImagesByColor, setExistingImagesByColor] = useState<Record<string, string>>({});
  const [existingImageColors, setExistingImageColors] = useState<Record<string, string>>({});
  const [confirmDeleteUrl, setConfirmDeleteUrl] = useState<string | null>(null);

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
        // if imagesByColor exists, map urls -> color for badges
        const byColor = (data.imagesByColor || null);
        if (byColor) {
          const map: Record<string, string> = {};
          Object.entries(byColor).forEach(([color, urls]: any) => {
            if (Array.isArray(urls)) urls.forEach((u: string) => (map[u] = color));
          });
          setExistingImagesByColor(map);
          setExistingImageColors({ ...map });
        }
      })
      .catch(() => setError('Error al cargar producto'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setSelectedFiles(files);
    // initialize colors array for new files (default)
    if (files) {
      const arr = Array.from(files).map(() => 'default');
      setNewImageColors(arr);
    } else setNewImageColors([]);
  };
  const handleImageRemove = (url: string) => {
    // open confirmation modal instead of deleting immediately
    setConfirmDeleteUrl(url);
  };

  const confirmDelete = () => {
    if (!confirmDeleteUrl) return;
    const url = confirmDeleteUrl;
    setRemovedImages(prev => [...prev, url]);
    setExistingImages(prev => prev.filter(img => img !== url));
    // also remove any selected color override for that url
    setExistingImageColors(prev => {
      const copy = { ...prev };
      delete copy[url];
      return copy;
    });
    setConfirmDeleteUrl(null);
  };

  const cancelDelete = () => setConfirmDeleteUrl(null);

  const onSubmitForm = async (formDataValues: any) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      // Prepare multipart/form-data
      const formData = new FormData();
      // Append text fields
  Object.entries(formDataValues).forEach(([key, value]) => formData.append(key, String(value)));
      // Append removals so server can remove kept/removed logic
      if (removedImages.length > 0) formData.append('removeImages', removedImages.join(','));
      // Append image files and collect colors mapping
      if (selectedFiles) {
        Array.from(selectedFiles).forEach(file => formData.append('images', file));
        // send imageColors aligned with the files order as JSON
        if (newImageColors.length > 0) {
          try {
            formData.append('imageColors', JSON.stringify(newImageColors));
          } catch (e) {
            formData.append('imageColors', newImageColors.join(','));
          }
        }
      }
      // include edits to existing image colors
      if (Object.keys(existingImageColors).length > 0) {
        formData.append('existingImageColors', JSON.stringify(existingImageColors));
      }
      const res = await fetch(`/api/admin/product/${id}`, { method: 'PUT', body: formData });
      if (res.ok) {
        const body = await res.json();
        setSuccess(true);
        if (body.deleted || body.failed) {
          setDeletionReport({ deleted: body.deleted || [], failed: body.failed || [] });
        } else {
          setDeletionReport(null);
        }
        // auto-refresh product data to reflect new images/colors
        try {
          const refreshed = await fetch(`/api/admin/product/${id}`);
          if (refreshed.ok) {
            const data = await refreshed.json();
            // update existingImages and color map
            const extras = data.extraImages ? (data.extraImages as string).split(',') : [];
            setExistingImages(extras);
            const byColor = (data.imagesByColor || null);
            if (byColor) {
              const map: Record<string, string> = {};
              Object.entries(byColor).forEach(([color, urls]: any) => {
                if (Array.isArray(urls)) urls.forEach((u: string) => (map[u] = color));
              });
              setExistingImagesByColor(map);
              setExistingImageColors({ ...map });
            }
            // clear selected files
            setSelectedFiles(null);
            setNewImageColors([]);
            setRemovedImages([]);
            // also reset form fields from refreshed data
            reset({
              nombre: data.nombre,
              descripcion: htmlToPlain(data.descripcion),
              specs: htmlToPlain(data.specs || ''),
              precio: data.precio,
              stock: data.stock,
              manualUrl: data.manualUrl || '',
              dimensions: htmlToPlain(data.dimensions || ''),
              marca: data.marca || '',
            });
          }
        } catch (e) {
          // ignore refresh errors, save succeeded
        }
      } 
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
  // Nota: la carga del producto y el reset del formulario ya se realizan en el useEffect superior.

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
              {/* If files selected, show per-file color pickers */}
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm text-gray-400">Asignar color a cada imagen (opcional)</div>
                  {Array.from(selectedFiles).map((f, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="text-sm">{f.name}</div>
                      <select
                        value={newImageColors[i] || 'default'}
                        onChange={(e) => setNewImageColors(prev => { const copy = [...prev]; copy[i] = e.target.value; return copy; })}
                        className="ml-2 bg-gray-800 text-white p-1 rounded"
                      >
                        <option value="default">default</option>
                        <option value="black">black</option>
                        <option value="white">white</option>
                        <option value="pink">pink</option>
                        <option value="red">red</option>
                        <option value="blue">blue</option>
                        <option value="green">green</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Preview existing extraImages */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium">Imágenes Existentes</label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt={`Imagen ${idx + 1}`} className="w-full h-auto rounded" />
                      {/* Color badge overlay if known */}
                      <div className="absolute left-2 top-2">
                        <select
                          value={existingImageColors[url] || existingImagesByColor[url] || 'default'}
                          onChange={(e) => setExistingImageColors(prev => ({ ...prev, [url]: e.target.value }))}
                          className="bg-white/10 text-white text-xs p-1 rounded"
                        >
                          <option value="default">default</option>
                          <option value="black">black</option>
                          <option value="white">white</option>
                          <option value="pink">pink</option>
                          <option value="red">red</option>
                          <option value="blue">blue</option>
                          <option value="green">green</option>
                        </select>
                      </div>
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
      {/* Confirm delete modal */}
      {confirmDeleteUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded shadow-xl w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-300 mb-4">¿Eliminar permanentemente esta imagen? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={cancelDelete} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">Cancelar</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
