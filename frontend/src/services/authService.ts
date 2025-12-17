import axiosClient from '../api/axiosClient';

export const loginUsuario = async (credentials: { username: string; password: string }) => {
    try {
        const response = await axiosClient.post('/auth/login', credentials);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || error.response?.data || 'Error al iniciar sesión';
        throw new Error(message);
    }
};
