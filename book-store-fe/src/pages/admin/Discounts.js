import React, { useState, useEffect } from 'react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import { Icon } from '@iconify/react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL_BACKEND;

const Discounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Điều khiển modal
    const [isEditing, setIsEditing] = useState(false); // Kiểm tra nếu đang chỉnh sửa hay không
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Điều khiển modal xác nhận xóa
    const [discountForm, setDiscountForm] = useState({
        id: '',
        code: '',
        description: '',
        type: 'percentage',
        value: 0,
        startDate: '',
        endDate: '',
        maxUses: 0,
        status: 'active',
    });
    const [discountToDelete, setDiscountToDelete] = useState(null); // Discount cần xóa

    // Lấy danh sách discount từ API
    useEffect(() => {
        const fetchDiscounts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/discount-codes`);
                setDiscounts(response.data);
            } catch (error) {
                console.error('Error fetching discounts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDiscounts();
    }, []);

    // Thêm mới discount
    const handleAddDiscount = async () => {
        try {
            const response = await axios.post(`${API_URL}/discount-codes`, discountForm);
            setDiscounts([...discounts, response.data]);
            closeModal();
        } catch (error) {
            console.error('Error adding discount:', error);
        }
    };

    // Chỉnh sửa discount
    const handleEditDiscount = async () => {
        try {
            const response = await axios.put(`${API_URL}/discount-codes/${discountForm.id}`, discountForm);
            setDiscounts(discounts.map((discount) => discount.id === discountForm.id ? response.data : discount));
            closeModal();
        } catch (error) {
            console.error('Error updating discount:', error);
        }
    };

    // Xóa discount
    const handleDeleteDiscount = async () => {
        try {
            await axios.delete(`${API_URL}/discount-codes/${discountToDelete.id}`);
            setDiscounts(discounts.filter((discount) => discount.id !== discountToDelete.id));
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting discount:', error);
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
                id: '',
                code: '',
                description: '',
                type: 'percentage',
                value: 0,
                startDate: '',
                endDate: '',
                maxUses: 0,
                status: 'active',
            });
        }
        setIsModalOpen(true);
    };

    // Đóng modal
    const closeModal = () => {
        setIsModalOpen(false);
        setDiscountForm({
            id: '',
            code: '',
            description: '',
            type: 'percentage',
            value: 0,
            startDate: '',
            endDate: '',
            maxUses: 0,
            status: 'active',
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
        setDiscountForm({ ...discountForm, [name]: value });
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
              <div className="mb-6 flex gap-4">
                  <input
                    type="text"
                    placeholder="Tìm kiếm khuyến mãi..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <select className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300">
                      <option value="">Tất cả trạng thái</option>
                      <option value="active">Đang diễn ra</option>
                      <option value="upcoming">Sắp diễn ra</option>
                      <option value="ended">Đã kết thúc</option>
                  </select>
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
                      ) : discounts.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                Chưa có khuyến mãi nào
                            </td>
                        </tr>
                      ) : (
                        discounts.map((discount) => (
                          <tr key={discount.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                      {discount.name}
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {discount.type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {discount.type === 'percentage'
                                    ? `${discount.value}%`
                                    : `${discount.value.toLocaleString('vi-VN')}đ`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(discount.startDate).toLocaleDateString('vi-VN')} - {new Date(discount.endDate).toLocaleDateString('vi-VN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${discount.status === 'active'
                                              ? 'bg-green-100 text-green-800'
                                              : discount.status === 'upcoming'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                                {discount.status === 'active'
                                                  ? 'Đang diễn ra'
                                                  : discount.status === 'upcoming'
                                                    ? 'Sắp diễn ra'
                                                    : 'Đã kết thúc'}
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
      </AdminPageLayout>
    );
};

export default Discounts;
