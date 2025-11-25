import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { addressService, orderService } from '../services/api';
import './Checkout.css';

const DELIVERY_FEE = 30;
const TAX_RATE = 0.15;

const PAYMENT_METHODS = [
    { id: 'CASH', title: 'Efectivo', description: 'Paga directamente al repartidor', icon: '💵' },
    { id: 'CARD', title: 'Tarjeta', description: 'Usaremos tu tarjeta guardada', icon: '💳' },
    { id: 'TRANSFER', title: 'Transferencia', description: 'Envía el comprobante por WhatsApp', icon: '🏦' },
];

const INITIAL_ADDRESS = {
    line1: '',
    line2: '',
    city: 'Ocotepeque',
    state: 'Ocotepeque',
    zipCode: '',
    country: 'Honduras',
    instructions: '',
};

function Checkout() {
    const navigate = useNavigate();
    const { items, total, restaurant, clearCart } = useCart();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState(INITIAL_ADDRESS);
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);
    const [notes, setNotes] = useState('');
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [savingAddress, setSavingAddress] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const subtotal = total;
    const tax = useMemo(() => Number((subtotal * TAX_RATE).toFixed(2)), [subtotal]);
    const finalTotal = useMemo(() => subtotal + DELIVERY_FEE + tax, [subtotal, tax]);

    const loadAddresses = async () => {
        try {
            setLoadingAddresses(true);
            const data = await addressService.getAll();
            setAddresses(data);
            if (data.length > 0) {
                setSelectedAddressId(data[0].id);
            } else {
                setShowAddressForm(true);
            }
        } catch (err) {
            console.error('Error cargando direcciones:', err);
            setError(err.message || 'No pudimos cargar tus direcciones');
            setShowAddressForm(true);
        } finally {
            setLoadingAddresses(false);
        }
    };

    useEffect(() => {
        if (items.length === 0) {
            setLoadingAddresses(false);
            return;
        }
        loadAddresses();
    }, [items.length]);

    const handleAddressFormChange = (event) => {
        const { name, value } = event.target;
        setAddressForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async (event) => {
        event.preventDefault();
        try {
            setSavingAddress(true);
            setError('');
            const saved = await addressService.create(addressForm);
            setAddresses((prev) => [...prev, saved]);
            setSelectedAddressId(saved.id);
            setShowAddressForm(false);
            setAddressForm(INITIAL_ADDRESS);
        } catch (err) {
            setError(err.message || 'No pudimos guardar la dirección');
        } finally {
            setSavingAddress(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!restaurant) {
            setError('Tu carrito no tiene un restaurante asociado');
            return;
        }
        if (!selectedAddressId) {
            setError('Selecciona o crea una dirección para continuar');
            return;
        }
        if (items.length === 0) {
            return;
        }

        // Mostrar modal de confirmación (sin procesar pago hasta tener pasarelas)
        setShowSuccessModal(true);

        // TODO: Cuando tengan pasarelas de pago, descomentar el código abajo
        /*
        try {
            setSubmitting(true);
            setError('');
            const orderPayload = {
                restaurantId: restaurant.id,
                addressId: selectedAddressId,
                paymentMethod,
                notes: notes || undefined,
                items: items.map((item) => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                    priceCents: Math.round(item.price * 100),
                })),
                subtotalCents: Math.round(subtotal * 100),
                taxCents: Math.round(tax * 100),
                deliveryCents: Math.round(DELIVERY_FEE * 100),
                totalCents: Math.round(finalTotal * 100),
            };

            const order = await orderService.create(orderPayload);
            clearCart();
            navigate(`/order-confirmation/${order.id}`);
        } catch (err) {
            setError(err.message || 'No pudimos confirmar tu pedido');
        } finally {
            setSubmitting(false);
        }
        */
    };

    if (items.length === 0) {
        return (
            <div className="checkout-page">
                <header className="checkout-header">
                    <button className="back-btn" onClick={() => navigate('/restaurants')}>
                        ←
                    </button>
                    <h1>Checkout</h1>
                </header>
                <div className="empty-checkout">
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
        <div className="checkout-page">
            <header className="checkout-header">
                <button className="back-btn" onClick={() => navigate('/cart')}>
                    ←
                </button>
                <h1>Finalizar Pedido</h1>
            </header>

            <div className="checkout-content">
                {error && <div className="error-message">⚠️ {error}</div>}

                {/* Dirección */}
                <section className="checkout-section">
                    <div className="section-header">
                        <h2>📍 Dirección de entrega</h2>
                        {!showAddressForm && addresses.length > 0 && (
                            <button className="link-btn" onClick={() => setShowAddressForm(true)}>
                                + Nueva dirección
                            </button>
                        )}
                    </div>

                    {loadingAddresses ? (
                        <div className="loading-addresses">Cargando direcciones...</div>
                    ) : addresses.length > 0 && !showAddressForm ? (
                        <div className="addresses-list">
                            {addresses.map((address) => (
                                <label key={address.id} className="address-card">
                                    <input
                                        type="radio"
                                        name="address"
                                        value={address.id}
                                        checked={selectedAddressId === address.id}
                                        onChange={() => setSelectedAddressId(address.id)}
                                    />
                                    <div className="address-details">
                                        <div className="address-line">{address.line1}</div>
                                        {address.line2 && <div className="address-line">{address.line2}</div>}
                                        <div className="address-city">
                                            {address.city}, {address.state}
                                        </div>
                                        {address.instructions && (
                                            <div className="address-instructions">💡 {address.instructions}</div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <form className="address-form" onSubmit={handleSaveAddress}>
                            <h3>Guardar nueva dirección</h3>
                            <div className="form-grid">
                                <input
                                    name="line1"
                                    placeholder="Dirección (calle, número, referencia)"
                                    value={addressForm.line1}
                                    onChange={handleAddressFormChange}
                                    required
                                />
                                <input
                                    name="line2"
                                    placeholder="Datos adicionales (opcional)"
                                    value={addressForm.line2}
                                    onChange={handleAddressFormChange}
                                />
                                <input
                                    name="city"
                                    placeholder="Ciudad"
                                    value={addressForm.city}
                                    onChange={handleAddressFormChange}
                                    required
                                />
                                <input
                                    name="state"
                                    placeholder="Departamento"
                                    value={addressForm.state}
                                    onChange={handleAddressFormChange}
                                    required
                                />
                                <input
                                    name="zipCode"
                                    placeholder="Código postal"
                                    value={addressForm.zipCode}
                                    onChange={handleAddressFormChange}
                                />
                                <input
                                    name="country"
                                    placeholder="País"
                                    value={addressForm.country}
                                    onChange={handleAddressFormChange}
                                    required
                                />
                            </div>
                            <textarea
                                name="instructions"
                                placeholder="Instrucciones para el repartidor"
                                value={addressForm.instructions}
                                onChange={handleAddressFormChange}
                                rows={3}
                            />
                            <div className="form-actions">
                                {addresses.length > 0 && (
                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() => {
                                            setShowAddressForm(false);
                                            setAddressForm(INITIAL_ADDRESS);
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                )}
                                <button type="submit" className="primary-btn" disabled={savingAddress}>
                                    {savingAddress ? 'Guardando...' : 'Guardar dirección'}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {/* Pago */}
                <section className="checkout-section">
                    <h2>💳 Método de pago</h2>
                    <div className="payment-grid">
                        {PAYMENT_METHODS.map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                className={`payment-card ${paymentMethod === method.id ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod(method.id)}
                            >
                                <span className="payment-icon">{method.icon}</span>
                                <div>
                                    <p className="payment-title">{method.title}</p>
                                    <p className="payment-description">{method.description}</p>
                                </div>
                                {paymentMethod === method.id && <span className="checkmark">✓</span>}
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="notes-input"
                        placeholder="Notas para el restaurante (opcional)"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={2}
                    />
                </section>

                {/* Resumen */}
                <section className="checkout-section">
                    <h2>🧾 Resumen</h2>
                    <div className="summary-card">
                        <div className="summary-items">
                            {items.map((item) => (
                                <div key={item.id} className="summary-item-row">
                                    <div>
                                        <p className="item-title">
                                            {item.quantity}x {item.name}
                                        </p>
                                        <p className="item-note">{restaurant?.name || 'Restaurante'}</p>
                                    </div>
                                    <span>L. {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>L. {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Impuestos</span>
                            <span>L. {tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Entrega</span>
                            <span>L. {DELIVERY_FEE.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total a pagar</span>
                            <span>L. {finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <button
                        className="checkout-btn"
                        onClick={handleConfirmOrder}
                        disabled={submitting || loadingAddresses}
                    >
                        Proceder al Pedido
                    </button>
                </section>
            </div>

            {/* Modal de confirmación */}
            {showSuccessModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowSuccessModal(false);
                    clearCart();
                    navigate('/restaurants');
                }}>
                    <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon">🎉</div>
                        <h2>¡Pedido Confirmado!</h2>
                        <p className="modal-message">Podrás pagar cuando se te entregue tu pedido</p>
                        <p className="modal-wish">¡Buen provecho! 🍽️</p>
                        <button
                            className="modal-btn"
                            onClick={() => {
                                setShowSuccessModal(false);
                                clearCart();
                                navigate('/restaurants');
                            }}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Checkout;
