import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/common/Icon';

const SuperAdminDashboard = () => {
    const { user } = useAuth();

    // Mock data - In real app, this would come from API
    const stats = {
        totalUsers: 1250,
        activeUsers: 980,
        totalAdmins: 15,
        recentAdminActivities: 25,
        pendingUserApprovals: 8,
        systemHealth: 99.9
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>

            {/* Welcome Card */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-2">Welcome, {user?.info?.fullName || user?.email}</h2>
                <p className="text-gray-600">Role: Super Admin</p>
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
                            <p className="text-sm text-gray-500">Active Users</p>
                            <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
                        </div>
                        <Icon name="mdi:account-check" className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-sm text-green-500 mt-2">
                        <Icon name="mdi:arrow-up" className="inline" /> 5% from last month
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Admins</p>
                            <h3 className="text-2xl font-bold">{stats.totalAdmins}</h3>
                        </div>
                        <Icon name="mdi:shield-account" className="h-8 w-8 text-purple-500" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        <Icon name="mdi:information" className="inline" /> Manage admin accounts
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending Approvals</p>
                            <h3 className="text-2xl font-bold">{stats.pendingUserApprovals}</h3>
                        </div>
                        <Icon name="mdi:account-clock" className="h-8 w-8 text-yellow-500" />
                    </div>
                    <p className="text-sm text-blue-500 mt-2">
                        <Icon name="mdi:alert-circle" className="inline" /> Needs attention
                    </p>
                </div>
            </div>

            {/* User Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">User Management</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">User Actions</p>
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Create User
                                </button>
                                <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                                    View All Users
                                </button>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-500">Recent User Activities</p>
                            <div className="mt-2 space-y-2">
                                <p className="text-sm">• New user registration: John Doe</p>
                                <p className="text-sm">• User profile updated: Jane Smith</p>
                                <p className="text-sm">• Account deactivated: Mike Johnson</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Admin Activity Log</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Recent Admin Actions</p>
                                <p className="text-lg font-semibold">{stats.recentAdminActivities} actions today</p>
                            </div>
                            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                View Full Log
                            </button>
                        </div>
                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-500">Latest Activities</p>
                            <div className="mt-2 space-y-2">
                                <p className="text-sm">• Admin Sarah updated user permissions</p>
                                <p className="text-sm">• Admin Mike created new user account</p>
                                <p className="text-sm">• Admin John reviewed user activity</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SuperAdminDashboard; 