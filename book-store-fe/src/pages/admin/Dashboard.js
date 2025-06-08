import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    // Lấy department nếu có
    const department = user?.adminInfo?.department || '';

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Welcome, {user?.adminInfo?.fullName || user?.email}</h2>
                    <p className="text-gray-600">Role: {user?.role}</p>
                    {department && <p className="text-gray-600">Department: {department}</p>}
                </div>
                {/* Add more dashboard widgets here */}
            </div>
        </div>
    );
};

export default Dashboard; 