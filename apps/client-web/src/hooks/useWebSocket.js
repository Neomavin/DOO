import { useEffect, useState, useCallback } from 'react';
import websocketService from '../services/websocket';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(websocketService.isConnected());
    const [lastMessage, setLastMessage] = useState(null);

    useEffect(() => {
        // Conectar al montar
        const socket = websocketService.connect();

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, []);

    const subscribe = useCallback((event, callback) => {
        websocketService.on(event, (data) => {
            setLastMessage({ event, data });
            if (callback) callback(data);
        });

        return () => websocketService.off(event, callback);
    }, []);

    const emit = useCallback((event, data) => {
        websocketService.emit(event, data);
    }, []);

    return {
        isConnected,
        lastMessage,
        subscribe,
        emit,
        socket: websocketService.socket
    };
};
