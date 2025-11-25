import { io } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.3:4000';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.listeners = new Map();
    }

    /**
     * Conecta al servidor WebSocket
     */
    connect() {
        if (this.socket?.connected) {
            return;
        }

        const token = localStorage.getItem('token');

        this.socket = io(SOCKET_URL, {
            auth: {
                token
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket conectado');
            this.connected = true;

            // Unirse a la sala del usuario
            const user = localStorage.getItem('user');
            if (user) {
                const userId = JSON.parse(user).id;
                this.socket.emit('join', userId);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket desconectado');
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Error de conexión WebSocket:', error);
        });

        return this.socket;
    }

    /**
     * Desconecta del servidor WebSocket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.listeners.clear();
        }
    }

    /**
     * Escucha un evento específico
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función a ejecutar cuando se reciba el evento
     */
    on(event, callback) {
        if (!this.socket) {
            this.connect();
        }

        this.socket.on(event, callback);

        // Guardar referencia para poder remover después
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Deja de escuchar un evento
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función específica a remover (opcional)
     */
    off(event, callback) {
        if (!this.socket) return;

        if (callback) {
            this.socket.off(event, callback);

            // Remover de la lista de listeners
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        } else {
            this.socket.off(event);
            this.listeners.delete(event);
        }
    }

    /**
     * Emite un evento al servidor
     * @param {string} event - Nombre del evento
     * @param {*} data - Datos a enviar
     */
    emit(event, data) {
        if (!this.socket) {
            this.connect();
        }

        this.socket.emit(event, data);
    }

    /**
     * Escucha cambios de estado de una orden específica
     * @param {string} orderId - ID de la orden
     * @param {Function} callback - Función a ejecutar cuando cambie el estado
     */
    onOrderStatusChange(callback) {
        this.on('orderStatusChange', callback);
    }

    /**
     * Escucha nuevas órdenes (para restaurantes)
     * @param {Function} callback - Función a ejecutar cuando llegue una nueva orden
     */
    onNewOrder(callback) {
        this.on('newOrder', callback);
    }

    /**
     * Une al usuario a la sala de un restaurante (para restaurantes)
     * @param {string} restaurantId - ID del restaurante
     */
    joinRestaurant(restaurantId) {
        this.emit('joinRestaurant', restaurantId);
    }

    /**
     * Verifica si está conectado
     */
    isConnected() {
        return this.connected && this.socket?.connected;
    }
}

// Exportar instancia singleton
const websocketService = new WebSocketService();

export default websocketService;
