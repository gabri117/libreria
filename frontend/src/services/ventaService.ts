import axiosClient from '../api/axiosClient';
import type { VentaDTO } from '../types';

export const crearVenta = async (venta: VentaDTO): Promise<VentaDTO> => {
    const response = await axiosClient.post<VentaDTO>('/ventas', venta);
    return response.data;
};

export const obtenerVentas = async (): Promise<VentaDTO[]> => {
    const response = await axiosClient.get<VentaDTO[]>('/ventas');
    return response.data;
};
