import axiosClient from '../api/axiosClient';
import type { Producto, ProductoFormData, Categoria, Ubicacion } from '../types';

// Aux para mapear DTO plano a objeto Producto anidado
const mapProducto = (data: any): Producto => ({
    ...data,
    categoria: {
        categoriaId: data.categoriaId,
        nombre: data.categoriaNombre || 'Sin Categoría'
    },
    ubicacion: {
        ubicacionId: data.ubicacionId,
        nombreCorto: data.ubicacionNombre || 'Sin Ubicación',
        descripcion: '' // No viene en el DTO simplificado
    }
});

// Productos
export const obtenerProductos = async (): Promise<Producto[]> => {
    const response = await axiosClient.get<any[]>('/productos');
    return response.data.map(mapProducto);
};

export const obtenerProductoPorId = async (id: number): Promise<Producto> => {
    const response = await axiosClient.get<any>(`/productos/${id}`);
    return mapProducto(response.data);
};

export const crearProducto = async (producto: ProductoFormData): Promise<Producto> => {
    const payload = {
        nombre: producto.nombre,
        sku: producto.sku,
        precioVenta: producto.precioVenta,
        precioMayorista: producto.precioMayorista,
        precioCosto: producto.precioCosto,
        cantidadStock: producto.cantidadStock,
        categoriaId: producto.categoriaId,
        ubicacionId: producto.ubicacionId,
        descripcion: producto.descripcion
    };
    const response = await axiosClient.post<any>('/productos', payload);
    return mapProducto(response.data);
};

export const actualizarProducto = async (id: number, producto: ProductoFormData): Promise<Producto> => {
    const payload = {
        nombre: producto.nombre,
        sku: producto.sku,
        precioVenta: producto.precioVenta,
        precioMayorista: producto.precioMayorista,
        precioCosto: producto.precioCosto,
        cantidadStock: producto.cantidadStock,
        categoriaId: producto.categoriaId,
        ubicacionId: producto.ubicacionId,
        descripcion: producto.descripcion
    };
    const response = await axiosClient.put<any>(`/productos/${id}`, payload);
    return mapProducto(response.data);
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
