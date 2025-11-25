import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { orderService } from '../services/api';
import websocketService from '../services/websocket';
import OrderTracking from './OrderTracking';
import './OrderConfirmation.css';

const STATUS_STEPS = [
    { key: 'NEW', title: 'Pedido recibido', description: 'Estamos confirmando tu orden', icon: '🔔' },
    { key: 'ACCEPTED', title: 'Confirmado', description: 'El restaurante aceptó la orden', icon: '👨‍🍳' },
    { key: 'PREPARING', title: 'Preparando', description: 'Tu comida se está preparando', icon: '🍳' },
    { key: 'READY', title: 'Listo para recoger', description: 'Buscando repartidor disponible', icon: '✅' },
    { key: 'PICKED_UP', title: 'En camino', description: 'El repartidor ya lleva tu pedido', icon: '🏍️' },
    { key: 'ON_ROUTE', title: 'En ruta', description: 'Falta poco para llegar', icon: '🚚' },
    { key: 'DELIVERED', title: 'Entregado', description: '¡Disfruta tu comida!', icon: '🎉' },
];

const PAYMENT_LABELS = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
};

const formatCurrency = (valueCents = 0) => 'L. ' + (valueCents / 100).toFixed(2);

function OrderConfirmation() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const fetchOrder = async () => {
            try {
                setLoading(true);
                const data = await orderService.getById(orderId);
                if (!cancelled) {
                    setOrder(data);
                    setError('');
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'No pudimos cargar los datos del pedido');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchOrder();
        websocketService.connect();

        const handleStatusChange = ({ orderId: updatedId, status, order: updatedOrder }) => {
            if (updatedId !== orderId) return;
            setOrder((prev) => updatedOrder || (prev ? { ...prev, status } : prev));
        };

        websocketService.onOrderStatusChange(handleStatusChange);

        return () => {
            cancelled = true;
            websocketService.off('orderStatusChange', handleStatusChange);
        };
    }, [orderId]);

    const totals = useMemo(() => {
        if (!order) {
            return { itemsTotal: 0, delivery: 0, tax: 0, total: 0 };
        }
        const itemsTotal = (order.items || []).reduce((sum, item) => {
            const priceCents = item.priceCents ?? Math.round((item.price ?? 0) * 100);
            const qty = item.quantity ?? 1;
            return sum + priceCents * qty;
        }, 0);
        const delivery = order.deliveryCents ?? 0;
        const tax = order.taxCents ?? 0;
        const total = order.totalCents ?? itemsTotal + delivery + tax;
        return { itemsTotal, delivery, tax, total };
    }, [order]);

    const activeStepIndex = useMemo(() => {
        if (!order) return 0;
        const index = STATUS_STEPS.findIndex((step) => step.key === order.status);
        if (index === -1) return 0;
        return index;
    }, [order]);

    const currentStep = STATUS_STEPS[activeStepIndex] || STATUS_STEPS[0];
    const isCancelled = order.status === 'CANCELLED';
    const heroIcon = isCancelled ? '❌' : currentStep.icon;
    const heroTitle = isCancelled ? 'Pedido cancelado' : currentStep.title;
    const heroDescription = isCancelled
        ? order.cancelReason || 'El restaurante canceló este pedido'
        : currentStep.description;

    if (loading) {
        return (
            <div className="order-confirmation-page">
                <div className="loading-container">
                    <div className="loading-spinner" />
                    <p>Cargando pedido...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-confirmation-page">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h2>Algo salió mal</h2>
                    <p>{error || 'No encontramos esta orden'}</p>
                    <button className="back-home-btn" onClick={() => navigate('/restaurants')}>
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-confirmation-page">
            <header className="confirmation-header">
                <button className="back-btn" onClick={() => navigate('/orders')}>
                    ←
                </button>
                <h1>Estado del pedido</h1>
            </header>

            <div className="confirmation-content">
                {/* Estado principal */}
                <div className="status-hero">
                    <div className="status-icon">{heroIcon}</div>
                    <p className="status-label">Pedido #{order.id?.slice(0, 8)?.toUpperCase()}</p>
                    <h2>{heroTitle}</h2>
                    <p>{heroDescription}</p>

                    {/* Progress Bar */}
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${(activeStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Real-Time Map Tracking */}
                <OrderTracking order={order} />

                {/* Línea de tiempo */}
                {!isCancelled && (
                    <div className="timeline-card">
                        <h3>Seguimiento</h3>
                        <div className="timeline">
                            {STATUS_STEPS.map((step, index) => (
                                <div key={step.key} className={'timeline-item ' + (index <= activeStepIndex ? 'completed' : '')}>
                                    <div className="timeline-dot" />
                                    <div className="timeline-content">
                                        <div className="timeline-title">{step.title}</div>
                                        <div className="timeline-desc">{step.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resumen */}
                <div className="order-info-card">
                    <div className="info-row">
                        <span className="info-label">Restaurante</span>
                        <span className="info-value">{order.restaurant?.name || 'Restaurante'}</span>
                    </div>
                    {order.createdAt && (
                        <div className="info-row">
                            <span className="info-label">Fecha</span>
                            <span className="info-value">{new Date(order.createdAt).toLocaleString('es-HN')}</span>
                        </div>
                    )}
                    <div className="info-row">
                        <span className="info-label">Pago</span>
                        <span className="info-value">{PAYMENT_LABELS[order.paymentMethod] || 'N/A'}</span>
                    </div>
                    {order.notes && (
                        <div className="info-row">
                            <span className="info-label">Notas</span>
                            <span className="info-value">{order.notes}</span>
                        </div>
                    )}
                </div>

                {/* Productos */}
                <div className="order-items-card">
                    <h3>Detalle de productos</h3>
                    <div className="items-list">
                        {order.items?.map((item, index) => (
                            <div key={index} className="item-row">
                                <div>
                                    <p className="item-name">
                                        {item.quantity}x {item.menuItem?.name || item.name || 'Producto'}
                                    </p>
                                    {item.menuItem?.description && (
                                        <p className="item-note">{item.menuItem.description}</p>
                                    )}
                                </div>
                                <span className="item-price">
                                    {formatCurrency((item.priceCents ?? Math.round((item.price ?? 0) * 100)) * (item.quantity ?? 1))}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="order-total breakdown">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(totals.itemsTotal)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Impuestos</span>
                            <span>{formatCurrency(totals.tax)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Entrega</span>
                            <span>{formatCurrency(totals.delivery)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{formatCurrency(totals.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Dirección */}
                {order.address && (
                    <div className="address-card">
                        <h3>📍 Dirección de entrega</h3>
                        <p>{order.address.line1}</p>
                        {order.address.line2 && <p>{order.address.line2}</p>}
                        <p>
                            {order.address.city}, {order.address.state}
                        </p>
                        {order.address.instructions && (
                            <p className="address-instructions">💡 {order.address.instructions}</p>
                        )}
                    </div>
                )}

                {isCancelled && order.cancelReason && (
                    <div className="cancel-reason-card">
                        <h3>Motivo de cancelación</h3>
                        <p>{order.cancelReason}</p>
                    </div>
                )}

                {/* Acciones */}
                <div className="action-buttons">
                    <button className="view-history-btn" onClick={() => navigate('/orders')}>
                        Ver historial
                    </button>
                    <button className="order-again-btn" onClick={() => navigate('/restaurants')}>
                        Seguir explorando
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderConfirmation;
