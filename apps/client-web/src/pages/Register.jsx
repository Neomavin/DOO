import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuthStore } from '../store';
import Logo from '../components/Logo';
import './Register.css';

function Register() {
    const navigate = useNavigate();
    const setUser = useAuthStore(state => state.setUser);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        reference: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            // Combinar dirección y referencia
            const fullAddress = formData.reference
                ? `${formData.address} (Ref: ${formData.reference})`
                : formData.address;

            const dataToSubmit = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: fullAddress
            };

            const data = await authService.register(dataToSubmit);
            setUser(data.user);
            navigate('/restaurants');
        } catch (err) {
            console.error('Registration error:', err);

            // DEBUG: Mostrar detalles técnicos del error para depuración móvil
            let debugInfo = '';
            if (err.response) {
                debugInfo = `Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}`;
            } else if (err.request) {
                debugInfo = `No response. URL: ${err.config?.url} (Network/CORS?)`;
            } else {
                debugInfo = err.message;
            }

            let errorMessage = 'Error al registrarse';

            if (err.response?.data?.message) {
                const backendMessage = err.response.data.message;
                if (backendMessage === 'User already exists') {
                    errorMessage = 'Este correo ya está registrado.';
                } else if (Array.isArray(backendMessage)) {
                    errorMessage = backendMessage.join(', ');
                } else {
                    errorMessage = backendMessage;
                }
            } else if (err.code === 'ERR_NETWORK') {
                errorMessage = 'Error de conexión. Verifica que tu móvil esté en la misma red WiFi y la IP sea correcta.';
            }

            // Append debug info
            setError(`${errorMessage} | DEBUG: ${debugInfo}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <Logo size="medium" />
                <h1>Doo</h1>
                <p className="subtitle">Crea tu cuenta</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="register-form" autoComplete="off">
                    <div className="form-group">
                        <label htmlFor="name">Nombre completo</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Tu nombre"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="tu@email.com"
                            autoComplete="off"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Teléfono</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+504 1234-5678"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Dirección</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Tu dirección de entrega"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reference">Referencia (Opcional)</label>
                        <input
                            type="text"
                            id="reference"
                            name="reference"
                            value={formData.reference}
                            onChange={handleChange}
                            placeholder="Frente a parque, casa color..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            minLength="6"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>

                <p className="login-link">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
