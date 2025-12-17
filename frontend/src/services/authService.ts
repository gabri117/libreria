const API_URL = 'http://localhost:8080/api/auth';

export const loginUsuario = async (credentials: { username: string; password: string }) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al iniciar sesión');
    }

    return response.json();
};
