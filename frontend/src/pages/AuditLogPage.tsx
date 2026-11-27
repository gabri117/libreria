import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, RefreshCw, Loader2, Search, ChevronLeft, ChevronRight, User } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    obtenerAuditLogs,
    obtenerSesionesAudit,
    obtenerAuditLogsPorUsuario
} from '../services/auditService';
import { obtenerUsuarios } from '../services/userService';
import type { AuditLogDTO, PageResponse, TipoAccion } from '../types';

type VistaAudit = 'todos' | 'sesiones';

const ACTION_BADGE_STYLES: Record<TipoAccion, string> = {
    CREATE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    UPDATE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/30',
    ANULAR_VENTA: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    LOGIN: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    LOGOUT: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const PAGE_SIZE = 20;

export const AuditLogPage = () => {
    const [pageData, setPageData] = useState<PageResponse<AuditLogDTO> | null>(null);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [vista, setVista] = useState<VistaAudit>('todos');
    const [selectedUsuarioId, setSelectedUsuarioId] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        obtenerUsuarios()
            .then(setUsuarios)
            .catch(() => {
                // El filtro por usuario es opcional; el log principal sigue funcionando
            });
    }, []);

    const cargarLogs = async (targetPage = page) => {
        setIsLoading(true);
        try {
            let data: PageResponse<AuditLogDTO>;
            if (selectedUsuarioId > 0) {
                data = await obtenerAuditLogsPorUsuario(selectedUsuarioId, targetPage, PAGE_SIZE);
            } else if (vista === 'sesiones') {
                data = await obtenerSesionesAudit(targetPage, PAGE_SIZE);
            } else {
                data = await obtenerAuditLogs(targetPage, PAGE_SIZE);
            }
            setPageData(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar registros de auditoría');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarLogs(page);
    }, [vista, selectedUsuarioId, page]);

    const handleChangeVista = (nuevaVista: VistaAudit) => {
        setSelectedUsuarioId(0);
        setVista(nuevaVista);
        setPage(0);
    };

    const handleChangeUsuario = (usuarioId: number) => {
        setSelectedUsuarioId(usuarioId);
        setPage(0);
    };

    const logsFiltrados = useMemo(() => {
        const rows = pageData?.content || [];
        const term = searchTerm.trim().toLowerCase();
        if (!term) return rows;
        return rows.filter(log =>
            (log.detalles || '').toLowerCase().includes(term) ||
            (log.entidad || '').toLowerCase().includes(term) ||
            (log.accion || '').toLowerCase().includes(term) ||
            (log.usuarioNombre || '').toLowerCase().includes(term)
        );
    }, [pageData, searchTerm]);

    return (
        <div className="animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="h-1 w-8 bg-brand-primary-500 rounded-full"></span>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <ClipboardList className="text-brand-primary-400" size={30} />
                            Auditoría del Sistema
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm font-medium ml-11">
                        Bitácora de eventos críticos: ventas, anulaciones, compras, ajustes y accesos
                    </p>
                </div>

                <button
                    onClick={() => cargarLogs(page)}
                    className="px-5 py-3 glass-card border-white/10 text-xs font-black uppercase tracking-widest text-brand-primary-400 hover:bg-brand-primary-500 hover:text-white rounded-2xl flex items-center gap-2 transition-all"
                >
                    <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
            </header>

            {/* Filtros */}
            <div className="glass-panel p-4 rounded-3xl mb-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 border border-white/10">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleChangeVista('todos')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${selectedUsuarioId === 0 && vista === 'todos'
                            ? 'bg-brand-primary-500 text-white border-brand-primary-400/50'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => handleChangeVista('sesiones')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${selectedUsuarioId === 0 && vista === 'sesiones'
                            ? 'bg-brand-primary-500 text-white border-brand-primary-400/50'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                            }`}
                    >
                        Accesos / Sesiones
                    </button>
                </div>

                <div className="flex items-center gap-2 lg:w-64">
                    <User size={16} className="text-gray-500 shrink-0" />
                    <select
                        value={selectedUsuarioId}
                        onChange={e => handleChangeUsuario(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold"
                    >
                        <option value={0} className="bg-slate-900">Todos los usuarios</option>
                        {usuarios.map(u => (
                            <option key={u.usuarioId} value={u.usuarioId} className="bg-slate-900">
                                {u.nombreCompleto} (@{u.username})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Filtrar en esta página por detalle, entidad o acción..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-xs font-bold focus:outline-none focus:border-brand-primary-500/50"
                    />
                </div>
            </div>

            {/* Tabla */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-brand-primary-400">
                        <Loader2 className="animate-spin mb-3" size={36} />
                        <p className="text-xs font-black uppercase tracking-widest">Cargando bitácora...</p>
                    </div>
                ) : logsFiltrados.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <ClipboardList size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-bold">No se encontraron eventos de auditoría</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <th className="py-4 px-5">Fecha</th>
                                        <th className="py-4 px-5">Usuario</th>
                                        <th className="py-4 px-5">Acción</th>
                                        <th className="py-4 px-5">Entidad</th>
                                        <th className="py-4 px-5">Detalles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {logsFiltrados.map(log => (
                                        <tr key={log.auditId} className="hover:bg-white/[0.03] transition-colors">
                                            <td className="py-4 px-5 text-xs text-gray-400 whitespace-nowrap">
                                                {log.fechaAccion ? new Date(log.fechaAccion).toLocaleString('es-GT') : '—'}
                                            </td>
                                            <td className="py-4 px-5 font-bold text-white whitespace-nowrap">
                                                {log.usuarioNombre || (log.usuarioId ? `Usuario #${log.usuarioId}` : 'Sistema')}
                                            </td>
                                            <td className="py-4 px-5 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${ACTION_BADGE_STYLES[log.accion] || 'bg-white/5 text-gray-300 border-white/10'}`}>
                                                    {log.accion}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-xs font-bold text-gray-300 whitespace-nowrap">
                                                {log.entidad}{log.entidadId ? ` #${log.entidadId}` : ''}
                                            </td>
                                            <td className="py-4 px-5 text-gray-300 text-xs max-w-md">
                                                {log.detalles || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {pageData && (
                            <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
                                <span className="font-bold">
                                    Página {pageData.number + 1} de {Math.max(pageData.totalPages, 1)} • {pageData.totalElements} registros
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={pageData.first}
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white font-bold flex items-center gap-1"
                                    >
                                        <ChevronLeft size={14} />
                                        Anterior
                                    </button>
                                    <button
                                        disabled={pageData.last}
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white font-bold flex items-center gap-1"
                                    >
                                        Siguiente
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
