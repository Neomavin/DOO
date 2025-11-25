import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { useCart } from '../hooks/useCart';
import { restaurantService } from '../services/api';
import { CATEGORIES, RESTAURANTS, POPULAR_DISHES } from '../constants/mockData';
import './Restaurants.css';

function Restaurants() {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const { itemCount } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [quantities, setQuantities] = useState({});

    // API state
    const [restaurants, setRestaurants] = useState([]);
    const [popularDishes, setPopularDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load data from API
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch restaurants
            let restaurantsData = [];
            try {
                restaurantsData = await restaurantService.getAll();
            } catch (err) {
                console.warn('API error, falling back to mock data:', err);
            }

            // Fallback to mock data if API is empty or failed
            if (!restaurantsData || restaurantsData.length === 0) {
                console.log('Using mock data for restaurants');
                setRestaurants(RESTAURANTS);
                setPopularDishes(POPULAR_DISHES);
                return;
            }

            setRestaurants(restaurantsData);

            // Extract popular dishes from all restaurants
            const allDishes = [];
            for (const restaurant of restaurantsData.slice(0, 3)) { // Get dishes from first 3 restaurants
                try {
                    const menu = await restaurantService.getMenu(restaurant.id);
                    menu.slice(0, 2).forEach(item => {
                        allDishes.push({
                            id: item.id,
                            name: item.name,
                            price: item.priceCents / 100,
                            restaurant: restaurant.name,
                            image: '🍽️', // Default emoji
                            quantity: item.quantity || 10
                        });
                    });
                } catch (err) {
                    console.error(`Error loading menu for ${restaurant.name}:`, err);
                }
            }

            // If we couldn't get dishes from API, use mock dishes
            if (allDishes.length === 0) {
                setPopularDishes(POPULAR_DISHES);
            } else {
                setPopularDishes(allDishes);
            }

        } catch (err) {
            console.error('CRITICAL Error loading data:', err);
            // Ultimate fallback
            setRestaurants(RESTAURANTS);
            setPopularDishes(POPULAR_DISHES);
        } finally {
            setLoading(false);
        }
    };

    // Lógica de filtrado - Case Insensitive
    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return CATEGORIES;
        const term = searchTerm.toLowerCase();
        return CATEGORIES.filter(cat => cat.name.toLowerCase().includes(term));
    }, [searchTerm]);

    const filteredDishes = useMemo(() => {
        if (!searchTerm.trim()) return popularDishes;
        const term = searchTerm.toLowerCase();
        return popularDishes.filter(dish =>
            dish.name.toLowerCase().includes(term) ||
            dish.restaurant.toLowerCase().includes(term)
        );
    }, [searchTerm, popularDishes]);

    const filteredRestaurants = useMemo(() => {
        if (!searchTerm.trim()) return restaurants;
        const term = searchTerm.toLowerCase();
        return restaurants.filter(restaurant =>
            restaurant.name.toLowerCase().includes(term) ||
            (restaurant.description && restaurant.description.toLowerCase().includes(term)) ||
            (restaurant.tags && restaurant.tags.some(tag => tag.toLowerCase().includes(term)))
        );
    }, [searchTerm, restaurants]);

    // Verificar si hay resultados
    const hasResults = filteredCategories.length > 0 || filteredDishes.length > 0 || filteredRestaurants.length > 0;

    // Generar sugerencias para búsqueda predictiva
    const suggestions = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.toLowerCase();
        const results = [];

        // Agregar categorías coincidentes
        filteredCategories.forEach(cat => {
            results.push({ type: 'category', icon: '🍽️', name: cat.name, id: cat.id });
        });

        // Agregar platillos coincidentes
        filteredDishes.slice(0, 3).forEach(dish => {
            results.push({ type: 'dish', icon: dish.image, name: dish.name, subtitle: dish.restaurant, id: dish.id });
        });

        // Agregar restaurantes coincidentes
        filteredRestaurants.slice(0, 2).forEach(restaurant => {
            results.push({ type: 'restaurant', icon: '🏪', name: restaurant.name, subtitle: restaurant.description, id: restaurant.id });
        });

        return results.slice(0, 8); // Máximo 8 sugerencias
    }, [searchTerm, filteredCategories, filteredDishes, filteredRestaurants]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.name);
        setShowSuggestions(false);

        // Navegar según el tipo
        if (suggestion.type === 'category') {
            navigate(`/category/${suggestion.id}`);
        } else if (suggestion.type === 'dish') {
            navigate(`/product/${suggestion.id}`);
        } else if (suggestion.type === 'restaurant') {
            navigate(`/restaurant/${suggestion.id}`);
        }
    };

    return (
        <div className="restaurants-page">
            {/* Header Moderno con Glassmorphism */}
            <header className="modern-header">
                <div className="header-top">
                    <div className="user-welcome">
                        <span className="welcome-text">Hola,</span>
                        <h2 className="user-name">{user?.name || 'Usuario'} 👋</h2>
                    </div>
                    <div className="header-actions">
                        <button onClick={() => navigate('/cart')} className="icon-button cart-btn">
                            🛒
                            {itemCount > 0 && <span className="badge">{itemCount}</span>}
                        </button>
                        <button onClick={handleLogout} className="icon-button logout-btn">
                            🚪
                        </button>
                    </div>
                </div>

                {/* Barra de Búsqueda */}
                <div className="search-container">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="¿Qué se te antoja hoy?"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                    </div>

                    {/* Sugerencias Predictivas */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="search-suggestions">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={`${suggestion.type}-${suggestion.id}-${index}`}
                                    className="suggestion-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    <span className="suggestion-icon">{suggestion.icon}</span>
                                    <div className="suggestion-text">
                                        <div className="suggestion-name">{suggestion.name}</div>
                                        {suggestion.subtitle && (
                                            <div className="suggestion-type">{suggestion.subtitle}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            <main className="main-content">
                {/* Loading State */}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                            <p>Cargando restaurantes...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <p style={{ color: '#ff3b30', marginBottom: '1rem' }}>{error}</p>
                        <button
                            onClick={loadData}
                            style={{ padding: '0.75rem 1.5rem', background: '#ffd700', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Mensaje de No Resultados */}
                {!loading && !error && !hasResults && searchTerm.trim() && (
                    <div className="no-results-message">
                        <div className="no-results-icon">🔍</div>
                        <h3>No se encontraron resultados</h3>
                        <p>Intenta buscar con otras palabras clave</p>
                    </div>
                )}

                {/* Categorías */}
                {filteredCategories.length > 0 && (
                    <section className="categories-section">
                        <div className="section-header">
                            <h3>Categorías</h3>
                            {!searchTerm.trim() && <span className="see-all">Ver todas</span>}
                        </div>
                        <div className="categories-list">
                            {filteredCategories.map(cat => (
                                <div
                                    key={cat.id}
                                    className="category-item"
                                    onClick={() => navigate(`/category/${cat.id}`)}
                                >
                                    <div className="category-icon">
                                        <img src={cat.image} alt={cat.name} />
                                    </div>
                                    <span>{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Platillos Populares */}
                {filteredDishes.length > 0 && (
                    <section className="popular-dishes-section" style={{ marginBottom: '32px' }}>
                        <div className="section-header">
                            <h3>Platillos Populares</h3>
                        </div>
                        <div className="dishes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                            {filteredDishes.map(dish => {
                                const quantity = quantities[dish.id] || 1;

                                const handleIncrement = (e) => {
                                    e.stopPropagation();
                                    setQuantities(prev => ({ ...prev, [dish.id]: quantity + 1 }));
                                };

                                const handleDecrement = (e) => {
                                    e.stopPropagation();
                                    setQuantities(prev => ({ ...prev, [dish.id]: Math.max(1, quantity - 1) }));
                                };

                                return (
                                    <div
                                        key={dish.id}
                                        className="dish-card"
                                        style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                                        onClick={() => navigate(`/product/${dish.id}`)}
                                    >
                                        <div style={{ height: '100px', background: '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '8px' }}>
                                            {dish.image}
                                        </div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111827' }}>{dish.name}</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>{dish.restaurant}</p>
                                        <p style={{ margin: '4px 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#fca311' }}>L. {dish.price}</p>

                                        {/* Quantity Selector */}
                                        <div
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '8px' }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={handleDecrement}
                                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                −
                                            </button>
                                            <span style={{ fontSize: '16px', fontWeight: '600', minWidth: '20px', textAlign: 'center', color: '#111827' }}>{quantity}</span>
                                            <button
                                                onClick={handleIncrement}
                                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fca311', background: '#fca311', color: 'white', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Restaurantes Populares */}
                {filteredRestaurants.length > 0 && (
                    <section className="restaurants-section">
                        <h3>Restaurantes Populares</h3>
                        <div className="restaurants-grid">
                            {filteredRestaurants.map(restaurant => (
                                <div
                                    key={restaurant.id}
                                    className="modern-card"
                                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                                >
                                    <div className="card-image">
                                        <img src={restaurant.image} alt={restaurant.name} />
                                        <span className="rating-badge">⭐ {restaurant.rating}</span>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-header">
                                            <h4>{restaurant.name}</h4>
                                            <span className="delivery-time">{restaurant.time}</span>
                                        </div>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            📍 {restaurant.location}
                                        </p>
                                        <p className="card-desc">{restaurant.description}</p>
                                        <div className="card-tags">
                                            {restaurant.tags.map(tag => (
                                                <span key={tag} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default Restaurants;
