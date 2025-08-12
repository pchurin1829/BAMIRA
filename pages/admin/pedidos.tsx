import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Upload, Clock, CheckCircle, XCircle, FileText, Eye } from 'lucide-react';

export default function PedidosAdmin() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean|null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{show: boolean, orderId: number | null}>({show: false, orderId: null});

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

  useEffect(() => {
    if (isAdmin) {
      cargarPedidos();
    }
  }, [isAdmin]);

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pedidos');
      if (response.ok) {
        const data = await response.json();
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarStatusComprobante = async (comprobanteId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comprobanteId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        showNotification('Estado actualizado exitosamente', 'success');
        cargarPedidos(); // Recargar pedidos
      } else {
        const error = await response.json();
        showNotification(error.message || 'Error al actualizar status', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al actualizar status', 'error');
    }
  };

  const marcarPedidoRetirado = async (orderId: number) => {
    setConfirmDialog({show: true, orderId});
  };

  const confirmarRetiro = async () => {
    if (!confirmDialog.orderId) return;
    
    setConfirmDialog({show: false, orderId: null});

    try {
      const response = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: confirmDialog.orderId,
          accion: 'marcar_retirado',
        }),
      });

      if (response.ok) {
        showNotification('Pedido marcado como retirado y stock actualizado exitosamente', 'success');
        cargarPedidos(); // Recargar pedidos
      } else {
        const error = await response.json();
        showNotification(error.message || 'Error al marcar pedido como retirado', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al marcar pedido como retirado', 'error');
    }
  };

  const cancelarRetiro = () => {
    setConfirmDialog({show: false, orderId: null});
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

  const ordenesFiltradas = orders.filter(order => {
    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'retirado') return order.estado === 'retirado';
    return order.comprobante?.status === filtroStatus || (!order.comprobante && filtroStatus === 'pendiente_subida');
  });

  if (isAdmin === null) {
    return <div className="bg-black min-h-screen flex items-center justify-center text-gray-300">Verificando permisos...</div>;
  }

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="bg-black min-h-screen flex items-center justify-center text-red-500 font-bold">
          Acceso denegado. Solo administradores pueden ver esta página.
        </div>
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
              ? 'bg-green-600 border border-green-500' 
              : 'bg-red-600 border border-red-500'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-white">
                {notification.type === 'success' ? '✅' : '❌'}
              </span>
              <p className="text-white text-sm font-medium">
                {notification.message}
              </p>
              <button 
                onClick={() => setNotification(null)}
                className="text-white hover:text-gray-200 ml-auto"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Modal de confirmación */}
        {confirmDialog.show && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                  <span className="text-yellow-600 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Confirmar retiro del pedido
                </h3>
                <p className="text-gray-300 text-sm">
                  ¿Estás seguro de que el cliente ya retiró el pedido #{confirmDialog.orderId}?
                </p>
                <div className="bg-yellow-900/30 border border-yellow-500/50 text-yellow-200 p-3 rounded mt-4 text-xs">
                  <p className="font-medium">⚠️ Acción irreversible</p>
                  <p>Esta acción descontará automáticamente el stock y no se puede deshacer.</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={cancelarRetiro}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarRetiro}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Confirmar retiro
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
            <a 
              href="/admin" 
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-bold transition-colors"
            >
              Volver al Panel
            </a>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Filtrar por estado del comprobante:</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'todos', label: 'Todos', color: 'bg-gray-600' },
                { value: 'pendiente_subida', label: 'Pendiente subida', color: 'bg-yellow-600' },
                { value: 'pendiente_revision', label: 'En revisión', color: 'bg-blue-600' },
                { value: 'pago_recibido', label: 'Pago confirmado', color: 'bg-green-600' },
                { value: 'cancelado', label: 'Cancelado', color: 'bg-red-600' },
                { value: 'retirado', label: 'Retirado', color: 'bg-purple-600' },
              ].map((filtro) => (
                <button
                  key={filtro.value}
                  onClick={() => setFiltroStatus(filtro.value)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    filtroStatus === filtro.value
                      ? `${filtro.color} text-white`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-300">Cargando pedidos...</div>
          ) : ordenesFiltradas.length === 0 ? (
            <div className="text-center text-gray-300">No hay pedidos que mostrar</div>
          ) : (
            <div className="space-y-6">
              {ordenesFiltradas.map((order) => (
                <div key={order.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información del pedido */}
                    <div className="lg:col-span-2">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">Pedido #{order.id}</h3>
                          <p className="text-gray-300">{new Date(order.creadoEn).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                          <p className="text-gray-300">Total: ${calculateTotal(order).toFixed(2)}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm">Estado del pedido:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              order.estado === 'retirado' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-600 text-gray-200'
                            }`}>
                              {order.estado === 'retirado' ? 'Retirado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold mb-2">Datos del cliente:</h4>
                          <p className="text-sm text-gray-300">Nombre: {order.nombre} {order.apellido || ''}</p>
                          <p className="text-sm text-gray-300">Email: {order.email}</p>
                          <p className="text-sm text-gray-300">Teléfono: {order.telefono}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Detalles del pedido:</h4>
                          <p className="text-sm text-gray-300">Método de pago: {order.metodoPago}</p>
                          <p className="text-sm text-gray-300">Local de retiro: {order.localRetiro}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Productos:</h4>
                        <div className="space-y-2">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="bg-gray-700 rounded p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{item.producto?.nombre}</p>
                                  <p className="text-sm text-gray-300">Marca: {item.producto?.marca}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{item.cantidad}x ${item.precio.toFixed(2)}</p>
                                  <p className="text-sm text-gray-300">${(item.precio * item.cantidad).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Gestión de comprobante */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Comprobante de pago</h4>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        {getStatusIcon(order.comprobante?.status || 'pendiente_subida')}
                        <span className="text-sm">
                          {getStatusText(order.comprobante?.status || 'pendiente_subida')}
                        </span>
                      </div>

                      {order.comprobante?.archivoUrl && (
                        <div className="mb-4">
                          <a 
                            href={order.comprobante.archivoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm underline"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver comprobante</span>
                          </a>
                        </div>
                      )}

                      {order.comprobante?.expiraEn && (
                        <p className="text-xs text-yellow-400 mb-3">
                          Expira: {new Date(order.comprobante.expiraEn).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}

                      {order.comprobante && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Actualizar estado:</h5>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              onClick={() => actualizarStatusComprobante(order.comprobante.id, 'pendiente_revision')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                              disabled={order.comprobante.status === 'pendiente_revision'}
                            >
                              Marcar en revisión
                            </button>
                            <button
                              onClick={() => actualizarStatusComprobante(order.comprobante.id, 'pago_recibido')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                              disabled={order.comprobante.status === 'pago_recibido'}
                            >
                              Confirmar pago
                            </button>
                            <button
                              onClick={() => actualizarStatusComprobante(order.comprobante.id, 'cancelado')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                              disabled={order.comprobante.status === 'cancelado'}
                            >
                              Cancelar
                            </button>
                          </div>
                          
                          {/* Botón para marcar como retirado */}
                          {order.comprobante.status === 'pago_recibido' && order.estado !== 'retirado' && (
                            <div className="mt-4 pt-3 border-t border-gray-600">
                              <h5 className="text-sm font-medium mb-2">Gestión de entrega:</h5>
                              <button
                                onClick={() => marcarPedidoRetirado(order.id)}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                              >
                                📦 Pedido retirado
                              </button>
                              <p className="text-xs text-gray-400 mt-1">
                                Este botón descuenta el stock automáticamente
                              </p>
                            </div>
                          )}
                          
                          {order.estado === 'retirado' && (
                            <div className="mt-4 pt-3 border-t border-gray-600">
                              <div className="bg-purple-900/30 border border-purple-500/50 text-purple-200 p-3 rounded text-center">
                                <span className="text-purple-300">✅</span>
                                <p className="text-sm font-medium">Pedido retirado</p>
                                <p className="text-xs">Stock ya descontado</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {!order.comprobante && (
                        <div className="text-center text-gray-400 text-sm">
                          <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                          <p>Sin comprobante subido</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
