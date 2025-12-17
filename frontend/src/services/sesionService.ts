import axiosClient from '../api/axiosClient';
import type { SesionCaja, AperturaCajaDTO, CierreCajaDTO } from '../types';

export const obtenerSesionActiva = async (usuarioId: number): Promise<SesionCaja | null> => {
    // Backend endpoint might need adjustment to filter by user or get global active session depending on rules.
    // Assuming a way to check if user has active session. For now, we might query by user.
    // Given the DDL, sessions are per user? Or per terminal?
    // Let's assume we fetch the latest open session for the user.
    try {
        const response = await axiosClient.get<SesionCaja>(`/sesiones/activa?usuarioId=${usuarioId}`);
        return response.data;
    } catch (error) {
        // If 404, returns null
        return null;
    }
};

export const abrirCaja = async (data: AperturaCajaDTO): Promise<SesionCaja> => {
    const response = await axiosClient.post<SesionCaja>('/sesiones/abrir', data);
    return response.data;
};

export const cerrarCaja = async (sesionId: number, data: CierreCajaDTO): Promise<SesionCaja> => {
    const response = await axiosClient.post<SesionCaja>(`/sesiones/${sesionId}/cerrar`, data);
    return response.data;
};
