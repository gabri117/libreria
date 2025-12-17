import axiosClient from '../api/axiosClient';
import type { Ubicacion } from '../types';

export const obtenerUbicaciones = async (): Promise<Ubicacion[]> => {
    const response = await axiosClient.get<Ubicacion[]>('/ubicaciones');
    return response.data;
};

export const crearUbicacion = async (ubicacion: Partial<Ubicacion>): Promise<Ubicacion> => {
    const response = await axiosClient.post<Ubicacion>('/ubicaciones', ubicacion);
    return response.data;
};

export const actualizarUbicacion = async (id: number, ubicacion: Partial<Ubicacion>): Promise<Ubicacion> => {
    const response = await axiosClient.put<Ubicacion>(`/ubicaciones/${id}`, ubicacion);
    return response.data;
};

export const eliminarUbicacion = async (id: number): Promise<void> => {
    await axiosClient.delete(`/ubicaciones/${id}`);
};
