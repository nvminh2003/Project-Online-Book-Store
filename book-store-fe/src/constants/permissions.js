
export const permissions = {
    superadmin: [
        "manage_books", "manage_categories", "manage_discounts",
        "manage_users", "manage_orders", "approve_reviews",
        "manage_blog", "view_sales_reports", "access_system_logs"
    ],
    admin: {
        dev: [
            "manage_books", "manage_categories", "manage_blog", "access_system_logs"
        ],
        business: [
            "manage_discounts", "manage_orders", "approve_reviews", "view_sales_reports"
        ]
    }
};

export const getAdminRoutes = (role, department) => {
    if (role === 'superadmin') {
        return [
            { path: '/admin/books', label: 'Quản lý sách', permission: 'manage_books', icon: 'mdi:book-open-page-variant' },
            { path: '/admin/categories', label: 'Quản lý danh mục', permission: 'manage_categories', icon: 'mdi:shape-outline' },
            { path: '/admin/discounts', label: 'Quản lý khuyến mãi', permission: 'manage_discounts', icon: 'streamline-freehand:discount-sale-sign' },
            { path: '/admin/users', label: 'Quản lý người dùng', permission: 'manage_users', icon: 'mdi:account-multiple-outline' },
            { path: '/admin/orders', label: 'Quản lý đơn hàng', permission: 'manage_orders', icon: 'mdi:clipboard-list-outline' },
            { path: '/admin/reviews', label: 'Duyệt đánh giá', permission: 'approve_reviews', icon: 'mdi:star-check-outline' },
            { path: '/admin/blog', label: 'Quản lý blog', permission: 'manage_blog', icon: 'mdi:note-text-outline' },
            { path: '/admin/reports', label: 'Báo cáo doanh số', permission: 'view_sales_reports', icon: 'mdi:chart-bar' },

        ];
    }

    if (role === 'admin') {
        const routes = [];
        if (department === 'dev') {
            routes.push(
                { path: '/admin/books', label: 'Quản lý sách', permission: 'manage_books', icon: 'mdi:book-open-page-variant' },
                { path: '/admin/categories', label: 'Quản lý danh mục', permission: 'manage_categories', icon: 'mdi:shape-outline' },
                { path: '/admin/blog', label: 'Quản lý blog', permission: 'manage_blog', icon: 'mdi:note-text-outline' },
                // { path: '/admin/logs', label: 'Nhật ký hệ thống', permission: 'access_system_logs', icon: 'mdi:file-document-outline' }
            );
        }
        if (department === 'business') {
            routes.push(
                { path: '/admin/discounts', label: 'Quản lý khuyến mãi', permission: 'manage_discounts', icon: 'streamline-freehand:discount-sale-sign' },
                { path: '/admin/orders', label: 'Quản lý đơn hàng', permission: 'manage_orders', icon: 'mdi:clipboard-list-outline' },
                { path: '/admin/reviews', label: 'Duyệt đánh giá', permission: 'approve_reviews', icon: 'mdi:star-check-outline' },
                { path: '/admin/reports', label: 'Báo cáo doanh số', permission: 'view_sales_reports', icon: 'mdi:chart-bar' }
            );
        }
        return routes;
    }

    return [];
}; 