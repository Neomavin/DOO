'use client';

import { useEffect, useState } from 'react';
import ordersService from '@/services/orders.service';
import authService from '@/services/auth.service';
import type { Order } from '@/types';
import { currencyFormatter, formatStatus } from '@/lib/utils';

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const restaurantId = authService.getCurrentUser()?.restaurantId ?? 'demo';

  useEffect(() => {
    ordersService.list(restaurantId).then(setOrders);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-white">Historial de pedidos</h1>
        <p className="text-brand-gray">Filtra por fecha y estado próximamente</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-brand-navy">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-navy/40 text-xs uppercase text-brand-gray">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-brand-navy/40">
                <td className="px-4 py-3 font-mono text-brand-white">#{order.id.slice(0, 6)}</td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent">
                    {formatStatus(order.status)}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-brand-white">{currencyFormatter(order.total)}</td>
                <td className="px-4 py-3 text-brand-gray">{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
