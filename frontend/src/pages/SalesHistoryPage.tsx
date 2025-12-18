import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Eye, XCircle, Loader2, ChevronDown } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { filtrarVentas, obtenerVentas } from '../services/ventaService';
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
        <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
            <Toaster />

            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Historial de Ventas</h1>
                <p className="text-gray-500">Consulta y gestiona todas las ventas realizadas</p>
            </header>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por # de factura o cliente..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        <Filter size={18} />
                        Filtros
                        <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={filtros.fechaInicio}
                                    onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={filtros.fechaFin}
                                    onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={filtros.metodoPago || ''}
                                    onChange={(e) => setFiltros({ ...filtros, metodoPago: e.target.value as MetodoPago || undefined })}
                                >
                                    <option value="">Todos</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Mixto">Mixto</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={filtros.estado || ''}
                                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value as EstadoVenta || undefined })}
                                >
                                    <option value="">Todos</option>
                                    <option value="Completada">Completada</option>
                                    <option value="Anulada">Anulada</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={aplicarFiltros}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Aplicar Filtros
                            </button>
                            <button
                                onClick={limpiarFiltros}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="animate-spin mb-4 text-indigo-500" size={48} />
                        <p className="font-medium">Cargando ventas...</p>
                    </div>
                ) : ventasFiltradas.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-lg">No se encontraron ventas</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Factura #</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendedor</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Método</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {ventasFiltradas.map((venta) => (
                                    <tr key={venta.ventaId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">#{venta.ventaId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleString('es-ES', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{venta.clienteNombre || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{venta.usuarioNombre || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">Q{venta.montoTotal?.toFixed(2) || '0.00'}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                {venta.metodoPago}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${venta.estado === 'Completada'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {venta.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedSale(venta)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {isAdmin && venta.estado === 'Completada' && (
                                                    <button
                                                        onClick={() => setSaleToVoid(venta)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Anular venta"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
