import axiosClient from '../api/axiosClient';
import type { Categoria } from '../types';

export const obtenerCategorias = async (): Promise<Categoria[]> => {
    const response = await axiosClient.get<Categoria[]>('/categorias');
    return response.data;
};

export const crearCategoria = async (categoria: Partial<Categoria>): Promise<Categoria> => {
    const response = await axiosClient.post<Categoria>('/categorias', categoria);
    return response.data;
};

export const actualizarCategoria = async (id: number, categoria: Partial<Categoria>): Promise<Categoria> => {
    const response = await axiosClient.put<Categoria>(`/categorias/${id}`, categoria);
    return response.data;
};

export const eliminarCategoria = async (id: number): Promise<void> => {
    await axiosClient.delete(`/categorias/${id}`);
};
