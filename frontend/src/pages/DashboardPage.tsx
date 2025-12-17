import { useEffect, useState, useMemo } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { obtenerVentas } from '../services/ventaService';
import type { VentaDTO } from '../types';

export const DashboardPage = () => {
    const [ventas, setVentas] = useState<VentaDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const data = await obtenerVentas();
            setVentas(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const ventasHoy = ventas.filter(v => (v.fechaVenta || '').startsWith(today));

        const totalHoy = ventasHoy.reduce((acc, v) => acc + (v.montoTotal || 0), 0);
        const transacciones = ventasHoy.length;
        const promedio = transacciones > 0 ? totalHoy / transacciones : 0;

        // Mock data for chart - Last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const chartData = last7Days.map(date => {
            const salesInDate = ventas.filter(v => (v.fechaVenta || '').startsWith(date));
            return {
                date,
                total: salesInDate.reduce((acc, v) => acc + (v.montoTotal || 0), 0)
            };
        });

        return { totalHoy, transacciones, promedio, chartData };
    }, [ventas]);

    if (isLoading) return <div className="flex h-screen items-center justify-center text-gray-400">Cargando Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Resumen de actividad del negocio</p>
            </header>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Ventas Hoy</p>
                        <h3 className="text-2xl font-bold text-gray-900">Q{stats.totalHoy.toFixed(2)}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Ventas Realizadas</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.transacciones}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Promedio por Venta</p>
                        <h3 className="text-2xl font-bold text-gray-900">Q{stats.promedio.toFixed(2)}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        Ventas Últimos 7 Días
                    </h3>

                    <div className="h-64 flex items-end justify-between gap-2">
                        {stats.chartData.map((d, i) => {
                            const max = Math.max(...stats.chartData.map(c => c.total), 1);
                            const heightPercentage = Math.max((d.total / max) * 100, 5); // Min 5% height

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center group">
                                    <div className="relative w-full flex items-end justify-center">
                                        <div
                                            className="w-full max-w-[40px] bg-indigo-500 rounded-t-lg transition-all duration-300 group-hover:bg-indigo-600 relative"
                                            style={{ height: `${heightPercentage}%` }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                                                Q{d.total.toFixed(0)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 mt-3 font-medium">
                                        {new Date(d.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Transactions List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Últimas Ventas</h3>
                    <div className="space-y-4">
                        {ventas.slice(0, 5).map(venta => ( // Show last 5
                            <div key={venta.ventaId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{venta.clienteNombre || 'Consumidor Final'}</p>
                                    <p className="text-xs text-gray-500">
                                        {venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} • Factura #{venta.ventaId || 0}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-bold text-emerald-600">
                                        +Q{(venta.montoTotal || 0).toFixed(2)}
                                    </span>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{venta.metodoPago}</span>
                                </div>
                            </div>
                        ))}
                        {ventas.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No hay ventas registradas</p>}
                    </div>

                    <button className="w-full mt-6 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                        Ver Historial Completo <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
