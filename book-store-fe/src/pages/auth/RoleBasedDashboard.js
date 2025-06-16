import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SuperAdminDashboard from '../admin/SuperAdminDashboard';
import AdminDevDashboard from '../admin/AdminDevDashboard';
import AdminBusinessDashboard from '../admin/AdminBusinessDashboard';

const RoleBasedDashboard = () => {
    const { user } = useAuth();

    switch (user?.role) {
        case 'superadmin':
            return <SuperAdminDashboard />;
        case 'admindev':
            return <AdminDevDashboard />;
        case 'adminbusiness':
            return <AdminBusinessDashboard />;
        default:
            return <Navigate to="/" replace />;
    }
};

export default RoleBasedDashboard;
