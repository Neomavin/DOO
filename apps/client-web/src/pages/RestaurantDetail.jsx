import { useParams, useNavigate } from 'react-router-dom';
import { RESTAURANTS } from '../constants/mockData';
import './Restaurants.css';

function RestaurantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Encontrar el restaurante
    const restaurant = RESTAURANTS.find(r => r.id === parseInt(id));

    if (!restaurant) {
        return (
            <div className="restaurants-page">
                <div className="no-results-message">
                    <div className="no-results-icon">🏪</div>
                    <h3>Restaurante no encontrado</h3>
                    <p>El restaurante que buscas no existe</p>
                    <button
                        onClick={() => navigate('/restaurants')}
                        style={{ marginTop: '20px', padding: '12px 24px', background: '#fca311', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
                    >
                        Volver a Restaurantes
                    </button>
                </div>
            </div>
        );
    }

    // Mock menu del restaurante
    const menuItems = [
        { id: 1, name: 'Sopa de Mondongo', price: 120, description: 'Deliciosa sopa tradicional', image: '🍲', category: 'Sopas' },
        { id: 2, name: 'Sopa de Frijoles', price: 80, description: 'Sopa casera de frijoles', image: '🍲', category: 'Sopas' },
        { id: 3, name: 'Baleada Sencilla', price: 25, description: 'Tortilla con frijoles y queso', image: '🌮', category: 'Antojitos' },
        { id: 4, name: 'Baleada Especial', price: 45, description: 'Con huevo, aguacate y carne', image: '🌮', category: 'Antojitos' },
        { id: 5, name: 'Tamal de Elote', price: 35, description: 'Tamal dulce de elote', image: '🫔', category: 'Tamales' },
        { id: 6, name: 'Plato Típico', price: 120, description: 'Carne, frijoles, plátano y más', image: '🍽️', category: 'Platos' },
    ];

    return (
        <div className="restaurants-page">
            {/* Header */}
            <header className="modern-header">
                <div className="header-top">
                    <button className="icon-button logout-btn" onClick={() => navigate(-1)}>
                        ←
                    </button>
                    <h2 className="user-name" style={{ marginLeft: '16px' }}>{restaurant.name}</h2>
                </div>
            </header>

            <main className="main-content">
                {/* Restaurant Info */}
                <section style={{ marginBottom: '32px' }}>
                    <div className="modern-card" style={{ cursor: 'default' }}>
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
                </section>

                {/* Menu */}
                <section>
                    <div className="section-header">
                        <h3>Menú</h3>
                    </div>
                    <div className="dishes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                        {menuItems.map(item => (
                            <div
                                key={item.id}
                                className="dish-card"
                                style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                                onClick={() => navigate(`/product/${item.id}`)}
                            >
                                <div style={{ height: '100px', background: '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '8px' }}>
                                    {item.image}
                                </div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111827' }}>{item.name}</h4>
                                <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#6B7280', lineHeight: '1.4' }}>{item.description}</p>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#fca311' }}>L. {item.price}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default RestaurantDetail;
