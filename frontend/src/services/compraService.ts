import axiosClient from '../api/axiosClient';
import type { CompraDTO } from '../types';

export const obtenerCompras = async (): Promise<CompraDTO[]> => {
    const response = await axiosClient.get<CompraDTO[]>('/compras');
    return response.data;
};

export const registrarCompra = async (compra: CompraDTO): Promise<CompraDTO> => {
    const response = await axiosClient.post<CompraDTO>('/compras', compra);
    return response.data;
};
