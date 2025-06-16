import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/common/Icon';

const AdminDevDashboard = () => {
    const { user } = useAuth();

    // Mock data - In real app, this would come from API
    const stats = {
        totalUsers: 1250,
        totalAdmins: 15,
        activeUsers: 980,
        totalOrders: 3500,
        totalRevenue: 125000000,
        pendingReviews: 45,
        systemHealth: 99.9
    };

    return (

        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dev Dashboard</h1>

            {/* Welcome Card */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-2">Welcome, {user?.info?.fullName || user?.email}</h2>
                <p className="text-gray-600">Role: Admin Dev</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Users</p>
                            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                        </div>
                        <Icon name="mdi:account-group" className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-sm text-green-500 mt-2">
                        <Icon name="mdi:arrow-up" className="inline" /> 12% from last month
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <h3 className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('vi-VN')}đ</h3>
                        </div>
                        <Icon name="mdi:currency-usd" className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-sm text-green-500 mt-2">
                        <Icon name="mdi:arrow-up" className="inline" /> 8% from last month
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Users</p>
                            <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
                        </div>
                        <Icon name="mdi:account-check" className="h-8 w-8 text-purple-500" />
                    </div>
                    <p className="text-sm text-green-500 mt-2">
                        <Icon name="mdi:arrow-up" className="inline" /> 5% from last month
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">System Health</p>
                            <h3 className="text-2xl font-bold">{stats.systemHealth}%</h3>
                        </div>
                        <Icon name="mdi:server" className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-sm text-green-500 mt-2">
                        <Icon name="mdi:check-circle" className="inline" /> All systems operational
                    </p>
                </div>
            </div>

            {/* Admin Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Admin Management</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Admins</p>
                                <p className="text-lg font-semibold">{stats.totalAdmins}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Add Admin
                                </button>
                                <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                                    View All
                                </button>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-500">Recent Admin Activities</p>
                            <div className="mt-2 space-y-2">
                                <p className="text-sm">• Admin John updated user permissions</p>
                                <p className="text-sm">• Admin Sarah created new discount</p>
                                <p className="text-sm">• Admin Mike approved 5 reviews</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">System Overview</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending Reviews</p>
                                <p className="text-lg font-semibold">{stats.pendingReviews}</p>
                            </div>
                            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Review Now
                            </button>
                        </div>
                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-500">System Status</p>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Database</span>
                                    <span className="text-sm text-green-500">Healthy</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">API Services</span>
                                    <span className="text-sm text-green-500">Operational</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Storage</span>
                                    <span className="text-sm text-green-500">75% Used</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <div>
                            <p className="font-medium">New User Registration</p>
                            <p className="text-sm text-gray-500">5 minutes ago</p>
                        </div>
                        <Icon name="mdi:account-plus" className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                        <div>
                            <p className="font-medium">Order Completed</p>
                            <p className="text-sm text-gray-500">15 minutes ago</p>
                        </div>
                        <Icon name="mdi:check-circle" className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                        <div>
                            <p className="font-medium">New Review Posted</p>
                            <p className="text-sm text-gray-500">30 minutes ago</p>
                        </div>
                        <Icon name="mdi:star" className="h-5 w-5 text-yellow-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDevDashboard; 