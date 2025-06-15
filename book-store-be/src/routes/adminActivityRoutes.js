const express = require('express');
const router = express.Router();
const adminActivityController = require('../controllers/adminActivityController');
const { checkAuthMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const A = require('../utils/actionTypes');
const checkPermission = require('../middleware/checkPermission');

// Get all activities with filters
router.get('/activities',
    checkAuthMiddleware,
    authorizeRole(['superadmin']),
    checkPermission(A.VIEW_ADMIN_ACTIVITY),
    adminActivityController.getAllActivities
);

// Get activities by date range
router.get('/activities/date-range',
    checkAuthMiddleware,
    authorizeRole(['superadmin']),
    checkPermission(A.VIEW_ADMIN_ACTIVITY),
    adminActivityController.getActivitiesByDateRange
);

// Get activities by admin ID
router.get('/activities/admin/:adminId',
    checkAuthMiddleware,
    authorizeRole(['superadmin']),
    checkPermission(A.VIEW_ADMIN_ACTIVITY),
    adminActivityController.getActivitiesByAdminId
);

// Search activities
router.get('/activities/search',
    checkAuthMiddleware,
    authorizeRole(['superadmin']),
    checkPermission(A.VIEW_ADMIN_ACTIVITY),
    adminActivityController.searchActivities
);

module.exports = router; 