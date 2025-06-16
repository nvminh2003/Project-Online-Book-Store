import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminActivity } from '../../contexts/AdminActivityContext';

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const { hasPermission, canAccessRoute } = useAdminActivity();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (requiredRole) {
        if (Array.isArray(requiredRole)) {
            if (!requiredRole.includes(user.role)) {
                return <Navigate to="/" replace />;
            }
        } else {
            if (user.role !== requiredRole) {
                return <Navigate to="/" replace />;
            }
        }
    }

    // Check permission-based access
    if (requiredPermission) {
        if (!hasPermission(requiredPermission)) {
            return <Navigate to="/" replace />;
        }
    }

    // Check route-based access (skip for main admin dashboard)
    if (location.pathname !== '/admin' && !canAccessRoute(location.pathname)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute; 