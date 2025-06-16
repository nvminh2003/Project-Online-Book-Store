import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminBusinessDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Business Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Welcome, {user?.info?.fullName || user?.email}</h2>
                    <p className="text-gray-600">Role: Admin Business</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Order Management</h2>
                    <p className="text-gray-600">Manage customer orders and reviews</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Sales & Discounts</h2>
                    <p className="text-gray-600">Manage discounts and view sales reports</p>
                </div>
            </div>
        </div>
    );
};

export default AdminBusinessDashboard; 