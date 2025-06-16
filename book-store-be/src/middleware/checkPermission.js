const rolePermissions = require('../utils/rolePermissions');

module.exports = (requiredPermission) => {
    return (req, res, next) => {
        const user = req.account;

        if (!user || !user.role) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const permissions = rolePermissions[user.role] || [];

        if (!permissions.includes(requiredPermission)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        next();
    };
};