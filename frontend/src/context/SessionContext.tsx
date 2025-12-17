import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SesionCaja, AperturaCajaDTO, CierreCajaDTO } from '../types';
import { obtenerSesionActiva, abrirCaja as abrirCajaService, cerrarCaja as cerrarCajaService } from '../services/sesionService';
import toast from 'react-hot-toast';

interface SessionContextType {
    sesionActiva: SesionCaja | null;
    isLoading: boolean;
    abrirSesion: (montoInicial: number) => Promise<void>;
    cerrarSesion: (montoFinalContado: number) => Promise<void>;
    verificarSesion: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [sesionActiva, setSesionActiva] = useState<SesionCaja | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const USUARIO_ID_TEST = 1; // Hardcoded user for now

    const verificarSesion = async () => {
        setIsLoading(true);
        try {
            const sesion = await obtenerSesionActiva(USUARIO_ID_TEST);
            setSesionActiva(sesion);
        } catch (error) {
            console.error("Error verificando sesión", error);
            setSesionActiva(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        verificarSesion();
    }, []);

    const abrirSesion = async (montoInicial: number) => {
        try {
            const data: AperturaCajaDTO = { usuarioId: USUARIO_ID_TEST, montoInicial };
            const nuevaSesion = await abrirCajaService(data);
            setSesionActiva(nuevaSesion);
            toast.success('Caja abierta correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al abrir la caja');
            throw error;
        }
    };

    const cerrarSesion = async (montoFinalContado: number) => {
        if (!sesionActiva) return;
        try {
            const data: CierreCajaDTO = { usuarioId: USUARIO_ID_TEST, montoFinalContado };
            await cerrarCajaService(sesionActiva.sesionId, data);
            setSesionActiva(null);
            toast.success('Caja cerrada correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al cerrar la caja');
            throw error;
        }
    };

    return (
        <SessionContext.Provider value={{ sesionActiva, isLoading, abrirSesion, cerrarSesion, verificarSesion }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error('useSession must be used within a SessionProvider');
    return context;
};
