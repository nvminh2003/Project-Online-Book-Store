import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole, requiredDepartment }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

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

    if (requiredDepartment && user.role !== 'superadmin') {
        if (user.adminInfo?.department?.toLowerCase() !== requiredDepartment.toLowerCase()) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute; 