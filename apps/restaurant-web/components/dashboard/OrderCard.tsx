import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { currencyFormatter, formatStatus } from '@/lib/utils';
import type { Order } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  onAction?: (orderId: string, status: string) => void;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onReady?: (orderId: string) => void;
}

export function OrderCard({ order, onAction, onAccept, onReject, onReady }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'ACCEPTED':
        return 'bg-blue-500/10 text-blue-500';
      case 'READY':
        return 'bg-green-500/10 text-green-500';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-brand-accent/10 text-brand-accent';
    }
  };

  return (
    <Card className="space-y-4 bg-[#101b33] border border-brand-navy hover:border-brand-accent/30 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-brand-gray">
            Pedido #{order.id.slice(0, 8)}
          </p>
          <p className="text-lg font-semibold text-brand-white">{order.customerName}</p>
          <p className="text-xs text-brand-gray/70">
            {format(new Date(order.createdAt), "HH:mm - dd/MM/yyyy", { locale: es })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
          {formatStatus(order.status)}
        </span>
      </div>

      <div className="border-t border-brand-navy pt-2">
        <ul className="space-y-1 text-sm">
          {order.items.map((item, index) => (
            <li key={`${item.productId}-${index}`} className="flex justify-between text-brand-gray">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="text-brand-white">L {(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-brand-navy pt-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-brand-gray">Total</p>
          <p className="text-2xl font-bold text-brand-accent">{currencyFormatter(order.total)}</p>
        </div>

        {/* Acciones según el estado */}
        <div className="flex flex-col gap-2">
          {order.status === 'NEW' && (
            <>
              <Button
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => onAccept?.(order.id)}
              >
                ✓ Aceptar Pedido
              </Button>
              <Button
                variant="outline"
                className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
                onClick={() => onReject?.(order.id)}
              >
                ✕ Rechazar
              </Button>
            </>
          )}

          {order.status === 'ACCEPTED' && (
            <Button
              variant="default"
              className="w-full bg-brand-accent hover:bg-brand-accent/90"
              onClick={() => onReady?.(order.id)}
            >
              ✓ Marcar Listo para Recoger
            </Button>
          )}

          {order.status === 'READY' && (
            <div className="text-center py-2">
              <p className="text-sm text-green-500 font-semibold">✓ Esperando Repartidor</p>
            </div>
          )}

          {/* Fallback para uso con onAction genérico */}
          {!onAccept && !onReject && !onReady && onAction && order.status !== 'DELIVERED' && (
            <Button variant="secondary" onClick={() => onAction(order.id, 'ACCEPTED')}>
              Actualizar Estado
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
