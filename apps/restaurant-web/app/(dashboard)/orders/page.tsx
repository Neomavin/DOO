'use client';

import { useEffect, useState, useRef } from 'react';
import ordersService from '@/services/orders.service';
import authService from '@/services/auth.service';
import socketService from '@/services/socket.service';
import type { Order } from '@/types';
import { OrderCard } from '@/components/dashboard/OrderCard';
import { Bell } from 'lucide-react';

type OrderTab = 'NEW' | 'ACCEPTED' | 'READY' | 'ALL';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<OrderTab>('NEW');
  const [newOrderCount, setNewOrderCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const restaurantId = authService.getCurrentUser()?.restaurantId ?? 'demo';

  const fetchOrders = async () => {
    const data = await ordersService.list(restaurantId);
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
    socketService.connect(restaurantId);

    // Escuchar nuevos pedidos
    socketService.on<Order>('newOrder', (order) => {
      console.log('🔔 Nuevo pedido recibido:', order);
      setOrders((prev) => [order, ...prev]);
      setNewOrderCount((prev) => prev + 1);
      
      // Reproducir sonido de notificación
      if (audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
      
      // Mostrar notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nuevo Pedido', {
          body: `${order.customerName} - ${order.total} L`,
          icon: '/favicon.ico',
        });
      }
    });

    // Escuchar actualizaciones de pedidos
    socketService.on<Order>('orderUpdate', (updatedOrder) => {
      console.log('📦 Pedido actualizado:', updatedOrder);
      setOrders((prev) =>
        prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
      );
    });

    // Solicitar permisos de notificación
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketService.off('newOrder');
      socketService.off('orderUpdate');
    };
  }, [restaurantId]);

  const handleAccept = async (id: string) => {
    await ordersService.accept(id);
    await fetchOrders();
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Razón del rechazo (opcional):');
    await ordersService.reject(id, reason || undefined);
    await fetchOrders();
  };

  const handleReady = async (id: string) => {
    await ordersService.ready(id);
    await fetchOrders();
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ALL') return true;
    return order.status === activeTab;
  });

  const tabs: { key: OrderTab; label: string; count: number }[] = [
    { key: 'NEW', label: 'Nuevos', count: orders.filter((o) => o.status === 'NEW').length },
    { key: 'ACCEPTED', label: 'Aceptados', count: orders.filter((o) => o.status === 'ACCEPTED').length },
    { key: 'READY', label: 'Listos', count: orders.filter((o) => o.status === 'READY').length },
    { key: 'ALL', label: 'Todos', count: orders.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-white">Pedidos</h1>
          <p className="text-brand-gray flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Tiempo real con WebSocket
          </p>
        </div>
        {newOrderCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-brand-accent/10 px-4 py-2">
            <Bell className="h-5 w-5 text-brand-accent" />
            <span className="text-sm font-semibold text-brand-accent">
              {newOrderCount} nuevo{newOrderCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setNewOrderCount(0)}
              className="text-xs text-brand-accent/70 hover:text-brand-accent"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-navy">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-brand-accent text-brand-accent'
                : 'text-brand-gray hover:text-brand-white'
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-brand-navy">
          <p className="text-brand-gray">No hay pedidos en esta categoría</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={handleAccept}
              onReject={handleReject}
              onReady={handleReady}
            />
          ))}
        </div>
      )}

      {/* Audio para notificación */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
    </div>
  );
}
