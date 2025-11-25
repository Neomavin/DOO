const axios = require('axios');

async function createCourier() {
    const courierData = {
        email: 'repartidor@test.com',
        password: 'password123',
        name: 'Repartidor Test',
        phone: '99999999',
        address: 'Ocotepeque',
        role: 'COURIER'
    };

    console.log('⏳ Intentando crear usuario repartidor...');
    console.log(`   Email: ${courierData.email}`);
    console.log(`   Password: ${courierData.password}`);

    try {
        const response = await axios.post('http://localhost:4000/auth/register', courierData);
        console.log('✅ Usuario repartidor creado exitosamente!');
        console.log('👉 Puedes iniciar sesión con estos datos en la app.');
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ No se pudo conectar al API (http://localhost:4000).');
            console.error('⚠️  Asegúrate de que el backend esté corriendo: "pnpm --filter api dev"');
        } else if (error.response) {
            if (error.response.status === 409 || (error.response.data.message && error.response.data.message.includes('exist'))) {
                console.log('ℹ️  El usuario repartidor ya existe. Puedes iniciar sesión.');
            } else {
                console.error('❌ Error del servidor:', error.response.data);
            }
        } else {
            console.error('❌ Error inesperado:', error.message);
        }
    }
}

createCourier();
