import axiosClient from '../api/axiosClient';
import type { Cliente, ClienteFormData } from '../types';

export const obtenerClientes = async (): Promise<Cliente[]> => {
    const response = await axiosClient.get<Cliente[]>('/clientes');
    return response.data;
};

export const obtenerClientePorId = async (id: number): Promise<Cliente> => {
    const response = await axiosClient.get<Cliente>(`/clientes/${id}`);
    return response.data;
};

export const crearCliente = async (cliente: ClienteFormData): Promise<Cliente> => {
    const response = await axiosClient.post<Cliente>('/clientes', cliente);
    return response.data;
};

export const actualizarCliente = async (id: number, cliente: ClienteFormData): Promise<Cliente> => {
    const response = await axiosClient.put<Cliente>(`/clientes/${id}`, cliente);
    return response.data;
};

export const eliminarCliente = async (id: number): Promise<void> => {
    await axiosClient.delete(`/clientes/${id}`);
};
