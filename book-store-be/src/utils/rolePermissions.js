// config/rolePermissions.js
module.exports = {
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