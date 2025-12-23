import { useState } from 'react';
import { Trash2, ShoppingBag, Minus, Plus, CreditCard, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ClientSelector } from './ClientSelector';
import { crearVenta, descargarFactura } from '../services/ventaService';
import { toast } from 'react-hot-toast';
import { useSession } from '../context/SessionContext';
import type { VentaDTO, DetalleVentaDTO } from '../types';
import { FileText } from 'lucide-react';

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

            const nuevaVenta = await crearVenta(ventaPayload);
            limpiarCarrito();

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full glass-panel border border-brand-primary-500/30 shadow-2xl rounded-2xl pointer-events-auto flex overflow-hidden`}>
                    <div className="flex-1 w-0 p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="h-12 w-12 rounded-2xl bg-brand-primary-500/20 flex items-center justify-center border border-brand-primary-500/30">
                                    <ShoppingBag className="h-6 w-6 text-brand-primary-400" />
                                </div>
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-black text-white uppercase tracking-wider">
                                    ¡Venta Exitosa!
                                </p>
                                <p className="mt-1 text-xs font-bold text-gray-400">
                                    Factura #{nuevaVenta.ventaId} generada
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md uppercase tracking-tighter border border-emerald-400/20">
                                        Completada
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col border-l border-white/5 bg-white/5">
                        <button
                            onClick={async () => {
                                if (nuevaVenta.ventaId) {
                                    toast.dismiss(t.id);
                                    try {
                                        await descargarFactura(nuevaVenta.ventaId);
                                        toast.success('Factura descargada', { style: { background: '#1e293b', color: '#fff' } });
                                    } catch (e) {
                                        toast.error('Error al descargar factura');
                                    }
                                }
                            }}
                            className="flex-1 px-6 py-4 flex items-center justify-center text-xs font-black text-brand-primary-400 hover:bg-brand-primary-500 hover:text-white transition-all uppercase tracking-widest gap-2"
                        >
                            <FileText size={18} />
                            Factura
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="flex-1 px-6 py-4 flex items-center justify-center text-[10px] font-bold text-gray-500 hover:bg-white/10 transition-all uppercase tracking-[0.2em] border-t border-white/5"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            ), { duration: 6000 });

        } catch (error) {
            console.error(error);
            toast.error('Error al procesar la venta');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="h-full flex flex-col p-8 glass-panel rounded-3xl overflow-hidden border border-white/5 relative">
                {/* Decorative background effects for empty state */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-primary-500/5 blur-[100px] rounded-full -z-10 animate-pulse"></div>

                <div className="mb-10 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="h-1 w-8 bg-brand-primary-500 rounded-full"></span>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Mi Carrito</h2>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] ml-11">Preparado para vender</p>
                </div>

                <div className="mb-10 relative z-10">
                    <ClientSelector />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                    <div className="relative mb-8 group">
                        {/* Multiple glow layers */}
                        <div className="absolute inset-0 bg-brand-primary-500/20 blur-3xl rounded-full scale-150 group-hover:bg-brand-primary-500/30 transition-all duration-700"></div>
                        <div className="relative glass-panel p-10 rounded-full border-brand-primary-500/10 shadow-2xl shadow-brand-primary-500/5 group-hover:scale-110 transition-transform duration-500">
                            <ShoppingBag size={80} strokeWidth={1} className="text-brand-primary-400 opacity-60 animate-bounce-slow" />
                        </div>
                    </div>

                    <div className="text-center space-y-3">
                        <h3 className="text-xl font-black text-white/90 tracking-tight">Tu carrito está vacío</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto opacity-60">
                            Selecciona productos del inventario para comenzar la venta
                        </p>
                    </div>
                </div>

                {/* Bottom decorative hint */}
                <div className="mt-auto pt-8 border-t border-white/5 text-center relative z-10">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">Librería María y José — POS</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
            {/* Header */}
            <div className="p-8 border-b border-white/5 z-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="h-1 w-6 bg-brand-primary-500 rounded-full"></span>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">Carrito</h2>
                        </div>
                        <p className="text-[10px] font-bold text-brand-primary-400 uppercase tracking-widest leading-none">
                            {items.length} productos listos
                        </p>
                    </div>
                    <button
                        onClick={limpiarCarrito}
                        className="text-[10px] font-black text-red-400/70 hover:text-red-400 uppercase tracking-widest transition-colors p-2 glass-card rounded-lg"
                    >
                        Vaciar
                    </button>
                </div>

                <ClientSelector />
            </div>

            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {items.map((item) => (
                    <div
                        key={item.productoId}
                        className="glass-card p-5 rounded-2xl transition-all hover:border-brand-primary-500/20 group relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <h4 className="font-black text-gray-100 text-sm line-clamp-2 w-10/12 leading-snug">
                                {item.nombre}
                            </h4>
                            <button
                                onClick={() => eliminarProducto(item.productoId)}
                                className="text-gray-600 hover:text-red-400 transition-colors p-1.5 glass-card rounded-lg"
                            >
                                <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="flex justify-between items-end relative z-10">
                            <div className="flex items-center gap-4 glass-panel px-2 py-1.5 rounded-xl border-white/5 shadow-inner">
                                <button
                                    onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-brand-primary-500 transition-all duration-300 active:scale-90"
                                >
                                    <Minus size={14} strokeWidth={3} />
                                </button>
                                <span className="text-sm font-black w-4 text-center text-white">{item.cantidad}</span>
                                <button
                                    onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-brand-primary-500 transition-all duration-300 active:scale-90"
                                >
                                    <Plus size={14} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="text-right">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-1">
                                    Q{item.precioAplicado.toFixed(2)} c/u
                                </div>
                                <div className="font-black text-lg text-white tracking-tight">
                                    Q{item.subtotal.toFixed(2)}
                                </div>
                            </div>
                        </div>
                        {/* Background subtle glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary-500/5 blur-2xl rounded-full z-0 pointer-events-none"></div>
                    </div>
                ))}
            </div>

            {/* Footer / Totals */}
            <div className="p-8 glass-panel border-t border-white/10 mt-auto bg-slate-900/40 relative">
                <div className="space-y-3 mb-8 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-white">Q{totalVenta.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Promoción</span>
                        <span className="text-emerald-400">- Q0.00</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black text-white pt-6 border-t border-white/5 mt-4 tracking-tighter normal-case">
                        <span>Total</span>
                        <span className="text-brand-primary-400">Q{totalVenta.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handleProcesarVenta}
                    disabled={loading || items.length === 0}
                    className="
                        w-full py-5 bg-gradient-to-r from-brand-primary-600 to-brand-primary-500 text-white rounded-2xl font-black 
                        shadow-2xl shadow-brand-primary-600/20 uppercase tracking-[0.15em] text-xs
                        hover:from-brand-primary-500 hover:to-brand-primary-400
                        active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3
                        disabled:from-white/5 disabled:to-white/5 disabled:text-gray-600 disabled:shadow-none disabled:cursor-not-allowed
                     border border-brand-primary-400/20"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} strokeWidth={3} /> : <CreditCard size={20} strokeWidth={2.5} />}
                    {loading ? 'Procesando Venta...' : 'Ejecutar Venta'}
                </button>
            </div>
            {/* Corner Decorative Element */}
            <div className="absolute bottom-4 right-4 w-32 h-32 bg-brand-primary-500/10 blur-[60px] rounded-full -z-10"></div>
        </div>
    );
};
