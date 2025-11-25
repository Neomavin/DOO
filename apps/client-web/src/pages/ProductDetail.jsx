import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store';
import './ProductDetail.css';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const addItem = useCartStore(state => state.addItem);

    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('normal');
    const [extras, setExtras] = useState({
        extraQueso: false,
        sinChile: false,
        aguacate: false
    });

    // Mock Data (En una app real, esto vendría de una API usando el ID)
    const product = {
        id: parseInt(id),
        name: id === '101' ? 'Sopa de Mondongo' :
            id === '102' ? 'Baleada Sencilla' :
                id === '103' ? 'Nacatamal' :
                    id === '104' ? 'Semita de Yema' : 'Producto',
        description: id === '101' ? 'Deliciosa sopa tradicional hondureña preparada con mondongo (panza de res), verduras frescas y especias. Incluye yuca, plátano verde, zanahoria, repollo y cilantro.' :
            id === '102' ? 'Tortilla de harina rellena con frijoles refritos, queso, crema y mantequilla. Un clásico de la comida hondureña.' :
                id === '103' ? 'Tamal hondureño hecho con masa de maíz, relleno de carne de cerdo, arroz, garbanzos y vegetales, envuelto en hoja de plátano.' :
                    'Pan dulce tradicional con yema de huevo, suave y esponjoso, perfecto para acompañar con café.',
        ingredients: id === '101' ? 'Mondongo, yuca, plátano verde, zanahoria, repollo, cilantro, especias' :
            id === '102' ? 'Tortilla de harina, frijoles, queso, crema, mantequilla' :
                id === '103' ? 'Masa de maíz, carne de cerdo, arroz, garbanzos, papa, zanahoria' :
                    'Harina, huevos, azúcar, mantequilla, levadura',
        price: id === '101' ? 120 : id === '102' ? 25 : id === '103' ? 40 : 15,
        image: id === '101' ? '🍲' : id === '102' ? '🌮' : id === '103' ? '🫔' : '🥐',
        restaurantId: 1,
        restaurantName: id === '102' ? 'Antojitos Catrachos' : id === '104' ? 'Panadería El Buen Gusto' : 'Comedor La Abuela',
        restaurantHours: id === '102' ? 'Lun-Dom: 7:00 AM - 10:00 PM' : id === '104' ? 'Lun-Sáb: 6:00 AM - 8:00 PM' : 'Lun-Sáb: 8:00 AM - 6:00 PM',
        rating: id === '101' ? 4.8 : id === '102' ? 4.5 : id === '103' ? 4.9 : 4.7,
        reviewCount: id === '101' ? 124 : id === '102' ? 89 : id === '103' ? 156 : 67,
        prepTime: id === '101' ? '25-30 min' : id === '102' ? '10-15 min' : id === '103' ? '15-20 min' : '5-10 min',
        deliveryTime: '20-30 min'
    };

    const handleToggleExtra = (extraName) => {
        setExtras(prev => ({
            ...prev,
            [extraName]: !prev[extraName]
        }));
    };

    const calculateTotal = () => {
        let total = product.price * quantity;

        // Agregar costo de extras
        if (extras.extraQueso) total += 10 * quantity;
        if (extras.aguacate) total += 15 * quantity;

        // Ajustar por tamaño
        if (selectedSize === 'grande') total *= 1.5;

        return Math.round(total);
    };

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: calculateTotal(),
            quantity: quantity,
            restaurantId: product.restaurantId,
            options: {
                size: selectedSize,
                extras: extras
            }
        });
        navigate('/cart');
    };

    return (
        <div className="product-detail-page">
            <button className="back-button" onClick={() => navigate(-1)}>
                ← Regresar
            </button>

            {/* Hero Image */}
            <div className="product-hero">
                <div className="product-emoji-large">{product.image}</div>
                <div className="rating-badge-detail">
                    ⭐ {product.rating}
                </div>
            </div>

            <div className="product-info-container">
                {/* Header */}
                <div className="product-header">
                    <h1>{product.name}</h1>
                    <span className="product-price">L. {product.price}</span>
                </div>

                {/* Description */}
                <div className="product-description-section">
                    <h3>Descripción</h3>
                    <p className="product-description">{product.description}</p>
                    <p className="product-ingredients"><strong>Ingredientes:</strong> {product.ingredients}</p>
                </div>

                {/* Restaurant Info */}
                <div className="restaurant-info-section">
                    <div className="restaurant-link" onClick={() => navigate(`/restaurant/${product.restaurantId}`)}>
                        <div className="restaurant-badge">
                            <span className="store-icon">🏪</span>
                            <div>
                                <span className="sold-by">Vendido por:</span>
                                <span className="store-name">{product.restaurantName}</span>
                            </div>
                            <span className="chevron">›</span>
                        </div>
                    </div>
                    <div className="business-hours">
                        <span className="hours-icon">🕒</span>
                        <span>{product.restaurantHours}</span>
                    </div>
                </div>

                {/* Ratings & Time */}
                <div className="product-meta">
                    <div className="meta-item">
                        <span className="meta-icon">⭐</span>
                        <div>
                            <span className="meta-value">{product.rating}</span>
                            <label>{product.reviewCount} reseñas</label>
                        </div>
                    </div>
                    <div className="meta-item">
                        <span className="meta-icon">👨‍🍳</span>
                        <div>
                            <span className="meta-value">{product.prepTime}</span>
                            <label>Preparación</label>
                        </div>
                    </div>
                    <div className="meta-item">
                        <span className="meta-icon">🚴</span>
                        <div>
                            <span className="meta-value">{product.deliveryTime}</span>
                            <label>Entrega</label>
                        </div>
                    </div>
                </div>

                {/* Size Options (if applicable) */}
                {(id === '101' || id === '102') && (
                    <div className="options-section">
                        <h3>Tamaño</h3>
                        <div className="size-options">
                            <button
                                className={`size-option ${selectedSize === 'normal' ? 'active' : ''}`}
                                onClick={() => setSelectedSize('normal')}
                            >
                                <span>Normal</span>
                                <span className="size-price">L. {product.price}</span>
                            </button>
                            <button
                                className={`size-option ${selectedSize === 'grande' ? 'active' : ''}`}
                                onClick={() => setSelectedSize('grande')}
                            >
                                <span>Grande</span>
                                <span className="size-price">L. {Math.round(product.price * 1.5)}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Extras (if applicable) */}
                {id === '102' && (
                    <div className="options-section">
                        <h3>Extras</h3>
                        <div className="extras-list">
                            <label className="extra-item">
                                <input
                                    type="checkbox"
                                    checked={extras.extraQueso}
                                    onChange={() => handleToggleExtra('extraQueso')}
                                />
                                <span>Extra queso</span>
                                <span className="extra-price">+L. 10</span>
                            </label>
                            <label className="extra-item">
                                <input
                                    type="checkbox"
                                    checked={extras.aguacate}
                                    onChange={() => handleToggleExtra('aguacate')}
                                />
                                <span>Aguacate</span>
                                <span className="extra-price">+L. 15</span>
                            </label>
                            <label className="extra-item">
                                <input
                                    type="checkbox"
                                    checked={extras.sinChile}
                                    onChange={() => handleToggleExtra('sinChile')}
                                />
                                <span>Sin chile</span>
                                <span className="extra-price">Gratis</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Quantity Selector */}
                <div className="quantity-section">
                    <h3>Cantidad</h3>
                    <div className="quantity-selector">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="quantity-btn"
                        >
                            −
                        </button>
                        <span className="quantity-display">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="quantity-btn"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    Agregar al Pedido - L. {calculateTotal()}
                </button>
            </div>
        </div>
    );
}

export default ProductDetail;
