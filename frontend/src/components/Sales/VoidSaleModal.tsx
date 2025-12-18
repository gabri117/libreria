import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { anularVenta } from '../../services/ventaService';
import type { VentaDTO } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface VoidSaleModalProps {
    venta: VentaDTO;
    onClose: () => void;
    onSuccess: () => void;
}

export const VoidSaleModal = ({ venta, onClose, onSuccess }: VoidSaleModalProps) => {
    const [motivo, setMotivo] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!motivo.trim()) {
            toast.error('Debes ingresar un motivo de anulación');
            return;
        }

        if (!user?.usuarioId) {
            toast.error('No se pudo identificar el usuario');
            return;
        }

        try {
            setLoading(true);
            await anularVenta(venta.ventaId!, {
                usuarioId: user.usuarioId,
                motivo: motivo.trim()
            });
            toast.success('Venta anulada exitosamente');
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error al anular la venta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Anular Venta</h2>
                            <p className="text-sm text-gray-500">Factura #{venta.ventaId}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-amber-800">
                                <strong>Advertencia:</strong> Esta acción anulará la venta y restaurará el stock de los productos vendidos. Esta acción no se puede deshacer.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Motivo de Anulación <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                                rows={4}
                                placeholder="Describe el motivo de la anulación..."
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Resumen de la Venta</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cliente:</span>
                                    <span className="font-medium text-gray-900">{venta.clienteNombre}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-bold text-gray-900">Q{venta.montoTotal?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Productos:</span>
                                    <span className="font-medium text-gray-900">{venta.detalles.length} items</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Anulando...' : 'Anular Venta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
