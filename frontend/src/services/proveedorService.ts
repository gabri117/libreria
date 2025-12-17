import axiosClient from '../api/axiosClient';
import type { Proveedor, ProveedorFormData } from '../types';

export const obtenerProveedores = async (): Promise<Proveedor[]> => {
    const response = await axiosClient.get<Proveedor[]>('/proveedores');
    return response.data;
};

export const crearProveedor = async (proveedor: ProveedorFormData): Promise<Proveedor> => {
    const response = await axiosClient.post<Proveedor>('/proveedores', proveedor);
    return response.data;
};

export const actualizarProveedor = async (id: number, proveedor: ProveedorFormData): Promise<Proveedor> => {
    const response = await axiosClient.put<Proveedor>(`/proveedores/${id}`, proveedor);
    return response.data;
};

export const eliminarProveedor = async (id: number): Promise<void> => {
    await axiosClient.delete(`/proveedores/${id}`);
};
