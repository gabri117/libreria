import axios from 'axios';

const axiosClient = axios.create({
    // Si estamos en producción (Docker), usamos ruta relativa /api para que Nginx haga el proxy.
    // En desarrollo, usamos localhost:8080.
    baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 400 || status === 500) {
                console.error(`API Error [${status}]:`, error.response.data || error.message);
            }
        } else {
            console.error('Network or Server Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
