import { useState, useEffect, useMemo } from 'react';
import {
    Search, Filter, Eye, XCircle, Loader2, ChevronDown,
    Calendar, CreditCard, User, History, RefreshCcw,
    FileText, ShoppingBag, DollarSign, Tag, CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { filtrarVentas, obtenerVentas, descargarFactura } from '../services/ventaService';
import type { VentaDTO, FiltrosVenta, MetodoPago, EstadoVenta } from '../types';
import { SaleDetailModal } from '../components/Sales/SaleDetailModal';
import { VoidSaleModal } from '../components/Sales/VoidSaleModal';
import { useAuth } from '../context/AuthContext';

export const SalesHistoryPage = () => {
    const [ventas, setVentas] = useState<VentaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSale, setSelectedSale] = useState<VentaDTO | null>(null);
    const [saleToVoid, setSaleToVoid] = useState<VentaDTO | null>(null);
    const { user } = useAuth();

    const [filtros, setFiltros] = useState<FiltrosVenta>({
        fechaInicio: '',
        fechaFin: '',
        clienteId: undefined,
        metodoPago: undefined,
        estado: undefined,
    });

    useEffect(() => {
        cargarVentas();
    }, []);

    const cargarVentas = async () => {
        try {
            setLoading(true);
            const data = await obtenerVentas();
            setVentas(data);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando historial de ventas');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = async () => {
        try {
            setLoading(true);
            const filtrosLimpios: FiltrosVenta = {};

            if (filtros.fechaInicio) filtrosLimpios.fechaInicio = new Date(filtros.fechaInicio).toISOString();
            if (filtros.fechaFin) {
                const fechaFin = new Date(filtros.fechaFin);
                fechaFin.setHours(23, 59, 59, 999);
                filtrosLimpios.fechaFin = fechaFin.toISOString();
            }
            if (filtros.clienteId) filtrosLimpios.clienteId = filtros.clienteId;
            if (filtros.metodoPago) filtrosLimpios.metodoPago = filtros.metodoPago;
            if (filtros.estado) filtrosLimpios.estado = filtros.estado;

            const data = await filtrarVentas(filtrosLimpios);
            setVentas(data);
            toast.success('Filtros aplicados');
        } catch (error) {
            console.error(error);
            toast.error('Error aplicando filtros');
        } finally {
            setLoading(false);
        }
    };

    const limpiarFiltros = () => {
        setFiltros({
            fechaInicio: '',
            fechaFin: '',
            clienteId: undefined,
            metodoPago: undefined,
            estado: undefined,
        });
        cargarVentas();
    };

    const ventasFiltradas = useMemo(() => {
        if (!busqueda) return ventas;
        const lower = busqueda.toLowerCase();
        return ventas.filter(v =>
            v.ventaId?.toString().includes(lower) ||
            v.clienteNombre?.toLowerCase().includes(lower)
        );
    }, [ventas, busqueda]);

    const handleVoidSuccess = () => {
        cargarVentas();
        setSaleToVoid(null);
    };

    const isAdmin = user?.rol === 'Administrador';

    return (
        <div className="flex flex-col h-full animate-fade-in no-scrollbar pb-10">
            {/* Header Section */}
            <div className="glass-panel p-6 mb-6 shadow-xl rounded-3xl animate-slide-up relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="h-1 w-8 bg-brand-primary-500 rounded-full animate-pulse-subtle"></span>
                            <h1 className="text-2xl font-black text-white uppercase tracking-wider">Historial de Ventas</h1>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <History size={14} />
                            <span>Control detallado de transacciones y facturación</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar factura o cliente..."
                                className="w-full md:w-72 pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-brand-primary-500/50 focus:bg-white/10 transition-all"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${showFilters
                                ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                                }`}
                        >
                            <Filter size={18} />
                            <span>Filtros</span>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        <button
                            onClick={cargarVentas}
                            className="p-3 bg-white/5 text-gray-400 hover:bg-brand-primary-500/20 hover:text-brand-primary-400 border border-white/5 rounded-2xl transition-all active:scale-95"
                            title="Actualizar datos"
                        >
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Filters Expanded Panel */}
                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-white/5 animate-slide-up">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                    <Calendar size={12} className="text-brand-primary-400" />
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-primary-500/50 transition-all"
                                    value={filtros.fechaInicio}
                                    onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                    <Calendar size={12} className="text-brand-primary-400" />
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-primary-500/50 transition-all"
                                    value={filtros.fechaFin}
                                    onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                    <CreditCard size={12} className="text-brand-primary-400" />
                                    Método de Pago
                                </label>
                                <select
                                    className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-primary-500/50 transition-all appearance-none"
                                    value={filtros.metodoPago || ''}
                                    onChange={(e) => setFiltros({ ...filtros, metodoPago: e.target.value as MetodoPago || undefined })}
                                >
                                    <option value="">Todos los métodos</option>
                                    <option value="Efectivo">💵 Efectivo</option>
                                    <option value="Tarjeta">💳 Tarjeta</option>
                                    <option value="Mixto">🔄 Mixto</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                    <Tag size={12} className="text-brand-primary-400" />
                                    Estado de Venta
                                </label>
                                <select
                                    className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-primary-500/50 transition-all appearance-none"
                                    value={filtros.estado || ''}
                                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value as EstadoVenta || undefined })}
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="Completada">🟢 Completada</option>
                                    <option value="Anulada">🔴 Anulada</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={limpiarFiltros}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                            >
                                Limpiar Filtros
                            </button>
                            <button
                                onClick={aplicarFiltros}
                                className="px-8 py-3 bg-brand-primary-500 hover:bg-brand-primary-400 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-primary-500/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <CheckCircle2 size={16} />
                                Aplicar Resultados
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sales Table Section */}
            <div className="glass-panel flex-1 rounded-3xl shadow-2xl overflow-hidden animate-slide-up delay-100 flex flex-col border border-white/5">
                <div className="p-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="text-brand-primary-400" size={20} />
                        <h3 className="font-black text-white uppercase tracking-widest text-sm">Registros de Facturación</h3>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <span>{ventasFiltradas.length} Ventas Encontradas</span>
                    </div>
                </div>

                <div className="flex-1 overflow-auto no-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-32 text-brand-primary-400">
                            <Loader2 className="animate-spin mb-4" size={56} strokeWidth={2} />
                            <p className="font-black uppercase tracking-widest text-xs animate-pulse">Sincronizando Historial...</p>
                        </div>
                    ) : ventasFiltradas.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                                <ShoppingBag size={40} className="text-gray-700" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">Sin Resultados</h3>
                            <p className="text-gray-600 max-w-xs mx-auto text-sm">No se encontraron ventas con los criterios seleccionados.</p>
                            <button
                                onClick={limpiarFiltros}
                                className="mt-6 text-brand-primary-400 hover:text-brand-primary-300 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mx-auto"
                            >
                                Volver al listado completo <ArrowRight size={14} />
                            </button>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-[#0f172a] border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Factura #</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Fecha</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Cliente</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Monto</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Método</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Estado</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {ventasFiltradas.map((venta) => (
                                    <tr key={venta.ventaId} className="group hover:bg-white/5 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-brand-primary-500">
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black text-white bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                                                #{venta.ventaId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-bold text-gray-300">
                                                    {venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </span>
                                                <span className="text-[10px] text-gray-600 font-black uppercase">
                                                    {venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white flex items-center gap-1.5">
                                                    <User size={14} className="text-brand-primary-400" />
                                                    {venta.clienteNombre || 'Consumidor Final'}
                                                </span>
                                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tight flex items-center gap-1 mt-1">
                                                    <DollarSign size={10} /> Atendido por: {venta.usuarioNombre || 'Sistema'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-baseline gap-1 text-emerald-400">
                                                    <span className="text-[10px] font-black">Q</span>
                                                    <span className="text-lg">{venta.montoTotal?.toFixed(2) || '0.00'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex px-3 py-1.5 text-[10px] font-black rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-tighter">
                                                <CreditCard size={12} className="mr-1.5 mt-0.5" />
                                                {venta.metodoPago}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex px-3 py-1.5 text-[10px] font-black rounded-lg border uppercase tracking-wider ${venta.estado === 'Completada'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20 opacity-70'
                                                }`}>
                                                {venta.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={async () => {
                                                        if (venta.ventaId) {
                                                            try {
                                                                await descargarFactura(venta.ventaId);
                                                                toast.success('Factura descargada');
                                                            } catch (e) {
                                                                toast.error('Error al descargar factura');
                                                            }
                                                        }
                                                    }}
                                                    className="p-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all active:scale-95 border border-emerald-500/20"
                                                    title="Descargar Factura PDF"
                                                >
                                                    <FileText size={18} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedSale(venta)}
                                                    className="p-2.5 bg-brand-primary-500/10 text-brand-primary-400 hover:bg-brand-primary-500 hover:text-white rounded-xl transition-all active:scale-95 border border-brand-primary-500/20"
                                                    title="Ver detalles detallados"
                                                >
                                                    <Eye size={18} strokeWidth={2.5} />
                                                </button>
                                                {isAdmin && venta.estado === 'Completada' && (
                                                    <button
                                                        onClick={() => setSaleToVoid(venta)}
                                                        className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95 border border-red-500/20"
                                                        title="Anular venta del sistema"
                                                    >
                                                        <XCircle size={18} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Subtle Table Footer Glow */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            </div>

            {/* Modals */}
            {selectedSale && (
                <SaleDetailModal
                    venta={selectedSale}
                    onClose={() => setSelectedSale(null)}
                />
            )}

            {saleToVoid && (
                <VoidSaleModal
                    venta={saleToVoid}
                    onClose={() => setSaleToVoid(null)}
                    onSuccess={handleVoidSuccess}
                />
            )}
        </div>
    );
};
