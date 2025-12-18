import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { obtenerVentas } from '../services/ventaService';
import type { VentaDTO } from '../types';

export const DashboardPage = () => {
    const [ventas, setVentas] = useState<VentaDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

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

    if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center text-brand-primary-400 font-bold animate-pulse">Cargando Dashboard...</div>;

    return (
        <div className="animate-fade-in">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-1">
                    <span className="h-1 w-8 bg-brand-primary-500 rounded-full"></span>
                    <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
                </div>
                <p className="text-gray-400 text-sm font-medium">Resumen de actividad del negocio • {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </header>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 hover:translate-y-[-4px] transition-all duration-300">
                    <div className="p-4 bg-brand-primary-500/10 text-brand-primary-400 rounded-2xl">
                        <DollarSign size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Ventas Hoy</p>
                        <h3 className="text-3xl font-black text-white">Q{stats.totalHoy.toFixed(2)}</h3>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 hover:translate-y-[-4px] transition-all duration-300">
                    <div className="p-4 bg-brand-secondary-500/10 text-brand-secondary-400 rounded-2xl">
                        <ShoppingBag size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Ventas Realizadas</p>
                        <h3 className="text-3xl font-black text-white">{stats.transacciones}</h3>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 hover:translate-y-[-4px] transition-all duration-300">
                    <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                        <TrendingUp size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Promedio</p>
                        <h3 className="text-3xl font-black text-white">Q{stats.promedio.toFixed(2)}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <Calendar size={22} className="text-brand-primary-500" />
                            Ventas Últimos 7 Días
                        </h3>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-brand-primary-500"></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Q / Día</span>
                        </div>
                    </div>

                    <div className="h-72 flex items-end justify-between gap-3 px-2">
                        {stats.chartData.map((d, i) => {
                            const max = Math.max(...stats.chartData.map(c => c.total), 1);
                            const heightPercentage = Math.max((d.total / max) * 100, 8);

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center group relative">
                                    <div className="relative w-full flex items-end justify-center h-full">
                                        <div
                                            className="w-full max-w-[45px] bg-gradient-to-t from-brand-primary-600 to-brand-primary-400 rounded-t-xl transition-all duration-500 group-hover:from-brand-primary-500 group-hover:to-brand-primary-300 shadow-lg shadow-brand-primary-500/10 relative"
                                            style={{ height: `${heightPercentage}%` }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 glass-panel scale-90 group-hover:scale-100 text-white text-[10px] font-black py-1.5 px-3 rounded-xl pointer-events-none transition-all duration-300 z-20 whitespace-nowrap border-brand-primary-500/30">
                                                Q{d.total.toFixed(0)}
                                            </div>
                                            {/* Glow effect */}
                                            <div className="absolute inset-0 bg-brand-primary-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-5 font-black uppercase tracking-tighter">
                                        {new Date(d.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Transactions List */}
                <div className="glass-panel p-8 rounded-3xl flex flex-col h-full">
                    <h3 className="text-xl font-black text-white mb-8 tracking-tight">Últimas Ventas</h3>
                    <div className="space-y-4 flex-1">
                        {ventas.slice(0, 5).map(venta => (
                            <div key={venta.ventaId} className="flex items-center justify-between p-4 glass-card rounded-2xl transition-all hover:border-brand-primary-500/30 group">
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-100 truncate">{venta.clienteNombre || 'Consumidor Final'}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-1">
                                        {venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} • #{venta.ventaId || 0}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="block text-sm font-black text-brand-primary-400 group-hover:text-brand-primary-300 transition-colors">
                                        +Q{(venta.montoTotal || 0).toFixed(2)}
                                    </span>
                                    <span className="text-[9px] font-black text-gray-400 bg-white/5 py-0.5 px-2 rounded-full uppercase">{venta.metodoPago}</span>
                                </div>
                            </div>
                        ))}
                        {ventas.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                                <ShoppingBag size={40} className="mb-2 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">Sin registros</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/ventas')}
                        className="w-full mt-8 py-4 glass-card border-brand-primary-500/20 text-xs font-black text-brand-primary-400 uppercase tracking-widest hover:bg-brand-primary-500 hover:text-white transition-all flex items-center justify-center gap-2 rounded-2xl shadow-lg"
                    >
                        Historial Completo <ArrowRight size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};
