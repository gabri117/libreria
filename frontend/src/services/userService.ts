const API_URL = 'http://localhost:8080/api/usuarios';

export const obtenerUsuarios = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al cargar usuarios');
    return response.json();
};

export const crearUsuario = async (usuario: any) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear usuario');
    }
    return response.json();
};

// Roles hardcoded for MVP as per plan or fetched if backend endpoint exists
export const ROLES = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Vendedor' }
];
