// utils/getPermissions.js
const rolePermissions = require("../utils/rolePermissions");

function getPermissions(role, department) {
    if (role === "superadmin") {
        return rolePermissions.superadmin;
    }
    if (role === "admindev") {
        return rolePermissions.admindev;
    }
    if (role === "adminbusiness") {
        return rolePermissions.adminbusiness;
    }
    return [];
}

module.exports = getPermissions;
