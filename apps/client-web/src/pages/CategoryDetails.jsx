import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants/mockData';
import './Restaurants.css'; // Reusing styles

function CategoryDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Encontrar la categoría actual
    const category = CATEGORIES.find(cat => cat.id === parseInt(id));
    const categoryName = category?.name || 'Categoría';

    // Mock Data por categoría
    const allDishes = {
        1: [ // Sopas
            { id: 101, name: 'Sopa de Mondongo', price: 120, restaurant: 'Comedor La Abuela', image: '🍲', category: 1 },
            { id: 105, name: 'Sopa de Frijoles', price: 80, restaurant: 'Comedor La Abuela', image: '🍲', category: 1 },
            { id: 106, name: 'Tapado Olanchano', price: 150, restaurant: 'Restaurante El Típico', image: '🍲', category: 1 },
            { id: 107, name: 'Sopa de Caracol', price: 180, restaurant: 'Restaurante El Típico', image: '🍲', category: 1 },
        ],
        2: [ // Tamales
            { id: 201, name: 'Tamal de Elote', price: 35, restaurant: 'Comedor La Abuela', image: '🫔', category: 2 },
            { id: 202, name: 'Tamal de Pollo', price: 40, restaurant: 'Comedor La Abuela', image: '🫔', category: 2 },
            { id: 203, name: 'Tamal Pisque', price: 45, restaurant: 'Antojitos Catrachos', image: '🫔', category: 2 },
            { id: 204, name: 'Montuca', price: 50, restaurant: 'Antojitos Catrachos', image: '🫔', category: 2 },
        ],
        3: [ // Antojitos
            { id: 301, name: 'Baleada Sencilla', price: 25, restaurant: 'Antojitos Catrachos', image: '🌮', category: 3 },
            { id: 302, name: 'Baleada Especial', price: 45, restaurant: 'Antojitos Catrachos', image: '🌮', category: 3 },
            { id: 303, name: 'Pupusa de Queso', price: 30, restaurant: 'Antojitos Catrachos', image: '🫓', category: 3 },
            { id: 304, name: 'Catrachitas', price: 35, restaurant: 'Antojitos Catrachos', image: '🌮', category: 3 },
        ],
        4: [ // Platos Típicos
            { id: 401, name: 'Plato Típico', price: 120, restaurant: 'Restaurante El Típico', image: '🍽️', category: 4 },
            { id: 402, name: 'Carne Asada', price: 150, restaurant: 'Restaurante El Típico', image: '🥩', category: 4 },
            { id: 403, name: 'Pollo Chuco', price: 100, restaurant: 'Restaurante El Típico', image: '🍗', category: 4 },
        ],
        5: [ // Panadería
            { id: 501, name: 'Semita de Yema', price: 15, restaurant: 'Panadería El Buen Gusto', image: '🥐', category: 5 },
            { id: 502, name: 'Pan de Coco', price: 12, restaurant: 'Panadería El Buen Gusto', image: '🥖', category: 5 },
            { id: 503, name: 'Rosquillas', price: 20, restaurant: 'Panadería El Buen Gusto', image: '🍩', category: 5 },
        ],
        6: [ // Bebidas
            { id: 601, name: 'Horchata', price: 25, restaurant: 'Comedor La Abuela', image: '🥤', category: 6 },
            { id: 602, name: 'Fresco de Tamarindo', price: 20, restaurant: 'Comedor La Abuela', image: '🥤', category: 6 },
            { id: 603, name: 'Café Hondureño', price: 15, restaurant: 'Panadería El Buen Gusto', image: '☕', category: 6 },
        ],
    };

    // Obtener platillos de la categoría actual
    const dishes = allDishes[id] || [];

    return (
        <div className="restaurants-page">
            <header className="modern-header">
                <div className="header-top">
                    <button className="icon-button" onClick={() => navigate(-1)}>
                        ←
                    </button>
                    <h2 className="user-name" style={{ marginLeft: '16px' }}>{categoryName}</h2>
                </div>
            </header>

            <main className="main-content">
                {dishes.length > 0 ? (
                    <section className="popular-dishes-section">
                        <div className="dishes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                            {dishes.map(dish => (
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
                                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#fca311' }}>L. {dish.price}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    <div className="no-results-message">
                        <div className="no-results-icon">🍽️</div>
                        <h3>No hay platillos disponibles</h3>
                        <p>Aún no tenemos platillos en esta categoría</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default CategoryDetails;
