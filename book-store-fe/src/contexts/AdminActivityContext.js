import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import adminService from '../services/adminService';

const AdminActivityContext = createContext(null);

export const AdminActivityProvider = ({ children }) => {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch admin activities
    const fetchActivities = async (params = {}) => {
        if (!user || user.role !== 'superadmin') return;

        try {
            setLoading(true);
            let response;
            const { page = 1, limit = 10, startDate, endDate, searchTerm } = params;

            if (startDate && endDate) {
                response = await adminService.getAdminActivitiesByDateRange(startDate, endDate, page, limit);
            } else if (searchTerm) {
                response = await adminService.searchActivities(searchTerm, page, limit);
            } else {
                response = await adminService.getAdminActivities(page, limit);
            }

            setActivities(response.data);
            setError(null);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Check if user has specific permission
    const hasPermission = (permission) => {
        if (!user) return false;

        // Check specific role permissions
        const rolePermissions = {
            superadmin: [
                // CRUD permissions
                "CREATE_USER", "UPDATE_USER", "DELETE_USER",
                // View permissions
                "VIEW_ADMIN_ACTIVITY", "VIEW_USER", "VIEW_USER_BY_ID"
            ],
            admindev: [
                // View permissions
                "VIEW_BOOK", "VIEW_CATEGORY", "VIEW_BLOG",
                // CRUD permissions
                "CREATE_BOOK", "UPDATE_BOOK", "DELETE_BOOK",
                "CREATE_CATEGORY", "UPDATE_CATEGORY", "DELETE_CATEGORY",
                "CREATE_BLOG", "UPDATE_BLOG", "DELETE_BLOG",

            ],
            adminbusiness: [
                // View permissions
                "VIEW_DISCOUNT", "VIEW_ORDER", "VIEW_REVIEW", "VIEW_SALES_REPORT",
                // CRUD permissions
                "CREATE_DISCOUNT", "UPDATE_DISCOUNT", "DELETE_DISCOUNT",
                "CREATE_ORDER", "UPDATE_ORDER", "DELETE_ORDER"
            ]
        };

        return rolePermissions[user.role]?.includes(permission) || false;
    };

    // Check if user can access specific route
    const canAccessRoute = (route) => {
        if (!user) return false;

        // Allow access to main admin dashboard
        if (route === '/admin') return true;

        const routePermissions = {
            // Superadmin routes
            '/admin/users': 'VIEW_USER',
            '/admin/view-admin-activity': 'VIEW_ADMIN_ACTIVITY',

            // AdminDev routes
            '/admin/books': 'VIEW_BOOK',
            '/admin/categories': 'VIEW_CATEGORY',
            '/admin/blog': 'VIEW_BLOG',

            // AdminBusiness routes
            '/admin/discounts': 'VIEW_DISCOUNT',
            '/admin/orders': 'VIEW_ORDER',
            '/admin/review': 'VIEW_REVIEW',
            '/admin/reports': 'VIEW_SALES_REPORT'
        };

        const requiredPermission = routePermissions[route];
        return requiredPermission ? hasPermission(requiredPermission) : false;
    };

    // Check if user can perform specific action
    const canPerformAction = (action, resource) => {
        if (!user) return false;

        const actionPermissions = {
            create: {
                user: 'CREATE_USER',
                book: 'CREATE_BOOK',
                category: 'CREATE_CATEGORY',
                blog: 'CREATE_BLOG',
                discount: 'CREATE_DISCOUNT',
                order: 'CREATE_ORDER'
            },
            update: {
                user: 'UPDATE_USER',
                book: 'UPDATE_BOOK',
                category: 'UPDATE_CATEGORY',
                blog: 'UPDATE_BLOG',
                discount: 'UPDATE_DISCOUNT',
                order: 'UPDATE_ORDER'
            },
            delete: {
                user: 'DELETE_USER',
                book: 'DELETE_BOOK',
                category: 'DELETE_CATEGORY',
                blog: 'DELETE_BLOG',
                discount: 'DELETE_DISCOUNT',
                order: 'DELETE_ORDER'
            },
            view: {
                user: 'VIEW_USER',
                userById: 'VIEW_USER_BY_ID',
                adminActivity: 'VIEW_ADMIN_ACTIVITY',
                book: 'VIEW_BOOK',
                category: 'VIEW_CATEGORY',
                blog: 'VIEW_BLOG',
                discount: 'VIEW_DISCOUNT',
                order: 'VIEW_ORDER',
                review: 'VIEW_REVIEW',
                salesReport: 'VIEW_SALES_REPORT'
            }
        };

        const requiredPermission = actionPermissions[action]?.[resource];
        return requiredPermission ? hasPermission(requiredPermission) : false;
    };

    const value = {
        activities,
        loading,
        error,
        fetchActivities,
        hasPermission,
        canAccessRoute,
        canPerformAction
    };

    return (
        <AdminActivityContext.Provider value={value}>
            {children}
        </AdminActivityContext.Provider>
    );
};

export const useAdminActivity = () => {
    const context = useContext(AdminActivityContext);
    if (!context) {
        throw new Error('useAdminActivity must be used within an AdminActivityProvider');
    }
    return context;
};

export default AdminActivityContext; 