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

// Roles hardcoded for MVP as per plan or fetched if backend endpoint exists
export const ROLES = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Vendedor' }
];
