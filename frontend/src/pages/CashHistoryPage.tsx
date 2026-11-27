import { useEffect, useMemo, useState } from 'react';
import { Wallet, RefreshCw, Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerHistorialSesiones } from '../services/sesionService';
import type { SesionCaja, EstadoSesion } from '../types';

type FiltroEstado = 'Todas' | EstadoSesion;

const formatDateTime = (value?: string): string => {
    if (!value) return '—';
    return new Date(value).toLocaleString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatCurrency = (value?: number | null): string => {
    if (value === undefined || value === null) return '—';
    return `Q${Number(value).toFixed(2)}`;
};

export const CashHistoryPage = () => {
    const [sesiones, setSesiones] = useState<SesionCaja[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('Todas');

    const cargarHistorial = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerHistorialSesiones();
            setSesiones(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar historial de cierres de caja');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarHistorial();
    }, []);

    const sesionesFiltradas = useMemo(() => {
        if (filtroEstado === 'Todas') return sesiones;
        return sesiones.filter(s => s.estado === filtroEstado);
    }, [sesiones, filtroEstado]);

    const resumen = useMemo(() => {
        const cerradas = sesiones.filter(s => s.estado === 'Cerrada');
        const conDiferencia = cerradas.filter(s => Math.abs(Number(s.diferencia || 0)) > 0.009).length;
        const diferenciaNeta = cerradas.reduce((acc, s) => acc + Number(s.diferencia || 0), 0);
        return {
            total: sesiones.length,
            cerradas: cerradas.length,
            conDiferencia,
            diferenciaNeta
        };
    }, [sesiones]);

    return (
        <div className="animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="h-1 w-8 bg-brand-primary-500 rounded-full"></span>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <Wallet className="text-brand-primary-400" size={30} />
                            Historial de Cierres de Caja
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm font-medium ml-11">
                        Arqueos de efectivo, responsables de apertura/cierre y diferencias registradas
                    </p>
                </div>

                <button
                    onClick={cargarHistorial}
                    className="px-5 py-3 glass-card border-white/10 text-xs font-black uppercase tracking-widest text-brand-primary-400 hover:bg-brand-primary-500 hover:text-white rounded-2xl flex items-center gap-2 transition-all"
                >
                    <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
            </header>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
                    <div className="p-3.5 bg-brand-primary-500/10 text-brand-primary-400 rounded-2xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Turnos</p>
                        <p className="text-2xl font-black text-white">{resumen.total}</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
                    <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cierres con Diferencia</p>
                        <p className="text-2xl font-black text-white">{resumen.conDiferencia}</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
                    <div className={`p-3.5 rounded-2xl ${resumen.diferenciaNeta < 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Balance Neto Diferencias</p>
                        <p className={`text-2xl font-black ${resumen.diferenciaNeta < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {resumen.diferenciaNeta >= 0 ? '+' : ''}{formatCurrency(resumen.diferenciaNeta)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2 mb-6">
                {(['Todas', 'Abierta', 'Cerrada'] as FiltroEstado[]).map(estado => (
                    <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${filtroEstado === estado
                            ? 'bg-brand-primary-500 text-white border-brand-primary-400/50'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                            }`}
                    >
                        {estado}
                    </button>
                ))}
            </div>

            {/* Tabla */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-brand-primary-400">
                        <Loader2 className="animate-spin mb-3" size={36} />
                        <p className="text-xs font-black uppercase tracking-widest">Cargando sesiones...</p>
                    </div>
                ) : sesionesFiltradas.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <Wallet size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-bold">No hay sesiones de caja registradas</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="py-4 px-5">#</th>
                                    <th className="py-4 px-5">Estado</th>
                                    <th className="py-4 px-5">Apertura</th>
                                    <th className="py-4 px-5">Cierre</th>
                                    <th className="py-4 px-5 text-right">Inicial</th>
                                    <th className="py-4 px-5 text-right">Esperado</th>
                                    <th className="py-4 px-5 text-right">Contado</th>
                                    <th className="py-4 px-5 text-right">Diferencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {sesionesFiltradas.map(sesion => {
                                    const diff = sesion.diferencia ?? null;
                                    const diffColor =
                                        diff === null
                                            ? 'text-gray-500'
                                            : Math.abs(diff) < 0.01
                                                ? 'text-emerald-400'
                                                : diff > 0
                                                    ? 'text-sky-400'
                                                    : 'text-red-400';

                                    return (
                                        <tr key={sesion.sesionId} className="hover:bg-white/[0.03] transition-colors">
                                            <td className="py-4 px-5 font-black text-gray-300">#{sesion.sesionId}</td>
                                            <td className="py-4 px-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${sesion.estado === 'Abierta'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                                                    }`}>
                                                    {sesion.estado}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <p className="font-bold text-white">{sesion.usuarioAperturaNombre || `Usuario #${sesion.usuarioAperturaId}`}</p>
                                                <p className="text-xs text-gray-500">{formatDateTime(sesion.fechaApertura)}</p>
                                            </td>
                                            <td className="py-4 px-5">
                                                <p className="font-bold text-gray-200">{sesion.usuarioCierreNombre || '—'}</p>
                                                <p className="text-xs text-gray-500">{formatDateTime(sesion.fechaCierre)}</p>
                                            </td>
                                            <td className="py-4 px-5 text-right font-bold text-gray-200">{formatCurrency(sesion.montoInicial)}</td>
                                            <td className="py-4 px-5 text-right font-bold text-gray-200">{formatCurrency(sesion.montoFinalEsperado)}</td>
                                            <td className="py-4 px-5 text-right font-bold text-white">{formatCurrency(sesion.montoFinalContado)}</td>
                                            <td className={`py-4 px-5 text-right font-black ${diffColor}`}>
                                                {diff === null ? '—' : `${diff > 0 ? '+' : ''}${formatCurrency(diff)}`}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
