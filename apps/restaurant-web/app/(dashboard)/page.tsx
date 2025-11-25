import { StatsCard } from '@/components/dashboard/StatsCard';
import { OrderCard } from '@/components/dashboard/OrderCard';
import { Card } from '@/components/ui/card';

const stats = [
  { title: 'Ventas del día', value: 12450, isCurrency: true },
  { title: 'Pedidos pendientes', value: 8 },
  { title: 'Productos activos', value: 32 },
  { title: 'Rating promedio', value: '4.8 ⭐' },
];

const recentOrders = [
  {
    id: 'ORD-1',
    customerName: 'Juan Pérez',
    total: 450,
    status: 'NEW',
    createdAt: new Date().toISOString(),
    items: [
      { productId: '1', name: 'Pizza Pepperoni', quantity: 1, price: 250 },
      { productId: '2', name: 'Bebida', quantity: 2, price: 100 },
    ],
  },
  {
    id: 'ORD-2',
    customerName: 'María Hernández',
    total: 320,
    status: 'PREPARING',
    createdAt: new Date().toISOString(),
    items: [{ productId: '3', name: 'Hamburguesa', quantity: 2, price: 160 }],
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="col-span-2 bg-[#111c35]">
          <h2 className="mb-4 text-xl font-semibold text-brand-white">Ventas (últimos 7 días)</h2>
          <div className="h-64 w-full rounded-xl bg-brand-navy/40" />
          <p className="mt-4 text-sm text-brand-gray">Integrar Recharts/Chart.js para datos reales.</p>
        </Card>
        <Card className="bg-[#111c35]">
          <h2 className="mb-4 text-xl font-semibold text-brand-white">Accesos rápidos</h2>
          <div className="grid gap-3">
            <button className="rounded-xl border border-brand-accent/40 px-4 py-3 text-left text-sm font-semibold text-brand-accent">
              Agregar producto
            </button>
            <button className="rounded-xl border border-brand-accent/40 px-4 py-3 text-left text-sm font-semibold text-brand-accent">
              Ver pedidos activos
            </button>
            <button className="rounded-xl border border-brand-accent/40 px-4 py-3 text-left text-sm font-semibold text-brand-accent">
              Generar reporte
            </button>
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-brand-white">Pedidos recientes</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </section>
    </div>
  );
}
