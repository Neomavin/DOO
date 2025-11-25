'use client';

import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ordersService from '@/services/orders.service';
import authService from '@/services/auth.service';
import type { Order } from '@/types';
import { currencyFormatter } from '@/lib/utils';

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric' });

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const restaurantId = authService.getCurrentUser()?.restaurantId ?? 'demo';

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await ordersService.list(restaurantId);
        setOrders(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'No se pudieron cargar los reportes');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [restaurantId]);

  const summary = useMemo(() => {
    const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
    const avgOrder = orders.length ? totalSales / orders.length : 0;
    const pendingOrders = orders.filter((order) => order.status !== 'DELIVERED').length;
    const activeProducts = new Set<string>();
    orders.forEach((order) =>
      order.items.forEach((item) => {
        activeProducts.add(item.productId);
      }),
    );
    return {
      totalSales,
      avgOrder,
      pendingOrders,
      activeProducts: activeProducts.size,
    };
  }, [orders]);

  const salesTrend = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const label = formatDateLabel(date);
      const total = orders
        .filter(
          (order) =>
            new Date(order.createdAt).toDateString() === date.toDateString(),
        )
        .reduce((sum, order) => sum + order.total, 0);
      return { label, total: Number(total.toFixed(2)) };
    });
    return days;
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current = map.get(item.productId) ?? { name: item.name, quantity: 0 };
        current.quantity += item.quantity;
        map.set(item.productId, current);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  if (loading) {
    return <p>Cargando reportes...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-white">Reportes</h1>
        <p className="text-brand-gray">Visualiza ventas y productos más vendidos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-[#0f1a2f]">
          <CardHeader>
            <CardTitle className="text-sm text-brand-gray">Ventas acumuladas</CardTitle>
            <p className="text-3xl font-bold text-brand-white">{currencyFormatter(summary.totalSales)}</p>
          </CardHeader>
        </Card>
        <Card className="bg-[#0f1a2f]">
          <CardHeader>
            <CardTitle className="text-sm text-brand-gray">Ticket promedio</CardTitle>
            <p className="text-3xl font-bold text-brand-white">{currencyFormatter(summary.avgOrder)}</p>
          </CardHeader>
        </Card>
        <Card className="bg-[#0f1a2f]">
          <CardHeader>
            <CardTitle className="text-sm text-brand-gray">Pedidos pendientes</CardTitle>
            <p className="text-3xl font-bold text-brand-white">{summary.pendingOrders}</p>
          </CardHeader>
        </Card>
        <Card className="bg-[#0f1a2f]">
          <CardHeader>
            <CardTitle className="text-sm text-brand-gray">Productos activos</CardTitle>
            <p className="text-3xl font-bold text-brand-white">{summary.activeProducts}</p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-[#0f1a2f]">
          <CardHeader>
            <CardTitle className="text-brand-white">Ventas últimos 7 días</CardTitle>
            <CardDescription className="text-brand-gray">
              Tendencia diaria acumulada
            </CardDescription>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend}>
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `L ${value}`} />
                <Tooltip formatter={(value: number) => currencyFormatter(value)} />
                <Line type="monotone" dataKey="total" stroke="#fca311" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-[#0f1a2f]">
          <CardHeader>
            <CardTitle className="text-brand-white">Productos más vendidos</CardTitle>
            <CardDescription className="text-brand-gray">
              Últimas órdenes confirmadas
            </CardDescription>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="quantity" fill="#fca311" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
