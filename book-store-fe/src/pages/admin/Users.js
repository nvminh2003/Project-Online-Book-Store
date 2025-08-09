import React, { useState, useEffect } from 'react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import AdminTable from '../../components/admin/AdminTable';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminModal from '../../components/admin/AdminModal';
import AdminForm from '../../components/admin/AdminForm';
import accountService from '../../services/accountService';
import Icon from '../../components/common/Icon';
import { notifySuccess, notifyError, notifyLoading, notifyUpdateSuccess, notifyUpdateError, notifyDismiss } from '../../components/common/ToastManager';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
    const [userToToggleStatus, setUserToToggleStatus] = useState(null);

    const formFields = [
        {
            name: 'email',
            label: 'Email',
            type: 'text',
            required: true,
            placeholder: 'Nhập email'
        },
        {
            name: 'password',
            label: 'Mật khẩu',
            type: 'password',
            required: true,
            placeholder: 'Nhập mật khẩu',
            show: (values) => !selectedUser
        },
        {
            name: 'role',
            label: 'Vai trò',
            type: 'select',
            required: true,
            placeholder: 'Chọn vai trò',
            options: [
                { value: 'customer', label: 'Khách hàng' },
                { value: 'admindev', label: 'Admin Dev' },
                { value: 'adminbusiness', label: 'Admin Business' }
            ]
        },
        {
            name: 'info.fullName',
            label: 'Họ tên',
            type: 'text',
            required: true,
            placeholder: 'Nhập họ tên'
        },
        {
            name: 'info.phone',
            label: 'Số điện thoại',
            type: 'tel',
            required: true,
            placeholder: 'Nhập số điện thoại'
        },
        {
            name: 'info.address',
            label: 'Địa chỉ',
            type: 'text',
            placeholder: 'Nhập địa chỉ'
        },
        {
            name: 'info.gender',
            label: 'Giới tính',
            type: 'select',
            placeholder: 'Chọn giới tính',
            options: [
                { value: 'male', label: 'Nam' },
                { value: 'female', label: 'Nữ' },
                { value: 'other', label: 'Khác' }
            ]
        }
    ];

    const columns = [
        {
            key: 'email',
            label: 'Email',
        },
        {
            key: 'info',
            label: 'Họ tên',
            render: (item) => item.info?.fullName || '-'
        },
        {
            key: 'info',
            label: 'Số điện thoại',
            render: (item) => item.info?.phone || '-'
        },
        {
            key: 'info',
            label: 'Địa chỉ',
            width: '200px',
            render: (item) => (
                <div title={item.info?.address || '-'}
                    className="truncate whitespace-nowrap overflow-hidden">
                    {item.info?.address || '-'}
                </div>
            )
        },
        {
            key: 'role',
            label: 'Vai trò',
            width: '120px',
            render: (item) => {
                switch (item.role) {
                    case 'superadmin':
                        return 'Super Admin';
                    case 'admindev':
                        return 'Admin Dev';
                    case 'adminbusiness':
                        return 'Admin Business';
                    default:
                        return 'Khách hàng';
                }
            }
        },
        {
            key: 'isActive',
            label: 'Trạng thái',
            render: (item) => (
                <span className={`px-2 py-1 rounded-full text-sm ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.isActive ? 'Hoạt động' : 'Đã khóa'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (item) => (
                <div className="flex gap-2">
                    {item.role !== 'superadmin' && (
                        <button
                            onClick={() => handleToggleStatus(item)}
                            className={`${item.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                        >
                            {item.isActive ? 'Khóa' : 'Mở khóa'}
                        </button>
                    )}
                    <button
                        onClick={() => handleEditUser(item)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <Icon icon="fluent:edit-20-filled" width="20" height="20" />
                    </button>
                    {/*
                    <button
                        onClick={() => handleDeleteUser(item)}
                        className="text-red-600 hover:text-red-800"
                        disabled={item.role === 'superadmin'}
                        title={item.role === 'superadmin' ? 'Không thể xóa Super Admin' : ''}
                    >
                        <Icon icon="fluent:delete-20-filled" width="20" height="20" />
                    </button>
                    */}
                </div>
            )
        }
    ];

    const fetchUsers = async () => {
        const toastId = notifyLoading('Đang tải dữ liệu...');
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
            };

            if (searchTerm) {
                params.searchTerm = searchTerm;
            }
            if (roleFilter) {
                params.role = roleFilter;
            }
            if (statusFilter !== '') {
                params.isActive = statusFilter;
            }

            const response = await accountService.getAllUsers(params);
            setUsers(response.data);
            setTotalPages(response.pagination.totalPages);
            setTotalItems(response.pagination.total);
            setCurrentPage(response.pagination.page);
            notifyDismiss(toastId);
        } catch (error) {
            notifyUpdateError(toastId, error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm, roleFilter, statusFilter]);

    const handleAddUser = () => {
        setSelectedUser(null);
        setFormValues({
            role: '',
            'info.fullName': '',
            'info.phone': '',
            'info.address': '',
            'info.gender': undefined
        });
        setFormErrors({});
        setGeneralError('');
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setFormValues({
            email: user.email,
            role: user.role,
            'info.fullName': user.info?.fullName || '',
            'info.phone': user.info?.phone || '',
            'info.address': user.info?.address || '',
            'info.gender': user.info?.gender || undefined
        });
        setFormErrors({});
        setGeneralError('');
        setIsModalOpen(true);
    };

    const handleToggleStatus = (user) => {
        setUserToToggleStatus(user);
        setIsToggleStatusModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!userToToggleStatus) return;

        const user = userToToggleStatus;
        const toastId = notifyLoading(`Đang ${user.isActive ? 'khóa' : 'mở khóa'} tài khoản...`);
        try {
            await accountService.updateUser(user._id, { isActive: !user.isActive });
            notifyUpdateSuccess(toastId, `${user.isActive ? 'Khóa' : 'Mở khóa'} tài khoản thành công`);
            fetchUsers();
            setIsToggleStatusModalOpen(false);
            setUserToToggleStatus(null);
        } catch (error) {
            notifyUpdateError(toastId, error.message);
            setIsToggleStatusModalOpen(false);
            setUserToToggleStatus(null);
        }
    };

    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setIsConfirmModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        const toastId = notifyLoading('Đang xóa người dùng...');
        try {
            await accountService.deleteUser(userToDelete._id);
            notifyUpdateSuccess(toastId, 'Xóa người dùng thành công');
            fetchUsers();
            setIsConfirmModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            notifyUpdateError(toastId, error.message);
            setIsConfirmModalOpen(false);
            setUserToDelete(null);
        }
    };

    const handleFormChange = (name, value) => {
        setFormValues(prev => ({
            ...prev,
            [name]: (name === 'info.gender' && value === '') ? undefined : value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const toastId = notifyLoading(selectedUser ? 'Đang cập nhật...' : 'Đang thêm mới...');
        setFormErrors({});
        setGeneralError('');

        // 1. Validate định dạng email trước
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formValues.email || !emailRegex.test(formValues.email)) {
            setFormErrors({ email: 'Email không hợp lệ. Vui lòng nhập đúng định dạng, ví dụ: example@gmail.com' });
            notifyDismiss(toastId);
            return;
        }

        // 2. Gửi request lên BE để kiểm tra email đã tồn tại chưa
        try {
            const submitData = {
                email: formValues.email,
                role: formValues.role,
                password: formValues.password,
                info: {
                    fullName: formValues['info.fullName'],
                    phone: formValues['info.phone'],
                    address: formValues['info.address'],
                    gender: formValues['info.gender']
                }
            };

            if (selectedUser) {
                delete submitData.password;
            }

            if (selectedUser) {
                await accountService.updateUser(selectedUser._id, submitData);
                notifyUpdateSuccess(toastId, 'Cập nhật người dùng thành công');
            } else {
                await accountService.createAccountByAdmin(submitData);
                notifyUpdateSuccess(toastId, 'Thêm người dùng thành công');
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            let displayErrorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.';
            if (error.response && error.response.data && error.response.data.errors) {
                setFormErrors(error.response.data.errors);
                notifyDismiss(toastId);
                return;
            }
            displayErrorMessage = error.message || displayErrorMessage;

            // Nếu lỗi là email đã tồn tại thì chỉ báo lỗi email
            if (displayErrorMessage.includes("Email đã tồn tại")) {
                setFormErrors({ email: displayErrorMessage });
                notifyDismiss(toastId);
                return;
            }

            // Nếu không phải lỗi email, validate các trường còn lại ở FE
            const formErrors = {};
            const validRoles = ['customer', 'admindev', 'adminbusiness'];
            if (!formValues.role || !validRoles.includes(formValues.role)) {
                formErrors['role'] = 'Vai trò không hợp lệ';
            }
            if (!formValues['info.fullName'] || formValues['info.fullName'].trim() === "") {
                formErrors['info.fullName'] = "Họ tên là bắt buộc";
            }
            const phone = formValues['info.phone'];
            if (!phone || phone.trim() === "") {
                formErrors['info.phone'] = "Số điện thoại là bắt buộc";
            } else if (!/^[0-9]{10}$/.test(phone)) {
                formErrors['info.phone'] = "Số điện thoại phải có đúng 10 chữ số";
            }
            if (Object.keys(formErrors).length > 0) {
                setFormErrors(formErrors);
                notifyDismiss(toastId);
                return;
            }

            setGeneralError(displayErrorMessage);
            notifyDismiss(toastId);
            notifyUpdateError(toastId, displayErrorMessage);
        }
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    return (
        <AdminPageLayout
            title="Quản lý người dùng"
            actions={
                <button
                    onClick={handleAddUser}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Thêm người dùng
                </button>
            }
        >
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                    <div className="md:col-span-4">
                        <AdminSearch
                            placeholder="Tìm kiếm email, tên, sđt, địa chỉ"
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={() => handleSearch(searchTerm)}
                        />
                    </div>
                    <div className="md:col-span-8 flex gap-4">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="flex-1 h-[40px] px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="customer">Khách hàng</option>
                            <option value="admindev">Admin Dev</option>
                            <option value="adminbusiness">Admin Business</option>
                            <option value="superadmin">Super Admin</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 h-[40px] px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="true">Hoạt động</option>
                            <option value="false">Đã khóa</option>
                        </select>

                        {(searchTerm || roleFilter || statusFilter !== '') && (
                            <button
                                onClick={handleClearFilters}
                                className="h-[40px] px-4 rounded-lg text-white font-medium bg-gray-600 hover:bg-gray-700"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </div>

                <AdminTable
                    columns={columns}
                    data={users}
                    loading={loading}
                    actions={false}
                />

                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={setCurrentPage}
                />

                <AdminModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={selectedUser ? 'Cập nhật thông tin người dùng' : 'Thêm người dùng'}
                    size='lg'
                >
                    <form onSubmit={handleSubmit}>
                        {generalError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {generalError}
                            </div>
                        )}
                        <AdminForm
                            fields={formFields}
                            values={formValues}
                            onChange={handleFormChange}
                            errors={formErrors}
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                {selectedUser ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </form>
                </AdminModal>

                <AdminModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => {
                        setIsConfirmModalOpen(false);
                        setUserToDelete(null);
                    }}
                    title="Xác nhận xóa"
                >
                    <p className="text-gray-700 mb-4">
                        Bạn có chắc chắn muốn xóa tài khoản{" "}
                        <span className="font-semibold">{userToDelete?.email}</span> không?
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsConfirmModalOpen(false);
                                setUserToDelete(null);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={confirmDeleteUser}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Xóa
                        </button>
                    </div>
                </AdminModal>

                <AdminModal
                    isOpen={isToggleStatusModalOpen}
                    onClose={() => {
                        setIsToggleStatusModalOpen(false);
                        setUserToToggleStatus(null);
                    }}
                    title={userToToggleStatus?.isActive ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
                >
                    <p className="text-gray-700 mb-4">
                        Bạn có chắc chắn muốn {userToToggleStatus?.isActive ? 'khóa' : 'mở khóa'} tài khoản {" "}
                        <span className="font-semibold">{userToToggleStatus?.email}</span> không?
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsToggleStatusModalOpen(false);
                                setUserToToggleStatus(null);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={confirmToggleStatus}
                            className={`px-4 py-2 rounded-md text-white font-medium ${userToToggleStatus?.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {userToToggleStatus?.isActive ? 'Khóa' : 'Mở khóa'}
                        </button>
                    </div>
                </AdminModal>
            </div>
        </AdminPageLayout>
    );
};

export default Users;