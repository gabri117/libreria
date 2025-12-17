import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }: { children: ReactNode, requiredRole?: string }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user?.rol !== requiredRole && user?.rol !== 'Administrador') { // Admins can access everything usually
        return <Navigate to="/" replace />; // Redirect to dashboard if not authorized
    }

    return children;
};
