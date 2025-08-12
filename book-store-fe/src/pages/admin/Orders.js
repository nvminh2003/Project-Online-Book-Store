import React, { useEffect, useState } from 'react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminTable from '../../components/admin/AdminTable';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminModal from '../../components/admin/AdminModal';
import orderService from '../../services/orderService';
import Icon from '../../components/common/Icon';
import { notifySuccess, notifyError } from '../../components/common/ToastManager';

const ORDER_STATUS = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
];
const PAYMENT_STATUS = [
    { value: '', label: 'Tất cả thanh toán' },
    { value: 'pending', label: 'Chờ thanh toán' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'failed', label: 'Thất bại' },
];
const PAYMENT_METHOD = [
    { value: '', label: 'Tất cả phương thức' },
    { value: 'COD', label: 'COD' },
    { value: 'PAYOS', label: 'PayOS' },
];

// Map tiếng Việt cho trạng thái đơn hàng và thanh toán
const ORDER_STATUS_VI = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận/giao hàng',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
};
const PAYMENT_STATUS_VI = {
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán',
    failed: 'Thanh toán thất bại',
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [orderStatus, setOrderStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [stats, setStats] = useState(null);

    const fetchOrders = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit: 10,
                orderStatus,
                paymentStatus,
                paymentMethod,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            };
            if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                notifyError('Ngày bắt đầu không được lớn hơn ngày kết thúc');
                setLoading(false);
                return;
            }
            if (searchTerm) {
                params.searchTerm = searchTerm;
            }
            const res = await orderService.getAllOrders(params);
            setOrders(res.data.orders);
            setPagination(res.data.pagination);
            setStats(res.data.stats);
        } catch (err) {
            notifyError(err.message || 'Lỗi khi tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        fetchOrders(1);
        // eslint-disable-next-line
    }, [orderStatus, paymentStatus, paymentMethod, startDate, endDate]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        fetchOrders(1);
    };

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, page }));
        fetchOrders(page);
    };

    const handleShowDetail = async (orderId) => {
        setLoading(true);
        try {
            const res = await orderService.getOrderById(orderId);
            setSelectedOrder(res.data);
            setShowDetail(true);
        } catch (err) {
            notifyError(err.message || 'Không thể lấy chi tiết đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setUpdating(true);
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            notifySuccess('Cập nhật trạng thái đơn hàng thành công!');
            fetchOrders(pagination.page);
        } catch (err) {
            notifyError((err && err.message) || 'Cập nhật trạng thái đơn hàng thất bại');
            console.error('Update order status error:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdatePaymentStatus = async (orderId, newStatus) => {
        setUpdating(true);
        try {
            await orderService.updatePaymentStatus(orderId, newStatus);
            notifySuccess('Cập nhật trạng thái thanh toán thành công!');
            fetchOrders(pagination.page);
        } catch (err) {
            notifyError((err && err.message) || 'Cập nhật trạng thái thanh toán thất bại');
            console.error('Update payment status error:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            const params = {};
            if (orderStatus) params.orderStatus = orderStatus;
            if (paymentStatus) params.paymentStatus = paymentStatus;
            if (paymentMethod) params.paymentMethod = paymentMethod;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (searchTerm) params.searchTerm = searchTerm;

            // Validate ngày
            if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                notifyError('Ngày bắt đầu không được lớn hơn ngày kết thúc');
                return;
            }

            // Tạo query string
            const queryString = new URLSearchParams(params).toString();

            // Gọi API xuất Excel
            const response = await orderService.exportOrdersToExcel(queryString);

            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'orders.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            notifySuccess('Xuất file Excel thành công!');
        } catch (err) {
            notifyError('Xuất file thất bại!');
        }
    };

    const columns = [
        { key: 'orderCode', label: 'Mã đơn' },
        { key: 'fullName', label: 'Khách hàng', render: (order) => order.fullName || order.user?.info?.fullName || order.user?.email },
        { key: 'phone', label: 'Số điện thoại' },
        { key: 'totalAmount', label: 'Tổng tiền', render: (order) => order.totalAmount?.toLocaleString() + ' đ' },
        {
            key: 'orderStatus',
            label: 'Trạng thái đơn',
            width: '135px',
            render: (order) => {
                const statusColor = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    confirmed: 'bg-blue-100 text-blue-800',
                    completed: 'bg-green-100 text-green-800',
                    cancelled: 'bg-red-100 text-red-800',
                }[order.orderStatus] || 'bg-gray-100 text-gray-800';

                return (
                    <div className={`rounded px-1.5 py-0.5 mr-3 ${statusColor}`}>
                        <select
                            value={order.orderStatus}
                            disabled={updating}
                            onChange={e => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="w-full text-sm bg-transparent outline-none"
                        >
                            {ORDER_STATUS.filter(s => s.value).map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </div>
                );
            }
        },
        {
            key: 'paymentStatus',
            label: 'Thanh toán',
            width: '155px',
            render: (order) => {
                const color = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    paid: 'bg-green-100 text-green-800',
                    failed: 'bg-red-100 text-red-800',
                }[order.paymentStatus] || 'bg-gray-100 text-gray-800';

                return (
                    <div className={`rounded px-1.5 py-0.5 mr-4 ml-2 ${color}`}>
                        <select
                            value={order.paymentStatus}
                            disabled={updating}
                            onChange={e => handleUpdatePaymentStatus(order._id, e.target.value)}
                            className="w-full text-sm bg-transparent outline-none"
                        >
                            {PAYMENT_STATUS.filter(s => s.value).map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </div>
                );
            }
        },
        { key: 'createdAt', label: 'Ngày tạo', render: (order) => new Date(order.createdAt).toLocaleString() },
        {
            key: 'actions',
            label: 'Hành động',
            render: (order) => (
                <button
                    className="pl-5 hover:text-blue-500 transition-colors duration-200"
                    onClick={() => handleShowDetail(order._id)}
                >
                    <Icon icon="hugeicons:eye" width="24" height="24" />
                </button>
            )
        }
    ];

    const filters = [
        {
            value: orderStatus,
            onChange: setOrderStatus,
            placeholder: ORDER_STATUS[0].label,
            options: ORDER_STATUS,
        },
        {
            value: paymentStatus,
            onChange: setPaymentStatus,
            placeholder: PAYMENT_STATUS[0].label,
            options: PAYMENT_STATUS,
        },
        {
            value: paymentMethod,
            onChange: setPaymentMethod,
            placeholder: PAYMENT_METHOD[0].label,
            options: PAYMENT_METHOD,
        },
    ];

    return (
        <AdminPageLayout title="Quản lý đơn hàng">
            <div className="p-6">
                {/* Filters & Search */}
                {/* Hàng 1: Search + Date + Reset */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Ô tìm kiếm */}
                    <div className="md:col-span-4">
                        <AdminSearch
                            placeholder="Tìm mã đơn, tên, SĐT, email..."
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={() => handleSearch(searchTerm)}
                        />
                    </div>

                    {/* Ngày bắt đầu */}
                    <div className="md:col-span-3">
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full h-[40px] px-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-300"
                        />
                    </div>

                    {/* Ngày kết thúc */}
                    <div className="md:col-span-3">
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full h-[40px] px-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-300"
                        />
                    </div>

                    {/* Nút reset + xuất excel */}
                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
                        {(startDate || endDate || orderStatus || paymentStatus || paymentMethod || searchTerm) && (
                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    setOrderStatus('');
                                    setPaymentStatus('');
                                    setPaymentMethod('');
                                    setSearchTerm('');
                                    fetchOrders(1);
                                }}
                                className="flex-1 h-[40px] bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Xóa lọc
                            </button>
                        )}
                        <button
                            onClick={handleExportExcel}
                            className="flex-1 h-[40px] bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Xuất Excel
                        </button>
                    </div>
                </div>

                {/* Hàng 2: Các bộ lọc trạng thái */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                    <div className="md:col-span-4">
                        <select
                            value={orderStatus}
                            onChange={e => setOrderStatus(e.target.value)}
                            className="w-full h-[40px] px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-300"
                        >
                            {ORDER_STATUS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-4">
                        <select
                            value={paymentStatus}
                            onChange={e => setPaymentStatus(e.target.value)}
                            className="w-full h-[40px] px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-300"
                        >
                            {PAYMENT_STATUS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-4">
                        <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            className="w-full h-[40px] px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-300"
                        >
                            {PAYMENT_METHOD.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 border rounded shadow-sm">
                            <div className="text-sm text-gray-500">Tổng số đơn hàng</div>
                            <div className="text-xl font-semibold text-blue-600">{stats.totalOrders}</div>
                        </div>
                        <div className="bg-white p-4 border rounded shadow-sm">
                            <div className="text-sm text-gray-500">Tổng doanh thu</div>
                            <div className="text-xl font-semibold text-green-600">{stats.totalRevenue?.toLocaleString()} đ</div>
                        </div>
                        <div className="bg-white p-4 border rounded shadow-sm">
                            <div className="text-sm text-gray-500">Giá trị đơn TB</div>
                            <div className="text-xl font-semibold text-indigo-600">{stats.avgOrderValue?.toLocaleString()} đ</div>
                        </div>
                    </div>
                )}

                {error && <div className="text-red-500 mb-2">{error}</div>}
                <AdminTable columns={columns} data={orders} loading={loading} />
                <AdminPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={handlePageChange}
                />
                {/* Modal chi tiết đơn hàng */}
                <AdminModal size='lg' isOpen={showDetail} onClose={() => setShowDetail(false)} title="Chi tiết đơn hàng">
                    {selectedOrder && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><span className="text-gray-500">Mã đơn:</span> <b>{selectedOrder.orderCode}</b></div>
                                <div><span className="text-gray-500">Ngày tạo:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</div>

                                <div><span className="text-gray-500">Khách hàng:</span> {selectedOrder.fullName || selectedOrder.user?.info?.fullName || selectedOrder.user?.email}</div>
                                <div><span className="text-gray-500">Số điện thoại:</span> {selectedOrder.phone}</div>

                                <div><span className="text-gray-500">Địa chỉ:</span> {selectedOrder.address}</div>
                                <div><span className="text-gray-500">Ghi chú:</span> {selectedOrder.note || '-'}</div>

                                <div><span className="text-gray-500">Tổng tiền:</span> <b className="text-green-600">{selectedOrder.totalAmount?.toLocaleString()} đ</b></div>
                                <div>
                                    <span className="text-gray-500">Trạng thái đơn:</span>{" "}
                                    <span className={`inline-block px-2 py-1 rounded text-white text-sm ${selectedOrder.orderStatus === 'pending'
                                        ? 'bg-yellow-500'
                                        : selectedOrder.orderStatus === 'completed'
                                            ? 'bg-green-600'
                                            : selectedOrder.orderStatus === 'cancelled'
                                                ? 'bg-gray-500'
                                                : 'bg-blue-500'
                                        }`}>
                                        {ORDER_STATUS_VI[selectedOrder.orderStatus] || selectedOrder.orderStatus}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-gray-500">Thanh toán:</span>{" "}
                                    <span className={`inline-block px-2 py-1 rounded text-white text-sm ${selectedOrder.paymentStatus === 'paid'
                                        ? 'bg-green-600'
                                        : selectedOrder.paymentStatus === 'failed'
                                            ? 'bg-red-500'
                                            : 'bg-yellow-500'
                                        }`}>
                                        {PAYMENT_STATUS_VI[selectedOrder.paymentStatus] || selectedOrder.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-gray-500 mb-1 font-medium">Danh sách sản phẩm:</div>
                                <ul className="list-disc pl-6 space-y-1">
                                    {selectedOrder.items?.map(item => (
                                        <li key={item._id}>
                                            <div>
                                                <span className="font-medium">{item.book?.title}</span> – SL: {item.quantity} –{" "}
                                                <span className="text-blue-600">{item.price?.toLocaleString()} đ</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </AdminModal>

            </div>
        </AdminPageLayout>
    );
};

export default Orders;