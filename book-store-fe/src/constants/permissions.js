export const permissions = {
    superadmin: [
        "CREATE_USER", "VIEW_USER", "VIEW_USER_BY_ID", "UPDATE_USER", "DELETE_USER",
        "VIEW_ADMIN_ACTIVITY"
    ],
    admindev: [
        "CREATE_BOOK", "UPDATE_BOOK", "DELETE_BOOK",
        "CREATE_CATEGORY", "UPDATE_CATEGORY", "DELETE_CATEGORY",
        "CREATE_BLOG", "UPDATE_BLOG", "DELETE_BLOG"
    ],
    adminbusiness: [
        "CREATE_DISCOUNT", "UPDATE_DISCOUNT", "DELETE_DISCOUNT",
        "CREATE_ORDER", "UPDATE_ORDER", "DELETE_ORDER", "VIEW_SALES_REPORT",
        "VIEW_REVIEW"
    ]
};

export const getAdminRoutes = (role) => {
    if (role === 'superadmin') {
        return [
            { path: '/admin', label: 'Dashboard', icon: 'mdi:view-dashboard' },
            { path: '/admin/users', label: 'Quản lý người dùng', permission: 'CREATE_USER', icon: 'mdi:account-multiple-outline' },
            { path: '/admin/view-admin-activity', label: 'Quản lý admin activity', permission: 'VIEW_ADMIN_ACTIVITY', icon: 'mdi:clipboard-list-outline' },
        ];
    }

    if (role === 'admindev') {
        return [
            { path: '/admin', label: 'Dashboard', icon: 'mdi:view-dashboard' },
            { path: '/admin/books', label: 'Quản lý sách', permission: 'CREATE_BOOK', icon: 'mdi:book-open-page-variant' },
            { path: '/admin/categories', label: 'Quản lý danh mục', permission: 'CREATE_CATEGORY', icon: 'mdi:shape-outline' },
            { path: '/admin/blog', label: 'Quản lý blog', permission: 'CREATE_BLOG', icon: 'mdi:note-text-outline' },
        ];
    }

    if (role === 'adminbusiness') {
        return [
            { path: '/admin', label: 'Dashboard', icon: 'mdi:view-dashboard' },
            // { path: '/admin/discounts', label: 'Quản lý khuyến mãi', permission: 'CREATE_DISCOUNT', icon: 'streamline-freehand:discount-sale-sign' },
            { path: '/admin/orders', label: 'Quản lý đơn hàng', permission: 'CREATE_ORDER', icon: 'mdi:clipboard-list-outline' },
            { path: '/admin/review', label: 'Quản lý đánh giá', permission: 'VIEW_REVIEW', icon: 'mdi:star-outline' },
            { path: '/admin/reports', label: 'Báo cáo doanh số', permission: 'VIEW_SALES_REPORT', icon: 'mdi:chart-bar' }
        ];
    }

    return [];
}; 