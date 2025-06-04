// utils/getPermissions.js
const rolePermissions = require("../utils/rolePermissions");

function getPermissions(role, department) {
    if (role === "superadmin") {
        return rolePermissions.superadmin;
    }
    if (role === "admin" && department) {
        return rolePermissions.admin[department] || [];
    }
    return [];
}

module.exports = getPermissions;
