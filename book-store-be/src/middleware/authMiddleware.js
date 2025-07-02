const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Account = require("../models/accountModel");
dotenv.config();

const checkAuthMiddleware = async (req, res, next) => {
  try {
    const token =
      req.headers.token?.split(" ")[1] ||
      req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const user = await Account.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        status: "Error",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        message: "Account is deactivated",
        status: "Error",
      });
    }

    req.account = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authorizeRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      let token =
        req.headers.token?.split(" ")[1] ||
        req.headers.authorization?.split(" ")[1];

      if (!token) {
        console.log("❌ No token provided");
        return res
          .status(401)
          .json({ message: "Access denied. No token provided." });
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      const user = await Account.findById(decoded.id).select("-password");

      console.log("🔍 Auth Debug:");
      console.log("- User ID:", decoded.id);
      console.log("- User found:", !!user);
      console.log("- User role:", user?.role);
      console.log("- Allowed roles:", allowedRoles);
      console.log("- Role check passed:", allowedRoles.includes(user?.role));

      if (!user || !user.isActive) {
        console.log("❌ User not found or inactive");
        return res
          .status(401)
          .json({ message: "Invalid or inactive account." });
      }

      // Check role
      if (!allowedRoles.includes(user.role)) {
        console.log(
          `❌ Role check failed: ${user.role} not in [${allowedRoles.join(
            ", "
          )}]`
        );
        return res.status(403).json({
          message: "Access denied. Role not allowed.",
          userRole: user.role,
          allowedRoles: allowedRoles,
        });
      }

      console.log("✅ Authorization successful");
      req.account = user;
      next();
    } catch (err) {
      console.log("❌ Auth error:", err.message);
      return res.status(401).json({ message: "Invalid token." });
    }
  };
};

module.exports = {
  checkAuthMiddleware, // for any authenticated user
  authorizeRole,
};
