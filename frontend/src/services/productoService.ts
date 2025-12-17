import axiosClient from '../api/axiosClient';
import type { Producto, ProductoFormData, Categoria, Ubicacion } from '../types';

// Productos
export const obtenerProductos = async (): Promise<Producto[]> => {
    const response = await axiosClient.get<Producto[]>('/productos');
    return response.data;
};

export const obtenerProductoPorId = async (id: number): Promise<Producto> => {
    const response = await axiosClient.get<Producto>(`/productos/${id}`);
    return response.data;
};

export const crearProducto = async (producto: ProductoFormData): Promise<Producto> => {
    const payload = {
        nombre: producto.nombre,
        sku: producto.sku,
        precioVenta: producto.precioVenta,
        precioMayorista: producto.precioMayorista,
        precioCosto: producto.precioCosto,
        cantidadStock: producto.cantidadStock,
        categoria: { categoriaId: producto.categoriaId },
        ubicacion: { ubicacionId: producto.ubicacionId }
    };
    const response = await axiosClient.post<Producto>('/productos', payload);
    return response.data;
};

export const actualizarProducto = async (id: number, producto: ProductoFormData): Promise<Producto> => {
    const payload = {
        nombre: producto.nombre,
        sku: producto.sku,
        precioVenta: producto.precioVenta,
        precioMayorista: producto.precioMayorista,
        precioCosto: producto.precioCosto,
        cantidadStock: producto.cantidadStock,
        categoria: { categoriaId: producto.categoriaId },
        ubicacion: { ubicacionId: producto.ubicacionId }
    };
    const response = await axiosClient.put<Producto>(`/productos/${id}`, payload);
    return response.data;
};

export const eliminarProducto = async (id: number): Promise<void> => {
    await axiosClient.delete(`/productos/${id}`);
};

// Categorías
export const obtenerCategorias = async (): Promise<Categoria[]> => {
    const response = await axiosClient.get<Categoria[]>('/categorias');
    return response.data;
};

// Ubicaciones
export const obtenerUbicaciones = async (): Promise<Ubicacion[]> => {
    const response = await axiosClient.get<Ubicacion[]>('/ubicaciones');
    return response.data;
};
