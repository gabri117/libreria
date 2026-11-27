import { useEffect, useMemo, useState } from 'react';
import { Truck, Plus, Trash2, Loader2, Eye, X, PackagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerCompras, registrarCompra } from '../services/compraService';
import { obtenerProveedores } from '../services/proveedorService';
import { obtenerProductos } from '../services/productoService';
import type { CompraDTO, DetalleCompraDTO, Producto, Proveedor } from '../types';
import { toLocalDateKey } from '../utils/dateUtils';

export const PurchasesPage = () => {
    const [compras, setCompras] = useState<CompraDTO[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompra, setSelectedCompra] = useState<CompraDTO | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [proveedorId, setProveedorId] = useState<number>(0);
    const [fechaCompra, setFechaCompra] = useState<string>(toLocalDateKey(new Date()));
    const [numeroFactura, setNumeroFactura] = useState<string>('');
    const [detalles, setDetalles] = useState<DetalleCompraDTO[]>([]);

    // Line item builder
    const [selectedProductoId, setSelectedProductoId] = useState<number>(0);
    const [cantidadItem, setCantidadItem] = useState<number>(1);
    const [costoItem, setCostoItem] = useState<number>(0);

    const cargarTodo = async () => {
        setIsLoading(true);
        try {
            const [comprasData, proveedoresData, productosData] = await Promise.all([
                obtenerCompras(),
                obtenerProveedores(),
                obtenerProductos()
            ]);
            setCompras(comprasData);
            setProveedores(proveedoresData);
            setProductos(productosData);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar módulo de compras');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarTodo();
    }, []);

    const handleSelectProducto = (prodId: number) => {
        setSelectedProductoId(prodId);
        const prod = productos.find(p => p.productoId === prodId);
        if (prod) {
            setCostoItem(Number(prod.precioCosto || 0));
        }
    };

    const handleAgregarLinea = () => {
        const prod = productos.find(p => p.productoId === selectedProductoId);
        if (!prod) {
            toast.error('Selecciona un producto');
            return;
        }
        if (cantidadItem <= 0) {
            toast.error('La cantidad debe ser mayor a 0');
            return;
        }
        if (costoItem < 0) {
            toast.error('El precio de costo no puede ser negativo');
            return;
        }

        setDetalles(prev => {
            const existing = prev.find(d => d.productoId === prod.productoId);
            if (existing) {
                return prev.map(d =>
                    d.productoId === prod.productoId
                        ? {
                            ...d,
                            cantidad: d.cantidad + cantidadItem,
                            precioCostoCompra: costoItem,
                            subtotal: (d.cantidad + cantidadItem) * costoItem
                        }
                        : d
                );
            }
            return [
                ...prev,
                {
                    productoId: prod.productoId,
                    productoNombre: prod.nombre,
                    productoSku: prod.sku,
                    cantidad: cantidadItem,
                    precioCostoCompra: costoItem,
                    subtotal: cantidadItem * costoItem
                }
            ];
        });

        setSelectedProductoId(0);
        setCantidadItem(1);
        setCostoItem(0);
    };

    const handleEliminarLinea = (productoId: number) => {
        setDetalles(prev => prev.filter(d => d.productoId !== productoId));
    };

    const totalCompraForm = useMemo(
        () => detalles.reduce((acc, d) => acc + d.cantidad * d.precioCostoCompra, 0),
        [detalles]
    );

    const handleGuardarCompra = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proveedorId) {
            toast.error('Selecciona un proveedor');
            return;
        }
        if (detalles.length === 0) {
            toast.error('Agrega al menos un producto a la compra');
            return;
        }

        setIsSubmitting(true);
        try {
            await registrarCompra({
                proveedorId,
                fechaCompra,
                numeroFacturaProveedor: numeroFactura.trim() || undefined,
                detalles: detalles.map(d => ({
                    productoId: d.productoId,
                    cantidad: d.cantidad,
                    precioCostoCompra: d.precioCostoCompra
                }))
            });
            toast.success('Compra registrada y stock actualizado');
            setIsModalOpen(false);
            setProveedorId(0);
            setNumeroFactura('');
            setDetalles([]);
            setFechaCompra(toLocalDateKey(new Date()));
            await cargarTodo();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error al registrar compra');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="h-1 w-8 bg-brand-primary-500 rounded-full"></span>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <Truck className="text-brand-primary-400" size={30} />
                            Compras a Proveedores
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm font-medium ml-11">
                        Registro de entradas de mercadería, costos de compra y actualización automática de stock
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-primary-500 hover:bg-brand-primary-400 text-white px-6 py-3.5 rounded-2xl font-black shadow-xl shadow-brand-primary-600/20 flex items-center gap-2 transition-all uppercase tracking-widest text-xs"
                >
                    <Plus size={18} strokeWidth={3} />
                    Nueva Compra
                </button>
            </header>

            <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-brand-primary-400">
                        <Loader2 className="animate-spin mb-3" size={36} />
                        <p className="text-xs font-black uppercase tracking-widest">Cargando compras...</p>
                    </div>
                ) : compras.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <Truck size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-bold">Aún no hay compras registradas</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="py-4 px-5">#</th>
                                    <th className="py-4 px-5">Fecha</th>
                                    <th className="py-4 px-5">Proveedor</th>
                                    <th className="py-4 px-5">Factura</th>
                                    <th className="py-4 px-5">Registrado por</th>
                                    <th className="py-4 px-5 text-right">Total</th>
                                    <th className="py-4 px-5 text-center">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {compras.map(compra => (
                                    <tr key={compra.compraId} className="hover:bg-white/[0.03] transition-colors">
                                        <td className="py-4 px-5 font-black text-gray-300">#{compra.compraId}</td>
                                        <td className="py-4 px-5 text-gray-300">{compra.fechaCompra}</td>
                                        <td className="py-4 px-5 font-bold text-white">{compra.proveedorNombre}</td>
                                        <td className="py-4 px-5 text-gray-400">{compra.numeroFacturaProveedor || 'S/N'}</td>
                                        <td className="py-4 px-5 text-gray-400">{compra.usuarioNombre}</td>
                                        <td className="py-4 px-5 text-right font-black text-emerald-400">
                                            Q{Number(compra.totalCompra || 0).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-5 text-center">
                                            <button
                                                onClick={() => setSelectedCompra(compra)}
                                                className="p-2 rounded-xl bg-white/5 hover:bg-brand-primary-500 text-gray-300 hover:text-white transition-all"
                                                title="Ver detalle"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Nueva Compra */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <PackagePlus className="text-brand-primary-400" size={24} />
                                <h2 className="text-xl font-black text-white uppercase">Registrar Compra</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleGuardarCompra} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Proveedor *
                                    </label>
                                    <select
                                        required
                                        value={proveedorId}
                                        onChange={e => setProveedorId(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold"
                                    >
                                        <option value={0} className="bg-slate-900">Seleccionar...</option>
                                        {proveedores.map(p => (
                                            <option key={p.proveedorId} value={p.proveedorId} className="bg-slate-900">
                                                {p.nombreEmpresa}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Fecha Compra
                                    </label>
                                    <input
                                        type="date"
                                        value={fechaCompra}
                                        onChange={e => setFechaCompra(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        No. Factura Proveedor
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej. FAC-1042"
                                        value={numeroFactura}
                                        onChange={e => setNumeroFactura(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold"
                                    />
                                </div>
                            </div>

                            {/* Agregar productos */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                                <p className="text-[10px] font-black text-brand-primary-400 uppercase tracking-widest">
                                    Agregar productos a la entrada
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                    <div className="md:col-span-6">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Producto</label>
                                        <select
                                            value={selectedProductoId}
                                            onChange={e => handleSelectProducto(Number(e.target.value))}
                                            className="w-full px-3 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white text-sm"
                                        >
                                            <option value={0} className="bg-slate-900">Seleccionar producto...</option>
                                            {productos.map(p => (
                                                <option key={p.productoId} value={p.productoId} className="bg-slate-900">
                                                    {p.nombre} ({p.sku}) — Stock: {p.cantidadStock}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cant.</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={cantidadItem}
                                            onChange={e => setCantidadItem(Number(e.target.value))}
                                            className="w-full px-3 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white text-sm font-bold"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Costo (Q)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={costoItem}
                                            onChange={e => setCostoItem(Number(e.target.value))}
                                            className="w-full px-3 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white text-sm font-bold"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <button
                                            type="button"
                                            onClick={handleAgregarLinea}
                                            className="w-full py-2.5 bg-brand-primary-500 hover:bg-brand-primary-400 text-white rounded-xl font-black text-xs uppercase"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>

                                {detalles.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-white/10">
                                        {detalles.map(d => (
                                            <div key={d.productoId} className="flex items-center justify-between bg-slate-900/60 px-4 py-2.5 rounded-xl text-sm">
                                                <div>
                                                    <p className="font-bold text-white">{d.productoNombre}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {d.cantidad} × Q{Number(d.precioCostoCompra).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-black text-emerald-400">
                                                        Q{(d.cantidad * d.precioCostoCompra).toFixed(2)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEliminarLinea(d.productoId)}
                                                        className="text-gray-500 hover:text-red-400"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Compra</p>
                                    <p className="text-2xl font-black text-brand-primary-400">Q{totalCompraForm.toFixed(2)}</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || detalles.length === 0}
                                    className="px-8 py-4 bg-brand-primary-500 hover:bg-brand-primary-400 disabled:opacity-40 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                                >
                                    {isSubmitting ? 'Guardando...' : 'Confirmar Compra'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detalle de Compra */}
            {selectedCompra && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setSelectedCompra(null)} />
                    <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-white">Compra #{selectedCompra.compraId}</h3>
                                <p className="text-xs text-gray-400">
                                    {selectedCompra.proveedorNombre} • Factura: {selectedCompra.numeroFacturaProveedor || 'S/N'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedCompra(null)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {selectedCompra.detalles.map((d, idx) => (
                                <div key={d.detalleCompraId ?? idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-sm">
                                    <div>
                                        <p className="font-bold text-white">{d.productoNombre}</p>
                                        <p className="text-xs text-gray-400">
                                            {d.cantidad} u. × Q{Number(d.precioCostoCompra).toFixed(2)}
                                        </p>
                                    </div>
                                    <span className="font-black text-emerald-400">
                                        Q{Number(d.subtotal ?? d.cantidad * d.precioCostoCompra).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-white/10">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total</span>
                            <span className="text-xl font-black text-brand-primary-400">
                                Q{Number(selectedCompra.totalCompra || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
