import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Upload, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [uploadingComprobante, setUploadingComprobante] = useState<number | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    fetch(`/api/mis-pedidos?email=${encodeURIComponent(user.email)}`)
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setOrders(data || []);
        } else {
          setOrders([]);
        }
        setOrdersLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setOrdersLoading(false);
      });
  }, [user]);

  const handleLogout = () => {
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/';
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, orderId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showNotification('error', 'Solo se permiten archivos de imagen (JPG, PNG, GIF)');
      return;
    }

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      showNotification('error', 'El archivo no puede ser mayor a 10MB');
      return;
    }

    setUploadingComprobante(orderId);

    const formData = new FormData();
    formData.append('comprobante', file);
    formData.append('orderId', orderId.toString());

    try {
      const response = await fetch('/api/comprobantes/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showNotification('success', 'Comprobante subido exitosamente');
        // Recargar pedidos
        const updatedOrders = await fetch(`/api/mis-pedidos?email=${encodeURIComponent(user.email)}`);
        if (updatedOrders.ok) {
          const data = await updatedOrders.json();
          setOrders(data || []);
        }
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Error al subir el comprobante');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Error al subir el comprobante');
    } finally {
      setUploadingComprobante(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente_subida':
        return <Upload className="w-4 h-4 text-yellow-500" />;
      case 'pendiente_revision':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pago_recibido':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Upload className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendiente_subida':
        return 'Pendiente de subida';
      case 'pendiente_revision':
        return 'En revisión';
      case 'pago_recibido':
        return 'Pago confirmado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Sin comprobante';
    }
  };

  const calculateTotal = (order: any) => {
    return order.items?.reduce((total: number, item: any) => total + (item.precio * item.cantidad), 0) || 0;
  };

  const openImageModal = (imageUrl: string) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImageUrl('');
  };

  if (loading) {
    return <div className="bg-black min-h-screen flex items-center justify-center text-gray-300">Cargando perfil...</div>;
  }
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="bg-black min-h-screen flex items-center justify-center text-red-500 font-bold">No has iniciado sesión</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-black text-white min-h-screen">
        {/* Notificación */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            notification.type === 'success' 
              ? 'bg-green-900 border border-green-500 text-green-100' 
              : 'bg-red-900 border border-red-500 text-red-100'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{notification.message}</span>
            </div>
          </div>
        )}
        
        <div className="max-w-md mx-auto py-12 px-4">
          <h1 className="text-2xl font-bold mb-6 text-center">Perfil de usuario</h1>
          <div className="bg-gray-800 rounded shadow p-6 mb-6">
            <div className="mb-2"><span className="font-bold">Nombre:</span> {user.name}</div>
            <div className="mb-2"><span className="font-bold">Email:</span> {user.email}</div>
            {user.rol === 'admin' && (
              <div className="mb-2"><span className="font-bold">Rol:</span> {user.rol}</div>
            )}
          </div>
          <div className="bg-gray-800 rounded shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Mis pedidos</h2>
            {ordersLoading ? (
              <div className="text-gray-300">Cargando pedidos...</div>
            ) : orders.length === 0 ? (
              <div className="text-gray-300">No hay pedidos.</div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">Pedido #{order.id}</h3>
                        <p className="text-gray-300 text-sm">{new Date(order.creadoEn).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        <p className="text-gray-300 text-sm">Total: ${calculateTotal(order).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.comprobante?.status || 'pendiente_subida')}
                        <span className="text-sm">{getStatusText(order.comprobante?.status || 'pendiente_subida')}</span>
                      </div>
                    </div>
                    
                    {/* Lista de productos */}
                    <div className="mb-3">
                      <h4 className="font-medium mb-2">Productos:</h4>
                      <div className="space-y-1">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="text-sm text-gray-300">
                            {item.cantidad}x {item.producto?.nombre} - ${(item.precio * item.cantidad).toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sección de comprobante */}
                    <div className="border-t border-gray-600 pt-3">
                      <h4 className="font-medium mb-2">Comprobante de pago:</h4>
                      
                      {!order.comprobante || order.comprobante.status === 'pendiente_subida' ? (
                        <div>
                          <p className="text-sm text-gray-300 mb-2">
                            Subi tu comprobante de pago para confirmar tu pedido
                          </p>
                          <div className="flex items-center space-x-2">
                            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer text-sm">
                              {uploadingComprobante === order.id ? 'Subiendo...' : 'Seleccionar archivo'}
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, order.id)}
                                disabled={uploadingComprobante === order.id}
                              />
                            </label>
                            <span className="text-xs text-gray-400">JPG, PNG, JPEG (max 10MB)</span>
                          </div>
                          {order.comprobante?.expiraEn && (
                            <p className="text-xs text-yellow-400 mt-1">
                              Tenes tiempo hasta: {new Date(order.comprobante.expiraEn).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(order.comprobante.status)}
                            <span className="text-sm">{getStatusText(order.comprobante.status)}</span>
                          </div>
                          {order.comprobante.archivoUrl && (
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <button 
                                onClick={() => openImageModal(order.comprobante.archivoUrl)}
                                className="text-blue-400 hover:text-blue-300 text-sm underline cursor-pointer"
                              >
                                Ver comprobante
                              </button>
                            </div>
                          )}
                          {order.comprobante.status === 'pendiente_revision' && (
                            <p className="text-xs text-blue-400 mt-1">
                              Tu comprobante está siendo revisado por nuestro equipo
                            </p>
                          )}
                          {order.comprobante.status === 'pago_recibido' && (
                            <p className="text-xs text-green-400 mt-1">
                              ¡Pago confirmado! Tu pedido será procesado
                            </p>
                          )}
                          {order.comprobante.status === 'cancelado' && (
                            <p className="text-xs text-red-400 mt-1">
                              El comprobante fue rechazado o el tiempo expiró
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors">Cerrar sesión</button>
        </div>
      </div>

      {/* Modal para mostrar imagen del comprobante */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={closeImageModal}>
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
            >
              ×
            </button>
            <img 
              src={modalImageUrl} 
              alt="Comprobante de pago"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
