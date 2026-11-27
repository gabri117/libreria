import axiosClient from '../api/axiosClient';

export const obtenerUsuarios = async () => {
    try {
        const response = await axiosClient.get('/usuarios');
        return response.data;
    } catch (error: any) {
        throw new Error('Error al cargar usuarios');
    }
};

export const crearUsuario = async (usuario: any) => {
    try {
        const response = await axiosClient.post('/usuarios', usuario);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || error.response?.data || 'Error al crear usuario';
        throw new Error(message);
    }
};

export const actualizarUsuario = async (id: number, usuario: {
    nombreCompleto: string;
    rolId: number;
    password?: string;
    activo?: boolean;
}) => {
    try {
        const response = await axiosClient.put(`/usuarios/${id}`, usuario);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || error.response?.data || 'Error al actualizar usuario';
        throw new Error(message);
    }
};

export const cambiarEstadoUsuario = async (id: number, activo: boolean) => {
    try {
        const response = await axiosClient.patch(`/usuarios/${id}/estado`, { activo });
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || error.response?.data || 'Error al cambiar estado del usuario';
        throw new Error(message);
    }
};

// Roles hardcoded for MVP as per plan or fetched if backend endpoint exists
export const ROLES = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Vendedor' }
];
