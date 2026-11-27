import axiosClient from '../api/axiosClient';
import type { AjusteInventarioDTO } from '../types';

export const obtenerAjustesInventario = async (): Promise<AjusteInventarioDTO[]> => {
    const response = await axiosClient.get<AjusteInventarioDTO[]>('/ajustes-inventario');
    return response.data;
};

export const registrarAjusteInventario = async (ajuste: AjusteInventarioDTO): Promise<AjusteInventarioDTO> => {
    const response = await axiosClient.post<AjusteInventarioDTO>('/ajustes-inventario', ajuste);
    return response.data;
};
