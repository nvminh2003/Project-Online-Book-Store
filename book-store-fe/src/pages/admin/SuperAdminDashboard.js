import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/common/Icon';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL_BACKEND || 'http://localhost:9999/api';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalAdmins: 0,
        pendingUserApprovals: 0,
        recentAdminActivities: 0
    });
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [userRoleStats, setUserRoleStats] = useState([]); // for chart
    const [loading, setLoading] = useState(true);
    const [activityLoading, setActivityLoading] = useState(true);

    // Fetch users and stats
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {

                const token = localStorage.getItem('accessToken');
                const res = await axios.get(`${API_URL}/accounts?limit=1000`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const all = res.data.data || [];
                setUsers(all);
                // Stats
                const roleCount = {};
                let active = 0, pending = 0, admins = 0;
                all.forEach(u => {
                    if (u.isActive) active++;
                    if (!u.isActive) pending++;
                    if (u.role && u.role.includes('admin')) admins++;
                    roleCount[u.role] = (roleCount[u.role] || 0) + 1;
                });
                setStats(prev => ({
                    ...prev,
                    totalUsers: all.length,
                    totalAdmins: admins,
                    activeUsers: active,
                    pendingUserApprovals: pending
                }));
                setUserRoleStats(Object.entries(roleCount).map(([role, count]) => ({ role, count })));
            } catch (e) {
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Fetch admin activities
    useEffect(() => {
        const fetchActivities = async () => {
            setActivityLoading(true);
            try {
                // const res = await axios.get(`${API_URL}/admin/activities?limit=10`);
                const token = localStorage.getItem('accessToken');
                const res = await axios.get(`${API_URL}/admin/activities?limit=10`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setActivities(res.data.data || []);
                setStats(prev => ({ ...prev, recentAdminActivities: res.data.data?.length || 0 }));
            } catch (e) {
                setActivities([]);
            } finally {
                setActivityLoading(false);
            }
        };
        fetchActivities();
    }, []);

    // Pie chart for user roles (simple SVG)
    const PieChart = ({ data }) => {
        const total = data.reduce((sum, d) => sum + d.count, 0);
        let acc = 0;
        const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a21caf', '#f472b6'];

        return (
            <svg viewBox="0 0 32 32" width={180} height={180} className="md:mr-6">
                {data.map((d, i) => {
                    const val = d.count / total * 100;
                    const start = acc;
                    acc += val;
                    const large = val > 50 ? 1 : 0;
                    const r = 16, cx = 16, cy = 16;
                    const a1 = (start / 100) * 2 * Math.PI;
                    const a2 = ((start + val) / 100) * 2 * Math.PI;
                    const x1 = cx + r * Math.sin(a1);
                    const y1 = cy - r * Math.cos(a1);
                    const x2 = cx + r * Math.sin(a2);
                    const y2 = cy - r * Math.cos(a2);
                    return (
                        <path
                            key={d.role}
                            d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
                            fill={colors[i % colors.length]}
                        />
                    );
                })}
            </svg>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Super Admin Dashboard</h1>
                <p className="text-gray-600 text-lg">Welcome, <span className="font-semibold">{user?.info?.fullName || user?.email}</span> <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Super Admin</span></p>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <div className="bg-sky-100 p-2 rounded-full mr-3">
                            <Icon icon="mdi:account-group" className="h-6 w-6 text-sky-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Tổng người dùng</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h2>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <div className="bg-emerald-100 p-2 rounded-full mr-3">
                            <Icon icon="mdi:account-check" className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Tài khoản đã đăng nhập</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.activeUsers}</h2>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <div className="bg-violet-100 p-2 rounded-full mr-3">
                            <Icon icon="mdi:shield-account" className="h-6 w-6 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Quản trị viên</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.totalAdmins}</h2>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <div className="bg-amber-100 p-2 rounded-full mr-3">
                            <Icon icon="mdi:account-clock" className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Tài khoản bị khóa</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.pendingUserApprovals}</h2>
                        </div>
                    </div>
                </div>
            </div>
            {/* User Role Pie Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <span className="bg-blue-100 p-2 rounded-full mr-3">
                        <Icon icon="mdi:chart-pie" className="h-5 w-5 text-blue-600" />
                    </span>
                    Thống kê vai trò người dùng
                </h3>

                {userRoleStats.length === 0 ? (
                    <p className="text-gray-500">Không có dữ liệu vai trò.</p>
                ) : (
                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                        {/* Pie Chart */}
                        <div className="flex-shrink-0">
                            <PieChart data={userRoleStats} />
                        </div>

                        {/* Role Detail List */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {userRoleStats.map((roleData, index) => {
                                const total = userRoleStats.reduce((sum, r) => sum + r.count, 0);
                                const percentage = ((roleData.count / total) * 100).toFixed(1);
                                const colors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-yellow-100 text-yellow-600', 'bg-red-100 text-red-600', 'bg-pink-100 text-pink-600', 'bg-purple-100 text-purple-600'];

                                return (
                                    <div key={roleData.role} className="flex items-center p-3 border rounded-md">
                                        <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-3 ${colors[index % colors.length]}`}>
                                            <Icon icon="mdi:account" className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 capitalize">{roleData.role}</p>
                                            <p className="text-xs text-gray-500">{roleData.count} người dùng ({percentage}%)</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Activity Log Table */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="bg-indigo-100 p-2 rounded-full mr-3">
                        <Icon icon="mdi:history" className="h-5 w-5 text-indigo-600" />
                    </span>
                    Hoạt động ADMIN gần đây
                </h3>
                {activityLoading ? <div>Loading activities...</div> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-[500px] w-full text-sm">
                            <thead>
                                <tr className="bg-blue-50">
                                    <th className="py-2 px-3 text-left font-semibold">Admin</th>
                                    <th className="py-2 px-3 text-left font-semibold">Action</th>
                                    <th className="py-2 px-3 text-left font-semibold">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.length === 0 ? <tr><td colSpan={3} className="text-center text-gray-400 py-4">No activities</td></tr> : activities.map(a => (
                                    <tr key={a._id}>
                                        <td className="py-2 px-3">{a.adminId?.info?.fullName || a.adminId?.email || 'N/A'}</td>
                                        <td className="py-2 px-3">{a.action || a.description}</td>
                                        <td className="py-2 px-3">{new Date(a.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;