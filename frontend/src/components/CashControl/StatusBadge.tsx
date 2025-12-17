import { Activity } from 'lucide-react';
import type { SesionCaja } from '../../types';

interface StatusBadgeProps {
    sesion: SesionCaja | null;
}

export const StatusBadge = ({ sesion }: StatusBadgeProps) => {
    if (!sesion) return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-xs font-medium border border-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Caja Cerrada
        </div>
    );

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
            <Activity size={12} />
            <span>Sesión #{sesion.sesionId}</span>
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span>Activa</span>
        </div>
    );
};
