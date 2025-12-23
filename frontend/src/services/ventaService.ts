import axiosClient from '../api/axiosClient';
import type { VentaDTO, FiltrosVenta, AnularVentaRequest } from '../types';

export const crearVenta = async (venta: VentaDTO): Promise<VentaDTO> => {
    const response = await axiosClient.post<VentaDTO>('/ventas', venta);
    return response.data;
};

export const obtenerVentas = async (): Promise<VentaDTO[]> => {
    const response = await axiosClient.get<VentaDTO[]>('/ventas');
    return response.data;
};

export const obtenerVentaPorId = async (id: number): Promise<VentaDTO> => {
    const response = await axiosClient.get<VentaDTO>(`/ventas/${id}`);
    return response.data;
};

export const filtrarVentas = async (filtros: FiltrosVenta): Promise<VentaDTO[]> => {
    const params = new URLSearchParams();

    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.clienteId) params.append('clienteId', filtros.clienteId.toString());
    if (filtros.metodoPago) params.append('metodoPago', filtros.metodoPago);
    if (filtros.estado) params.append('estado', filtros.estado);

    const response = await axiosClient.get<VentaDTO[]>(`/ventas/filtrar?${params.toString()}`);
    return response.data;
};

export const anularVenta = async (id: number, request: AnularVentaRequest): Promise<VentaDTO> => {
    const response = await axiosClient.put<VentaDTO>(`/ventas/${id}/anular`, request);
    return response.data;
};

export const descargarFactura = async (id: number): Promise<void> => {
    const response = await axiosClient.get(`/ventas/${id}/pdf`, {
        responseType: 'blob'
    });

    // Create a link to download the file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `factura_venta_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
