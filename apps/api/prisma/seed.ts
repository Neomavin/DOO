import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos existentes
  await prisma.cartItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('Demo123!', 12);
  
  const customer = await prisma.user.create({
    data: {
      email: 'demo@food.dev',
      passwordHash: hashedPassword,
      name: 'Usuario Demo',
      phone: '+504 9999-9999',
      role: 'CUSTOMER',
    },
  });

  const courier = await prisma.user.create({
    data: {
      email: 'courier@food.dev',
      passwordHash: hashedPassword,
      name: 'Repartidor Demo',
      phone: '+504 8888-8888',
      role: 'COURIER',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@food.dev',
      passwordHash: hashedPassword,
      name: 'Admin Demo',
      phone: '+504 7777-7777',
      role: 'ADMIN',
    },
  });

  console.log('✅ Users created');

  // Crear dirección para el cliente
  await prisma.address.create({
    data: {
      userId: customer.id,
      label: 'Casa',
      line1: 'Barrio El Centro',
      city: 'Ocotepeque',
      lat: 14.4358,
      lng: -89.1858,
      isDefault: true,
    },
  });

  console.log('✅ Address created');

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Pizza',
        slug: 'pizza',
        imageUrl: '🍕',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Hamburguesas',
        slug: 'hamburguesas',
        imageUrl: '🍔',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tacos',
        slug: 'tacos',
        imageUrl: '🌮',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pollo',
        slug: 'pollo',
        imageUrl: '🍗',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Postres',
        slug: 'postres',
        imageUrl: '🍰',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bebidas',
        slug: 'bebidas',
        imageUrl: '🥤',
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Crear restaurantes
  const pizzeria = await prisma.restaurant.create({
    data: {
      name: 'Pizzería Don Carlos',
      slug: 'pizzeria-don-carlos',
      logoUrl: '🍕',
      bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      rating: 4.8,
      etaMinutes: 30,
      lat: 14.4360,
      lng: -89.1860,
      isOpen: true,
    },
  });

  const burgerHouse = await prisma.restaurant.create({
    data: {
      name: 'Burger House',
      slug: 'burger-house',
      logoUrl: '🍔',
      bannerUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      rating: 4.6,
      etaMinutes: 25,
      lat: 14.4355,
      lng: -89.1855,
      isOpen: true,
    },
  });

  const tacosElPrimo = await prisma.restaurant.create({
    data: {
      name: 'Tacos El Primo',
      slug: 'tacos-el-primo',
      logoUrl: '🌮',
      bannerUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
      rating: 4.7,
      etaMinutes: 20,
      lat: 14.4365,
      lng: -89.1865,
      isOpen: true,
    },
  });

  const polloCampero = await prisma.restaurant.create({
    data: {
      name: 'Pollo Campero Ocotepeque',
      slug: 'pollo-campero',
      logoUrl: '🍗',
      bannerUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
      rating: 4.5,
      etaMinutes: 35,
      lat: 14.4350,
      lng: -89.1850,
      isOpen: true,
    },
  });

  const cafeteria = await prisma.restaurant.create({
    data: {
      name: 'Cafetería Central',
      slug: 'cafeteria-central',
      logoUrl: '☕',
      bannerUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
      rating: 4.4,
      etaMinutes: 15,
      lat: 14.4358,
      lng: -89.1858,
      isOpen: true,
    },
  });

  const comidaTipica = await prisma.restaurant.create({
    data: {
      name: 'Comida Típica Honduras',
      slug: 'comida-tipica',
      logoUrl: '🇭🇳',
      bannerUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      rating: 4.9,
      etaMinutes: 40,
      lat: 14.4370,
      lng: -89.1870,
      isOpen: true,
    },
  });

  console.log('✅ Restaurants created');

  // Crear productos para Pizzería Don Carlos
  await Promise.all([
    prisma.product.create({
      data: {
        restaurantId: pizzeria.id,
        categoryId: categories[0].id,
        name: 'Pizza Pepperoni',
        description: 'Pizza clásica con pepperoni y queso mozzarella',
        priceCents: 15000, // L.150
        imageUrl: '🍕',
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        restaurantId: pizzeria.id,
        categoryId: categories[0].id,
        name: 'Pizza Hawaiana',
        description: 'Pizza con jamón, piña y queso',
        priceCents: 16000, // L.160
        imageUrl: '🍕',
        isFeatured: false,
      },
    }),
    prisma.product.create({
      data: {
        restaurantId: pizzeria.id,
        categoryId: categories[0].id,
        name: 'Pizza Vegetariana',
        description: 'Pizza con vegetales frescos',
        priceCents: 14000, // L.140
        imageUrl: '🍕',
        isFeatured: false,
      },
    }),
  ]);

  // Crear productos para Burger House
  await Promise.all([
    prisma.product.create({
      data: {
        restaurantId: burgerHouse.id,
        categoryId: categories[1].id,
        name: 'Hamburguesa Clásica',
        description: 'Hamburguesa con carne, lechuga, tomate y queso',
        priceCents: 12000, // L.120
        imageUrl: '🍔',
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        restaurantId: burgerHouse.id,
        categoryId: categories[1].id,
        name: 'Hamburguesa Doble',
        description: 'Doble carne, doble queso',
        priceCents: 18000, // L.180
        imageUrl: '🍔',
        isFeatured: false,
      },
    }),
    prisma.product.create({
      data: {
        restaurantId: burgerHouse.id,
        categoryId: categories[5].id,
        name: 'Papas Fritas',
        description: 'Papas fritas crujientes',
        priceCents: 4000, // L.40
        imageUrl: '🍟',
        isFeatured: false,
      },
    }),
  ]);

  // Crear productos para Tacos El Primo
  await Promise.all([
    prisma.product.create({
      data: {
        restaurantId: tacosElPrimo.id,
        categoryId: categories[2].id,
        name: 'Tacos al Pastor',
        description: '3 tacos con carne al pastor',
        priceCents: 8000, // L.80
        imageUrl: '🌮',
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        restaurantId: tacosElPrimo.id,
        categoryId: categories[2].id,
        name: 'Tacos de Pollo',
        description: '3 tacos con pollo marinado',
        priceCents: 7500, // L.75
        imageUrl: '🌮',
        isFeatured: false,
      },
    }),
    prisma.product.create({
      data: {
        restaurantId: tacosElPrimo.id,
        categoryId: categories[2].id,
        name: 'Quesadilla',
        description: 'Quesadilla con queso y carne',
        priceCents: 9000, // L.90
        imageUrl: '🫔',
        isFeatured: false,
      },
    }),
  ]);

  // Crear productos para Pollo Campero
  await Promise.all([
    prisma.product.create({
      data: {
        restaurantId: polloCampero.id,
        categoryId: categories[3].id,
        name: 'Pollo Frito (8 piezas)',
        description: 'Pollo frito crujiente',
        priceCents: 20000, // L.200
        imageUrl: '🍗',
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        restaurantId: polloCampero.id,
        categoryId: categories[3].id,
        name: 'Alitas Picantes',
        description: '12 alitas con salsa picante',
        priceCents: 15000, // L.150
        imageUrl: '🍗',
        isFeatured: false,
      },
    }),
  ]);

  // Crear productos para Cafetería
  await Promise.all([
    prisma.product.create({
      data: {
        restaurantId: cafeteria.id,
        categoryId: categories[5].id,
        name: 'Café Americano',
        description: 'Café negro recién hecho',
        priceCents: 3000, // L.30
        imageUrl: '☕',
        isFeatured: false,
      },
    }),
    prisma.product.create({
      data: {
        restaurantId: cafeteria.id,
        categoryId: categories[4].id,
        name: 'Pastel de Chocolate',
        description: 'Delicioso pastel de chocolate',
        priceCents: 6000, // L.60
        imageUrl: '🍰',
        isFeatured: true,
      },
    }),
  ]);

  // Crear productos para Comida Típica
  await Promise.all([
    prisma.product.create({
      data: {
        restaurantId: comidaTipica.id,
        categoryId: categories[3].id,
        name: 'Baleada Completa',
        description: 'Baleada con frijoles, queso, huevo y aguacate',
        priceCents: 5000, // L.50
        imageUrl: '🫓',
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        restaurantId: comidaTipica.id,
        categoryId: categories[3].id,
        name: 'Plato Típico',
        description: 'Carne asada, tajadas, frijoles y arroz',
        priceCents: 12000, // L.120
        imageUrl: '🍽️',
        isFeatured: true,
      },
    }),
  ]);

  console.log('✅ Products created');

  // Crear notificaciones de ejemplo
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: customer.id,
        title: '🎉 Bienvenido a Delivery Ocotepeque',
        body: 'Disfruta de la mejor comida de Ocotepeque',
      },
    }),
    prisma.notification.create({
      data: {
        userId: customer.id,
        title: '💰 Descuento Especial',
        body: '20% de descuento en tu primer pedido',
      },
    }),
  ]);

  console.log('✅ Notifications created');

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📧 Demo Users:');
  console.log('   Customer: demo@food.dev / Demo123!');
  console.log('   Courier: courier@food.dev / Demo123!');
  console.log('   Admin: admin@food.dev / Demo123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
