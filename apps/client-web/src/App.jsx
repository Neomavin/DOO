import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Restaurants from './pages/Restaurants';
import ProductDetail from './pages/ProductDetail';
import CategoryDetails from './pages/CategoryDetails';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import './App.css';

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/onboarding" />;
}

// Componente para rutas públicas (redirige si ya está autenticado)
function PublicRoute({ children }) {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    return !isAuthenticated ? children : <Navigate to="/restaurants" />;
}

function App() {
    const initAuth = useAuthStore(state => state.initAuth);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/onboarding" />} />

                <Route
                    path="/onboarding"
                    element={
                        <PublicRoute>
                            <Onboarding />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/restaurants"
                    element={
                        <ProtectedRoute>
                            <Restaurants />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/product/:id"
                    element={
                        <ProtectedRoute>
                            <ProductDetail />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/category/:id"
                    element={
                        <ProtectedRoute>
                            <CategoryDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/restaurant/:id"
                    element={
                        <ProtectedRoute>
                            <RestaurantDetail />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <Checkout />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/order-confirmation/:orderId"
                    element={
                        <ProtectedRoute>
                            <OrderConfirmation />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <OrderHistory />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/onboarding" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
