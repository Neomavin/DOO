import axios from 'axios';

const API_URL = 'http://192.168.1.3:4000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejo centralizado de errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Manejo de errores de red
        // Manejo de errores de red
        if (!error.response) {
            // Preservar el error original pero actualizar el mensaje
            error.message = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
            error.isNetworkError = true;
            return Promise.reject(error);
        }

        const { status, data } = error.response;

        // Crear objeto de error personalizado
        const customError = new Error(data?.message || 'Ha ocurrido un error');
        customError.status = status;
        customError.data = data;

        // Manejo de errores específicos por código de estado
        switch (status) {
            case 400:
                // Bad Request - Error de validación
                customError.message = data?.message || 'Datos inválidos. Por favor verifica la información.';
                break;

            case 401:
                // No autorizado - Token inválido o expirado
                customError.message = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
                // Limpiar localStorage y redirigir al login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                break;

            case 403:
                // Prohibido - Sin permisos
                customError.message = 'No tienes permisos para realizar esta acción.';
                break;

            case 404:
                // No encontrado
                customError.message = data?.message || 'El recurso solicitado no fue encontrado.';
                break;

            case 409:
                // Conflicto - Ej: usuario ya existe
                customError.message = data?.message || 'Ya existe un registro con estos datos.';
                break;

            case 500:
            case 502:
            case 503:
                // Errores del servidor
                customError.message = 'Error en el servidor. Por favor intenta más tarde.';
                break;

            default:
                customError.message = data?.message || 'Ha ocurrido un error inesperado.';
        }

        return Promise.reject(customError);
    }
);

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

export const restaurantService = {
    getAll: async () => {
        const response = await api.get('/restaurants');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/restaurants/${id}`);
        return response.data;
    },

    getMenu: async (restaurantId) => {
        const response = await api.get(`/restaurants/${restaurantId}/menu`);
        return response.data;
    },
};

export const orderService = {
    create: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },
};

export const addressService = {
    getAll: async () => {
        const response = await api.get('/addresses');
        return response.data;
    },

    create: async (addressData) => {
        const response = await api.post('/addresses', addressData);
        return response.data;
    },

    update: async (id, addressData) => {
        const response = await api.put(`/addresses/${id}`, addressData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/addresses/${id}`);
        return response.data;
    },
};

export default api;
