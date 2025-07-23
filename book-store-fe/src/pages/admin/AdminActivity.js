import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useAdminActivity } from '../../contexts/AdminActivityContext';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminTable from '../../components/admin/AdminTable';
import AdminPagination from '../../components/admin/AdminPagination';

const AdminActivity = () => {
    const { activities, loading, error, fetchActivities } = useAdminActivity();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const columns = [
        {
            key: 'createdAt',
            label: 'Thời gian',
            render: (item) => (
                <div className="whitespace-nowrap">
                    {moment(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                </div>
            )
        },
        {
            key: 'adminId',
            label: 'Admin',
            render: (item) => (
                <div className="whitespace-normal break-words max-w-xs">
                    {item.adminId?.email || item.adminId}
                </div>
            )
        },
        {
            key: 'action',
            label: 'Hành động',
            render: (item) => (
                <div className="whitespace-normal break-words max-w-xs">
                    {item.action}
                </div>
            )
        },
        {
            key: 'details',
            label: 'Chi tiết',
            render: (item) => (
                <div className="whitespace-normal break-words max-w-sm">
                    {item.details}
                </div>
            )
        }
    ];

    const loadActivities = async () => {
        try {
            const params = {
                page: currentPage,
                limit: 10,
                sort: '-createdAt',
                _t: Date.now()
            };

            if (startDate && endDate) {
                params.startDate = startDate;
                params.endDate = endDate;
            }

            if (searchTerm) {
                params.searchTerm = searchTerm;
            }

            const response = await fetchActivities(params);
            setTotalPages(response.pagination.totalPages);
            setTotalItems(response.pagination.total);
        } catch (err) {
            console.error('Error loading activities:', err);
        }
    };

    // Pagination
    useEffect(() => {
        loadActivities();
    }, [currentPage]);

    // Search trigger
    useEffect(() => {
        setCurrentPage(1);
        loadActivities();
    }, [searchTerm]);

    // Date filter trigger
    useEffect(() => {
        if (startDate && endDate) {
            setCurrentPage(1);
            loadActivities();
        }
    }, [startDate, endDate]);

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSearchTerm('');
        setCurrentPage(1);
        loadActivities();
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <AdminPageLayout title="Admin Activity Log">
            <div className="p-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                    <div className="md:col-span-4">
                        <AdminSearch
                            placeholder="Tìm kiếm theo hành động hoặc chi tiết..."
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                        />
                    </div>
                    <div className="md:col-span-8">
                        <div className="flex gap-4">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {(startDate || endDate || searchTerm) && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 rounded-lg text-white font-medium bg-gray-600 hover:bg-gray-700"
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <AdminTable
                    columns={columns}
                    data={activities}
                    loading={loading}
                />

                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
        </AdminPageLayout>
    );
};

export default AdminActivity;
