import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuthStore } from '../store';
import Logo from '../components/Logo';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const setUser = useAuthStore(state => state.setUser);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authService.login(email, password);
            setUser(data.user);
            navigate('/restaurants');
        } catch (err) {
            console.error('Login error:', err);

            // DEBUG: Mostrar detalles técnicos
            let debugInfo = '';
            if (err.response) {
                debugInfo = `Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}`;
            } else if (err.request) {
                debugInfo = `No response. URL: ${err.config?.url} (Network/CORS?)`;
            } else {
                debugInfo = err.message;
            }

            let errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
            if (err.code === 'ERR_NETWORK') {
                errorMessage = 'Error de conexión. Verifica IP y red WiFi.';
            }

            setError(`${errorMessage} | DEBUG: ${debugInfo}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <Logo size="medium" />
                <h1>Doo</h1>
                <p className="subtitle">Inicia sesión para continuar</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="register-link">
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
