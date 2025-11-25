import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import './OrderHistory.css';

function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getMyOrders();
            setOrders(data);
        } catch (err) {
            setError(err.message || 'Error al cargar los pedidos');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            NEW: { label: 'Nuevo', color: '#ffd700', icon: '🔔' },
            ACCEPTED: { label: 'Aceptado', color: '#4CAF50', icon: '✅' },
            PREPARING: { label: 'Preparando', color: '#FF9800', icon: '🍳' },
            READY: { label: 'Listo', color: '#2196F3', icon: '✓' },
            PICKED_UP: { label: 'Recogido', color: '#9C27B0', icon: '🏍️' },
            ON_ROUTE: { label: 'En Ruta', color: '#673AB7', icon: '🚚' },
            DELIVERED: { label: 'Entregado', color: '#4CAF50', icon: '🎉' },
            CANCELLED: { label: 'Cancelado', color: '#F44336', icon: '❌' }
        };

        return statusMap[status] || statusMap.NEW;
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'ALL') return true;
        if (filter === 'ACTIVE') {
            return ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'ON_ROUTE'].includes(order.status);
        }
        if (filter === 'COMPLETED') {
            return order.status === 'DELIVERED';
        }
        if (filter === 'CANCELLED') {
            return order.status === 'CANCELLED';
        }
        return true;
    });

    if (loading) {
        return (
            <div className="order-history-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-history-page">
            <header className="history-header">
                <button className="back-btn" onClick={() => navigate('/restaurants')}>
                    ←
                </button>
                <h1>Mis Pedidos</h1>
            </header>

            <div className="history-content">
                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                {/* Filters */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilter('ALL')}
                    >
                        Todos
                    </button>
                    <button
                        className={`filter-tab ${filter === 'ACTIVE' ? 'active' : ''}`}
                        onClick={() => setFilter('ACTIVE')}
                    >
                        Activos
                    </button>
                    <button
                        className={`filter-tab ${filter === 'COMPLETED' ? 'active' : ''}`}
                        onClick={() => setFilter('COMPLETED')}
                    >
                        Completados
                    </button>
                    <button
                        className={`filter-tab ${filter === 'CANCELLED' ? 'active' : ''}`}
                        onClick={() => setFilter('CANCELLED')}
                    >
                        Cancelados
                    </button>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-icon">📦</div>
                        <h2>No hay pedidos</h2>
                        <p>
                            {filter === 'ALL'
                                ? 'Aún no has realizado ningún pedido'
                                : `No tienes pedidos ${filter === 'ACTIVE' ? 'activos' : filter === 'COMPLETED' ? 'completados' : 'cancelados'}`
                            }
                        </p>
                        <button
                            className="browse-btn"
                            onClick={() => navigate('/restaurants')}
                        >
                            Explorar Restaurantes
                        </button>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {filteredOrders.map(order => {
                            const statusInfo = getStatusBadge(order.status);

                            return (
                                <div
                                    key={order.id}
                                    className="order-card"
                                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                                >
                                    <div className="order-card-header">
                                        <div className="order-number">
                                            Pedido #{order.id.slice(0, 8).toUpperCase()}
                                        </div>
                                        <div
                                            className="status-badge"
                                            style={{
                                                backgroundColor: `${statusInfo.color}20`,
                                                color: statusInfo.color,
                                                borderColor: statusInfo.color
                                            }}
                                        >
                                            {statusInfo.icon} {statusInfo.label}
                                        </div>
                                    </div>

                                    {order.restaurant && (
                                        <div className="order-restaurant">
                                            <strong>{order.restaurant.name}</strong>
                                        </div>
                                    )}

                                    <div className="order-date">
                                        {new Date(order.createdAt).toLocaleDateString('es-HN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>

                                    {order.items && order.items.length > 0 && (
                                        <div className="order-items-preview">
                                            {order.items.slice(0, 2).map((item, index) => (
                                                <div key={index} className="item-preview">
                                                    {item.quantity}x {item.menuItem?.name || 'Producto'}
                                                </div>
                                            ))}
                                            {order.items.length > 2 && (
                                                <div className="more-items">
                                                    +{order.items.length - 2} más
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="order-card-footer">
                                        <div className="order-total">
                                            Total: <strong>L. {(order.totalCents / 100).toFixed(2)}</strong>
                                        </div>
                                        <div className="view-details">
                                            Ver detalles →
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderHistory;
