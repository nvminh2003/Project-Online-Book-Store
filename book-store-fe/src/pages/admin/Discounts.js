import React, { useState, useEffect } from 'react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Icon } from '@iconify/react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL_BACKEND;
const token = localStorage.getItem('accessToken');

const Discounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Điều khiển modal
    const [isEditing, setIsEditing] = useState(false); // Kiểm tra nếu đang chỉnh sửa hay không
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Điều khiển modal xác nhận xóa
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [valueMin, setValueMin] = useState('');
    const [valueMax, setValueMax] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [discountForm, setDiscountForm] = useState({
        _id: '',
        code: '',
        description: '',
        type: 'percent',
        value: 0,
        startDate: '',
        endDate: '',
        maxUses: 0,
        isActive: 'active',
    });
    const [discountToDelete, setDiscountToDelete] = useState(null); // Discount cần xóa

    // Lấy danh sách discount từ API
    useEffect(() => {
        const fetchDiscounts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/discount-codes`,{ headers: { Authorization: `Bearer ${token}` }} );
                setDiscounts(response.data);
            } catch (error) {
                console.error('Error fetching discounts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDiscounts();
    }, []);

    const filteredDiscounts = discounts.filter((discount) => {
        const matchesKeyword = discount.code
            .toLowerCase()
            .includes(searchKeyword.toLowerCase());
        const matchesStatus =
            statusFilter === ''
                ? true
                : statusFilter === 'active'
                ? discount.isActive === true
                : discount.isActive === false;
        const matchesType = typeFilter === '' ? true : discount.type === typeFilter;
        const matchesValue =
            (valueMin === '' || discount.value >= Number(valueMin)) &&
            (valueMax === '' || discount.value <= Number(valueMax));
        const matchesDate =
            (dateFrom === '' || new Date(discount.startDate) >= new Date(dateFrom)) &&
            (dateTo === '' || new Date(discount.endDate) <= new Date(dateTo));
        return matchesKeyword && matchesStatus && matchesType && matchesValue && matchesDate;
    });

    const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);
    const paginatedDiscounts = filteredDiscounts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Thêm mới discount
    const handleAddDiscount = async () => {
        if(new Date(discountForm.startDate) < new Date()) {
            toast.error('Ngày bắt đầu không được nhỏ hơn ngày hiện tại!');
            return;
        }
        if (new Date(discountForm.endDate) < new Date(discountForm.startDate)) {
            toast.error('Ngày kết thúc không được nhỏ hơn ngày bắt đầu!');
            return;
        }
        try {
            const { _id, ...payload } = discountForm;
            const response = await axios.post(`${API_URL}/discount-codes`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDiscounts([response.data, ...discounts]); // Add new at top
            closeModal();
            toast.success('Thêm khuyến mãi thành công!');
        } catch (error) {
            toast.error(error.response?.data.errors[0]);
        }
    };

    // Chỉnh sửa discount
    const handleEditDiscount = async () => {
        if(new Date(discountForm.startDate) < new Date()) {
            toast.error('Ngày bắt đầu không được nhỏ hơn ngày hiện tại!');
            return;
        }
        if (new Date(discountForm.endDate) < new Date(discountForm.startDate)) {
            toast.error('Ngày kết thúc không được nhỏ hơn ngày bắt đầu!');
            return;
        }
        try {
            const response = await axios.put(
                `${API_URL}/discount-codes/${discountForm._id}`,
                discountForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDiscounts(
                discounts.map((discount) =>
                    discount._id === discountForm._id ? response.data : discount
                )
            );
            closeModal();
            toast.success('Cập nhật khuyến mãi thành công!');
        } catch (error) {
            console.error('Error updating discount:', error);
            toast.error(error.response?.data.errors[0]);
        }
    };

    // Xóa discount
    const handleDeleteDiscount = async () => {
        try {
            await axios.delete(`${API_URL}/discount-codes/${discountToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDiscounts(
                discounts.filter((discount) => discount._id !== discountToDelete._id)
            );
            closeDeleteModal();
            toast.success('Xóa khuyến mãi thành công!');
        } catch (error) {
            console.error('Error deleting discount:', error);
            toast.error('Lỗi khi xóa khuyến mãi!');
        }
    };

    // Mở modal
    const openModal = (discount = null) => {
        if (discount) {
            setIsEditing(true);
            setDiscountForm({
                ...discount,
                startDate: new Date(discount.startDate).toLocaleDateString('en-CA'),
                endDate: new Date(discount.endDate).toLocaleDateString('en-CA'),
            });
        } else {
            setIsEditing(false);
            setDiscountForm({
                _id: '',
                code: '',
                description: '',
                type: 'percent',
                value: 0,
                startDate: '',
                endDate: '',
                maxUses: 0,
                isActive: 'active',
            });
        }
        setIsModalOpen(true);
    };

    // Đóng modal
    const closeModal = () => {
        setIsModalOpen(false);
        setDiscountForm({
            _id: '',
            code: '',
            description: '',
            type: 'percent',
            value: 0,
            startDate: '',
            endDate: '',
            maxUses: 0,
            isActive: 'active',
        });
    };

    // Mở modal xác nhận xóa
    const openDeleteModal = (discount) => {
        setDiscountToDelete(discount);
        setIsDeleteModalOpen(true);
    };

    // Đóng modal xác nhận xóa
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDiscountToDelete(null);
    };

    // Cập nhật giá trị trong form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue;
        if (name === 'isActive') {
            newValue = value === '1' ? true : false;
        } else {
            newValue = value;
        }
        setDiscountForm({ ...discountForm, [name]: newValue });
    };

    return (
        <AdminPageLayout
            title="Quản lý khuyến mãi"
            actions={
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    <Icon icon="mdi:plus" width="20" />
                    Thêm khuyến mãi mới
                </button>
            }
        >
            <div className="p-6">
                {/* Search and Filter */}
                <div className="mb-6 flex gap-4 flex-wrap">
                    <input
                        type="text"
                        placeholder="Tìm kiếm khuyến mãi..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="">Tất cả loại</option>
                        <option value="percent">Phần trăm</option>
                        <option value="fixed">Số tiền cố định</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Giá trị từ"
                        value={valueMin}
                        onChange={(e) => setValueMin(e.target.value)}
                        className="w-28 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                        type="number"
                        placeholder="Giá trị đến"
                        value={valueMax}
                        onChange={(e) => setValueMax(e.target.value)}
                        className="w-28 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>

                {/* Discounts Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tên khuyến mãi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Loại
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giá trị
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời gian
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : paginatedDiscounts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    Không tìm thấy khuyến mãi nào
                                </td>
                            </tr>
                        ) : (
                            paginatedDiscounts.map((discount) => (
                                <tr key={discount._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {discount.code}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {discount.type === 'percent' ? 'Phần trăm' : 'Số tiền cố định'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {discount.type === 'percent'
                                            ? `${discount.value}%`
                                            : `${discount.value.toLocaleString('vi-VN')}đ`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(discount.startDate).toLocaleDateString('vi-VN')} -{' '}
                                        {new Date(discount.endDate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                discount.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {discount.isActive ? 'Đang Hoạt Động' : 'Không Hoạt Động'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openModal(discount)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <Icon icon="mdi:pencil" width="20" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(discount)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Icon icon="mdi:delete" width="20" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>

            {/* Modal Xác Nhận Xóa */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                        <h2 className="text-xl font-semibold mb-4">
                            Bạn có chắc chắn muốn xóa khuyến mãi này không?
                        </h2>
                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteDiscount}
                                className="px-4 py-2 bg-red-600 text-white rounded-md"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-full">
                        <h2 className="text-xl font-semibold mb-4">
                            {isEditing ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    name="code"
                                    value={discountForm.code}
                                    onChange={handleInputChange}
                                    placeholder="Mã khuyến mãi"
                                    className="w-full px-4 py-2 border rounded"
                                    required
                                />
                                <span className="text-red-500 ml-1">*</span>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="description"
                                    value={discountForm.description}
                                    onChange={handleInputChange}
                                    placeholder="Mô tả"
                                    className="w-full px-4 py-2 border rounded"
                                    required
                                />
                                <span className="text-red-500 ml-1">*</span>
                            </div>
                            <div>
                                <select
                                    name="type"
                                    value={discountForm.type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded"
                                    required
                                >
                                    <option value="percent">Phần trăm</option>
                                    <option value="fixed">Số tiền cố định</option>
                                </select>
                                <span className="text-red-500 ml-1">*</span>
                            </div>
                            <div>
                                <input
                                    type="number"
                                    name="value"
                                    value={discountForm.value}
                                    onChange={handleInputChange}
                                    placeholder="Giá trị"
                                    className="w-full px-4 py-2 border rounded"
                                    required
                                />
                                <span className="text-red-500 ml-1">*</span>
                            </div>
                            <div>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={discountForm.startDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded"
                                    required
                                />
                                <span className="text-red-500 ml-1">*</span>
                            </div>
                            <div>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={discountForm.endDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded"
                                    required
                                />
                                <span className="text-red-500 ml-1">*</span>
                            </div>
                            <div>
                                <input
                                    type="number"
                                    name="maxUses"
                                    value={discountForm.maxUses}
                                    onChange={handleInputChange}
                                    placeholder="Số lần sử dụng tối đa"
                                    className="w-full px-4 py-2 border rounded"
                                    required
                                />
                                <span className="text-red-500 ml-1">*</span>
                            </div>
                            <div>
                                <select
                                    name="isActive"
                                    value={discountForm.isActive ? '1' : '0'}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded"
                                    required
                                >
                                    <option value="1">Đang hoạt động</option>
                                    <option value="0">Không hoạt động</option>
                                </select>
                                <span className="text-red-500 ml-1">*</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                                <span className="text-red-500">*</span> Trường bắt buộc
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={isEditing ? handleEditDiscount : handleAddDiscount}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                {isEditing ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={3000} />

        </AdminPageLayout>
    );
};

export default Discounts;
