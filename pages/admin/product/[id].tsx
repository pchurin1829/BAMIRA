import React, { useState, useEffect, useRef } from 'react';
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
  promocion?: boolean;
  descuento?: number;
  precioOriginal?: number;
  promoExpira?: string;
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

  // color swatch helpers (visibles en fondos oscuros y claros)
  const colorHexMap: Record<string, string> = {
    default: '#6b7280', // gray
    black: '#000000',
    white: '#ffffff',
    pink: '#ffb6c1',
    red: '#e53935',
    blue: '#1e88e5',
    green: '#43a047',
    yellow: '#fdd835',
    orange: '#fb8c00',
  };

  // Color picker dropdown (custom, works on dark/light)
  const ColorPicker: React.FC<{ value: string; onChange: (v: string) => void; small?: boolean }> = ({ value, onChange, small }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener('click', onDoc);
      return () => document.removeEventListener('click', onDoc);
    }, []);

    const opts = Object.keys(colorHexMap);
    return (
      <div className="relative inline-block" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className={`flex items-center space-x-2 px-2 py-1 rounded ${small ? 'text-xs' : 'text-sm'} bg-transparent border border-gray-700 hover:border-gray-600`}
        >
          <div style={swatchStyle(value)} />
          <span style={{ color: swatchTextColor(value) }} className="truncate">{value}</span>
          <svg className="w-3 h-3 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.1 1.02l-4.25 4.65a.75.75 0 01-1.1 0L5.2 8.27a.75.75 0 01.03-1.06z" /></svg>
        </button>
        {open && (
          <div className="absolute z-50 mt-2 w-44 rounded shadow-lg bg-white text-black dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
            {opts.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div style={swatchStyle(opt)} />
                <span className="capitalize">{opt}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const swatchStyle = (colorKey: string) => {
    const hex = colorHexMap[colorKey] || colorHexMap['default'];
    // light swatches need a dark border for contrast, dark swatches a light border
    const isLight = hex === '#ffffff' || hex === '#ffb6c1' || hex === '#fdd835' || hex === '#fb8c00';
    return {
      backgroundColor: hex,
      width: 18,
      height: 18,
      borderRadius: 9999,
      border: isLight ? '1px solid rgba(0,0,0,0.45)' : '1px solid rgba(255,255,255,0.14)',
      boxShadow: '0 0 0 2px rgba(0,0,0,0.18) inset',
      flexShrink: 0,
    } as React.CSSProperties;
  };

  const swatchTextColor = (colorKey: string) => {
    const hex = colorHexMap[colorKey] || colorHexMap['default'];
    // simple rule: white background -> dark text, else light text
    if (hex === '#ffffff' || hex === '#ffb6c1' || hex === '#fdd835') return '#000';
    return '#fff';
  };

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
            
            {/* Sección de Promociones */}
            <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
              <h3 className="text-lg font-medium mb-4 text-red-400">Configuración de Promoción</h3>
              
              {product?.promocion && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 font-medium">✅ Promoción Activa</p>
                      <p className="text-sm text-green-200">
                        Descuento: {product.descuento}% | 
                        Precio original: ${product.precioOriginal} | 
                        Precio promocional: ${product.precio}
                      </p>
                      {product.promoExpira && (
                        <p className="text-xs text-green-200">
                          Expira: {new Date(product.promoExpira).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('¿Deseas quitar la promoción?')) {
                          try {
                            const res = await fetch(`/api/productos/${product.id}/promo`, {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' }
                            });
                            if (res.ok) {
                              window.location.reload();
                            } else {
                              alert('Error al quitar promoción');
                            }
                          } catch (error) {
                            alert('Error al quitar promoción');
                          }
                        }
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      Quitar Promoción
                    </button>
                  </div>
                </div>
              )}
              
              {!product?.promocion && (
                <div className="text-gray-400 text-sm">
                  <p>Este producto no tiene promoción activa.</p>
                  <p>Para activar una promoción, usa el botón "Promo" en la lista de productos del panel admin principal.</p>
                </div>
              )}
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
                    <div key={i} className="flex items-center space-x-3">
                      <div className="text-sm truncate" style={{ maxWidth: 260 }}>{f.name}</div>
                      <div className="ml-2 flex items-center space-x-2">
                        <ColorPicker
                          value={newImageColors[i] || 'default'}
                          onChange={(v) => setNewImageColors(prev => { const copy = [...prev]; copy[i] = v; return copy; })}
                          small
                        />
                      </div>
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
                      {/* preview limitado a 350x250 para visualización solamente */}
                      <img
                        src={url}
                        alt={`Imagen ${idx + 1}`}
                        className="rounded object-contain"
                        style={{ maxWidth: 350, maxHeight: 250, width: '100%', height: 'auto' }}
                      />
                      {/* Color badge overlay if known */}
                      <div className="absolute left-2 top-2">
                        <div className="flex items-center space-x-2">
                          <ColorPicker
                            value={existingImageColors[url] || existingImagesByColor[url] || 'default'}
                            onChange={(v) => setExistingImageColors(prev => ({ ...prev, [url]: v }))}
                            small
                          />
                        </div>
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
