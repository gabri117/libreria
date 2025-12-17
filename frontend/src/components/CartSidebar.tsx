import { useState } from 'react';
import { Trash2, ShoppingBag, Minus, Plus, CreditCard, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ClientSelector } from './ClientSelector';
import { crearVenta } from '../services/ventaService';
import { toast } from 'react-hot-toast';
import { useSession } from '../context/SessionContext';
import type { VentaDTO, DetalleVentaDTO } from '../types';

export const CartSidebar = () => {
    const { items, totalVenta, eliminarProducto, actualizarCantidad, limpiarCarrito, clienteSeleccionado } = useCart();
    const { sesionActiva } = useSession();
    const [loading, setLoading] = useState(false);

    const handleProcesarVenta = async () => {
        if (!clienteSeleccionado) {
            toast.error('Debes seleccionar un cliente');
            return;
        }

        if (!sesionActiva) {
            toast.error('No hay una sesión de caja activa');
            return;
        }

        setLoading(true);
        try {
            const detalles: DetalleVentaDTO[] = items.map(item => ({
                productoId: item.productoId,
                cantidad: item.cantidad,
                descuento: 0,
                precioUnitario: item.precioAplicado
            }));

            const ventaPayload: VentaDTO = {
                clienteId: clienteSeleccionado.clienteId,
                usuarioId: sesionActiva.usuarioAperturaId, // Use the user who opened the session
                sesionId: sesionActiva.sesionId,
                metodoPago: 'Efectivo',
                detalles
            };

            await crearVenta(ventaPayload);
            toast.success('¡Venta registrada con éxito!');
            limpiarCarrito();
        } catch (error) {
            console.error(error);
            toast.error('Error al procesar la venta');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="h-full flex flex-col p-6 bg-white border-l border-gray-100">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="text-blue-600" />
                        Carrito
                    </h2>
                </div>

                <ClientSelector />

                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-50">
                    <ShoppingBag size={64} strokeWidth={1} />
                    <p className="font-medium text-sm">Tu carrito está vacío</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-100 shadow-xl max-w-md w-full ml-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-white z-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="text-blue-600" />
                        Carrito ({items.length})
                    </h2>
                    <button
                        onClick={limpiarCarrito}
                        className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline transition-colors"
                    >
                        Limpiar todo
                    </button>
                </div>

                <ClientSelector />
            </div>

            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {items.map((item) => (
                    <div
                        key={item.productoId}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group transition-all hover:shadow-md"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 w-10/12">
                                {item.nombre}
                            </h4>
                            <button
                                onClick={() => eliminarProducto(item.productoId)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex justify-between items-end mt-2">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                <button
                                    onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:text-blue-600 active:scale-95 transition-all text-xs border border-gray-100"
                                >
                                    <Minus size={12} strokeWidth={3} />
                                </button>
                                <span className="text-sm font-bold w-4 text-center">{item.cantidad}</span>
                                <button
                                    onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm text-blue-600 hover:text-blue-700 active:scale-95 transition-all text-xs border border-gray-100"
                                >
                                    <Plus size={12} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="text-right">
                                <div className="text-[10px] text-gray-400 mb-0.5">
                                    {item.cantidad} x ${item.precioAplicado.toFixed(2)}
                                </div>
                                <div className="font-bold text-gray-800">
                                    ${item.subtotal.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Totals */}
            <div className="p-6 bg-white border-t border-gray-100">
                <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>${totalVenta.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Impuestos (Est.)</span>
                        <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-2 border-t border-dashed border-gray-200">
                        <span>Total</span>
                        <span>${totalVenta.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handleProcesarVenta}
                    disabled={loading || items.length === 0}
                    className="
                        w-full py-4 bg-gray-900 text-white rounded-xl font-bold 
                        shadow-lg shadow-gray-200 
                        hover:bg-blue-600 hover:shadow-blue-200 
                        active:scale-[0.98] transition-all flex items-center justify-center gap-2
                        disabled:bg-gray-300 disabled:cursor-not-allowed
                    "
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
                    {loading ? 'Procesando...' : 'Proceder al Pago'}
                </button>
            </div>
        </div>
    );
};
