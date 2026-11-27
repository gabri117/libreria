import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, Plus, Loader2, X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerAjustesInventario, registrarAjusteInventario } from '../services/ajusteInventarioService';
import { obtenerProductos } from '../services/productoService';
import type { AjusteInventarioDTO, Producto } from '../types';

const MOTIVOS_RAPIDOS = [
    'Producto dañado',
    'Conteo físico',
    'Merma / pérdida',
    'Uso interno de librería',
    'Devolución a proveedor'
];

export const InventoryAdjustmentsPage = () => {
    const [ajustes, setAjustes] = useState<AjusteInventarioDTO[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [productoId, setProductoId] = useState<number>(0);
    const [tipo, setTipo] = useState<'salida' | 'entrada'>('salida');
    const [cantidadAbs, setCantidadAbs] = useState<number>(1);
    const [motivo, setMotivo] = useState<string>('');

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const [ajustesData, productosData] = await Promise.all([
                obtenerAjustesInventario(),
                obtenerProductos()
            ]);
            setAjustes(ajustesData);
            setProductos(productosData);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar ajustes de inventario');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const productoSeleccionado = useMemo(
        () => productos.find(p => p.productoId === productoId) || null,
        [productos, productoId]
    );

    const cantidadConSigno = tipo === 'salida' ? -Math.abs(cantidadAbs) : Math.abs(cantidadAbs);
    const stockResultante = productoSeleccionado
        ? productoSeleccionado.cantidadStock + cantidadConSigno
        : null;
    const stockInvalido = stockResultante !== null && stockResultante < 0;

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productoSeleccionado) {
            toast.error('Selecciona un producto');
            return;
        }
        if (cantidadAbs <= 0) {
            toast.error('La cantidad debe ser mayor a 0');
            return;
        }
        if (stockInvalido) {
            toast.error('El ajuste dejaría el stock en negativo');
            return;
        }
        if (!motivo.trim()) {
            toast.error('Ingresa el motivo del ajuste');
            return;
        }

        setIsSubmitting(true);
        try {
            await registrarAjusteInventario({
                productoId: productoSeleccionado.productoId,
                cantidad: cantidadConSigno,
                motivo: motivo.trim()
            });
            toast.success('Ajuste registrado y stock actualizado');
            setIsModalOpen(false);
            setProductoId(0);
            setCantidadAbs(1);
            setMotivo('');
            setTipo('salida');
            await cargarDatos();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error al registrar ajuste');
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
                            <SlidersHorizontal className="text-brand-primary-400" size={30} />
                            Ajustes de Inventario
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm font-medium ml-11">
                        Control trazable de mermas, daños y correcciones por conteo físico
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-primary-500 hover:bg-brand-primary-400 text-white px-6 py-3.5 rounded-2xl font-black shadow-xl shadow-brand-primary-600/20 flex items-center gap-2 transition-all uppercase tracking-widest text-xs"
                >
                    <Plus size={18} strokeWidth={3} />
                    Nuevo Ajuste
                </button>
            </header>

            <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-brand-primary-400">
                        <Loader2 className="animate-spin mb-3" size={36} />
                        <p className="text-xs font-black uppercase tracking-widest">Cargando ajustes...</p>
                    </div>
                ) : ajustes.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <SlidersHorizontal size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-bold">No hay ajustes de inventario registrados</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="py-4 px-5">#</th>
                                    <th className="py-4 px-5">Fecha</th>
                                    <th className="py-4 px-5">Producto</th>
                                    <th className="py-4 px-5 text-center">Movimiento</th>
                                    <th className="py-4 px-5">Motivo</th>
                                    <th className="py-4 px-5">Responsable</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {ajustes.map(ajuste => {
                                    const esEntrada = ajuste.cantidad > 0;
                                    return (
                                        <tr key={ajuste.ajusteId} className="hover:bg-white/[0.03] transition-colors">
                                            <td className="py-4 px-5 font-black text-gray-300">#{ajuste.ajusteId}</td>
                                            <td className="py-4 px-5 text-gray-400 text-xs">
                                                {ajuste.fechaAjuste ? new Date(ajuste.fechaAjuste).toLocaleString('es-GT') : '—'}
                                            </td>
                                            <td className="py-4 px-5">
                                                <p className="font-bold text-white">{ajuste.productoNombre}</p>
                                                <p className="text-xs text-gray-500">{ajuste.productoSku}</p>
                                            </td>
                                            <td className="py-4 px-5 text-center">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${esEntrada
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                                                    }`}>
                                                    {esEntrada ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                                                    {esEntrada ? `+${ajuste.cantidad}` : ajuste.cantidad}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-gray-200">{ajuste.motivo}</td>
                                            <td className="py-4 px-5 text-gray-400">{ajuste.usuarioNombre}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Nuevo Ajuste */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/10 shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-black text-white uppercase">Nuevo Ajuste de Stock</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleGuardar} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Producto *
                                </label>
                                <select
                                    required
                                    value={productoId}
                                    onChange={e => setProductoId(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold"
                                >
                                    <option value={0} className="bg-slate-900">Seleccionar producto...</option>
                                    {productos.map(p => (
                                        <option key={p.productoId} value={p.productoId} className="bg-slate-900">
                                            {p.nombre} ({p.sku}) — Stock actual: {p.cantidadStock}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTipo('salida')}
                                    className={`py-3 rounded-xl font-black text-xs uppercase border flex items-center justify-center gap-2 transition-all ${tipo === 'salida'
                                        ? 'bg-red-500/20 text-red-400 border-red-500/50'
                                        : 'bg-white/5 text-gray-400 border-white/10'
                                        }`}
                                >
                                    <ArrowDownCircle size={16} />
                                    Salida / Merma (-)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipo('entrada')}
                                    className={`py-3 rounded-xl font-black text-xs uppercase border flex items-center justify-center gap-2 transition-all ${tipo === 'entrada'
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                        : 'bg-white/5 text-gray-400 border-white/10'
                                        }`}
                                >
                                    <ArrowUpCircle size={16} />
                                    Entrada / Conteo (+)
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Cantidad *
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        required
                                        value={cantidadAbs}
                                        onChange={e => setCantidadAbs(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-black"
                                    />
                                </div>
                                {productoSeleccionado && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Stock Resultante</p>
                                        <p className={`text-xl font-black ${stockInvalido ? 'text-red-400' : 'text-white'}`}>
                                            {productoSeleccionado.cantidadStock} → {stockResultante}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Motivo *
                                </label>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {MOTIVOS_RAPIDOS.map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setMotivo(m)}
                                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-gray-300 border border-white/10"
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    required
                                    maxLength={200}
                                    placeholder="Describe el motivo del ajuste..."
                                    value={motivo}
                                    onChange={e => setMotivo(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || stockInvalido || !productoSeleccionado}
                                className="w-full py-4 bg-brand-primary-500 hover:bg-brand-primary-400 disabled:opacity-40 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                            >
                                {isSubmitting ? 'Guardando...' : 'Aplicar Ajuste'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
