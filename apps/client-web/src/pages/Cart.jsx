import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import './Cart.css';

function Cart() {
    const navigate = useNavigate();
    const { items, total, incrementItem, decrementItem, removeItem, clearCart } = useCart();

    const DELIVERY_FEE = 30;
    const subtotal = total;
    const finalTotal = subtotal + DELIVERY_FEE;

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (items.length === 0) {
        return (
            <div className="cart-page">
                <header className="cart-header">
                    <button className="back-btn" onClick={() => navigate('/restaurants')}>
                        ←
                    </button>
                    <h1>Mi Carrito</h1>
                </header>

                <div className="empty-cart">
                    <div className="empty-icon">🛒</div>
                    <h2>Tu carrito está vacío</h2>
                    <p>Agrega productos para continuar</p>
                    <button className="browse-btn" onClick={() => navigate('/restaurants')}>
                        Ver Restaurantes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <header className="cart-header">
                <button className="back-btn" onClick={() => navigate('/restaurants')}>
                    ←
                </button>
                <h1>Mi Carrito</h1>
                <button className="clear-btn" onClick={clearCart}>
                    🗑️
                </button>
            </header>

            <div className="cart-content">
                <div className="cart-items">
                    {items.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="item-image">
                                📦
                            </div>
                            <div className="item-details">
                                <h3>{item.name}</h3>
                                <p className="item-restaurant">{item.restaurant || 'Restaurante'}</p>
                                <p className="item-price">L. {item.price}</p>
                            </div>
                            <div className="item-actions">
                                <div className="quantity-controls">
                                    <button
                                        className="qty-btn"
                                        onClick={() => decrementItem(item.id)}
                                    >
                                        −
                                    </button>
                                    <span className="qty-display">{item.quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => incrementItem(item.id)}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeItem(item.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h2>Resumen del Pedido</h2>

                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>L. {subtotal.toFixed(2)}</span>
                    </div>

                    <div className="summary-row">
                        <span>Envío</span>
                        <span>L. {DELIVERY_FEE.toFixed(2)}</span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-row total-row">
                        <span>Total</span>
                        <span>L. {finalTotal.toFixed(2)}</span>
                    </div>

                    <button className="checkout-btn" onClick={handleCheckout}>
                        Proceder al Pago
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Cart;
