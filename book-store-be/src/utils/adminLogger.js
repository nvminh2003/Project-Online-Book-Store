const AdminActivityLog = require("../models/AdminActivityLog");

/**
 * Log admin activity for audit trail
 * @param {String} adminId - ID of the admin performing the action
 * @param {String} action - Action type (e.g., CREATE_DISCOUNT_CODE, UPDATE_DISCOUNT_CODE)
 * @param {String} description - Human-readable description of the action
 * @param {Object} metadata - Additional data related to the action
 */
const logAdminActivity = async (
  adminId,
  action,
  description,
  metadata = {}
) => {
  try {
    const activityLog = new AdminActivityLog({
      admin: adminId,
      action,
      description,
      metadata,
      timestamp: new Date(),
    });

    await activityLog.save();
    console.log(`Admin activity logged: ${action} by ${adminId}`);
  } catch (error) {
    console.error("Failed to log admin activity:", error);
    // Don't throw error to avoid breaking the main operation
  }
};

module.exports = {
  logAdminActivity,
};
