const A = require('./actionTypes');
module.exports = {
    superadmin: [
        A.CREATE_USER,
        A.VIEW_USER,
        A.VIEW_USER_BY_ID,
        A.UPDATE_USER,
        A.DELETE_USER,
        A.VIEW_ADMIN_ACTIVITY,
        A.VIEW_SYSTEM_LOGS
    ],
    admindev: [
        A.CREATE_BOOK,
        A.UPDATE_BOOK,
        A.DELETE_BOOK,
        A.CREATE_CATEGORY,
        A.UPDATE_CATEGORY,
        A.DELETE_CATEGORY,
        A.CREATE_BLOG,
        A.UPDATE_BLOG,
        A.DELETE_BLOG,
        A.ACCESS_SYSTEM_LOGS
    ],
    adminbusiness: [
        A.CREATE_DISCOUNT,
        A.UPDATE_DISCOUNT,
        A.DELETE_DISCOUNT,
        A.CREATE_ORDER,
        A.UPDATE_ORDER,
        A.DELETE_ORDER,
        A.APPROVE_REVIEW,
        A.VIEW_SALES_REPORT
    ]
};