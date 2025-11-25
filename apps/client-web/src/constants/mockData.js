// Categorías de comida hondureña
export const CATEGORIES = [
    { id: 1, name: 'Sopas', image: '/assets/categories/sopas.png' },
    { id: 2, name: 'Tamales', image: '/assets/categories/tamales.png' },
    { id: 3, name: 'Antojitos', image: '/assets/categories/antojitos.png' },
    { id: 4, name: 'Platos Típicos', image: '/assets/categories/platos-tipicos.png' },
    { id: 5, name: 'Panadería', image: '/assets/categories/panaderia.png' },
    { id: 6, name: 'Bebidas', image: '/assets/categories/bebidas.png' },
    { id: 7, name: 'Asados', image: '/assets/categories/asados.png' },
    { id: 8, name: 'Desayunos', image: '/assets/categories/desayunos.png' },
    { id: 9, name: 'Cafeterías', image: '/assets/categories/cafeterias.png' },
    { id: 10, name: 'Bebidas Alcohólicas', image: '/assets/categories/bebidas-alcoholicas.png' },
];

// Cervezas disponibles en Honduras
export const CERVEZAS_HONDURAS = [
    { id: 201, name: 'Salva Vida', price: 35, brand: 'Cervecería Hondureña', image: '🍺', quantity: 50 },
    { id: 202, name: 'Port Royal', price: 30, brand: 'Cervecería Hondureña', image: '🍺', quantity: 45 },
    { id: 203, name: 'Imperial', price: 32, brand: 'Cervecería Hondureña', image: '🍺', quantity: 40 },
    { id: 204, name: 'Barena', price: 28, brand: 'Cervecería Hondureña', image: '🍺', quantity: 35 },
    { id: 205, name: 'Heineken', price: 45, brand: 'Importada', image: '🍺', quantity: 30 },
    { id: 206, name: 'Corona', price: 50, brand: 'Importada', image: '🍺', quantity: 25 },
];

// Restaurantes mock data
export const RESTAURANTS = [
    {
        id: 1,
        name: 'Comedor La Abuela',
        description: 'Las mejores sopas y comida casera',
        location: 'Ocotepeque · Barrio El Centro',
        rating: 4.8,
        time: '20-30 min',
        image: '/assets/food-burger.png',
        tags: ['Sopas', 'Típico']
    },
    {
        id: 2,
        name: 'Antojitos Catrachos',
        description: 'Baleadas, pupusas y más',
        location: 'Ocotepeque · Barrio La Granja',
        rating: 4.5,
        time: '15-25 min',
        image: '/assets/tacos.png',
        tags: ['Antojitos', 'Baleadas']
    },
    {
        id: 3,
        name: 'Panadería El Buen Gusto',
        description: 'Pan dulce y café fresco',
        location: 'Sinuapa · Barrio El Calvario',
        rating: 4.9,
        time: '10-20 min',
        image: '/assets/dessert.png',
        tags: ['Panadería', 'Café']
    }
];

// Platillos populares mock data
export const POPULAR_DISHES = [
    {
        id: 101,
        name: 'Sopa de Mondongo',
        price: 120,
        restaurant: 'Comedor La Abuela',
        image: '🍲',
        quantity: 12
    },
    {
        id: 102,
        name: 'Baleada Sencilla',
        price: 25,
        restaurant: 'Antojitos Catrachos',
        image: '🌮',
        quantity: 25
    },
    {
        id: 103,
        name: 'Nacatamal',
        price: 40,
        restaurant: 'Comedor La Abuela',
        image: '🫔',
        quantity: 8
    },
    {
        id: 104,
        name: 'Semita de Yema',
        price: 15,
        restaurant: 'Panadería El Buen Gusto',
        image: '🥐',
        quantity: 15
    },
];
