const A = require('./actionTypes');
module.exports = {
    superadmin: [
        A.CREATE_USER,
        A.VIEW_USER,
        A.VIEW_USER_BY_ID,
        A.UPDATE_USER,
        A.DELETE_USER,
        A.VIEW_ADMIN_ACTIVITY,
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
    ],
    adminbusiness: [
        A.CREATE_DISCOUNT,
        A.UPDATE_DISCOUNT,
        A.DELETE_DISCOUNT,
        A.CREATE_ORDER,
        A.UPDATE_ORDER,
        A.DELETE_ORDER,
        A.VIEW_SALES_REPORT
    ]
};