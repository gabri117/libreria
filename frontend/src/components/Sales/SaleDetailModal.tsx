import { X } from 'lucide-react';
import type { VentaDTO } from '../../types';

interface SaleDetailModalProps {
    venta: VentaDTO;
    onClose: () => void;
}

export const SaleDetailModal = ({ venta, onClose }: SaleDetailModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Detalles de Venta</h2>
                        <p className="text-sm text-gray-500">Factura #{venta.ventaId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Sale Info */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Información General</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-sm text-gray-500">Fecha:</span>
                                    <p className="font-medium text-gray-900">
                                        {venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Cliente:</span>
                                    <p className="font-medium text-gray-900">{venta.clienteNombre || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Vendedor:</span>
                                    <p className="font-medium text-gray-900">{venta.usuarioNombre || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Detalles de Pago</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-sm text-gray-500">Método de Pago:</span>
                                    <p className="font-medium text-gray-900">{venta.metodoPago}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Estado:</span>
                                    <p className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${venta.estado === 'Completada'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {venta.estado}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Sesión de Caja:</span>
                                    <p className="font-medium text-gray-900">#{venta.sesionId}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Void Info if applicable */}
                    {venta.estado === 'Anulada' && venta.motivoAnulacion && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <h3 className="text-sm font-semibold text-red-800 uppercase mb-2">Información de Anulación</h3>
                            <div className="space-y-1">
                                <div>
                                    <span className="text-sm text-red-600">Motivo:</span>
                                    <p className="text-sm font-medium text-red-900">{venta.motivoAnulacion}</p>
                                </div>
                                {venta.fechaAnulacion && (
                                    <div>
                                        <span className="text-sm text-red-600">Fecha de Anulación:</span>
                                        <p className="text-sm font-medium text-red-900">
                                            {new Date(venta.fechaAnulacion).toLocaleString('es-ES')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Products Table */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Productos</h3>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Precio Unit.</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Descuento</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {venta.detalles.map((detalle, index) => (
                                        <tr key={detalle.detalleId || index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{detalle.productoNombre || `Producto #${detalle.productoId}`}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-right">{detalle.cantidad}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-right">Q{detalle.precioUnitario?.toFixed(2) || '0.00'}</td>
                                            <td className="px-4 py-3 text-sm text-red-600 text-right">
                                                {detalle.descuento && detalle.descuento > 0 ? `-Q${detalle.descuento.toFixed(2)}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Q{detalle.subtotal?.toFixed(2) || '0.00'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="mt-6 flex justify-end">
                        <div className="bg-indigo-50 rounded-xl p-4 min-w-[250px]">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-700">Total:</span>
                                <span className="text-2xl font-bold text-indigo-600">Q{venta.montoTotal?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
