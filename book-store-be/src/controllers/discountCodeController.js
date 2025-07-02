const DiscountCode = require("../models/discountCodeModel");
const Book = require("../models/bookModel");
const Category = require("../models/categoryModel");
const Account = require("../models/accountModel");
const { logAdminActivity } = require("../utils/adminLogger");

// Helper function to generate unique discount codes
const generateDiscountCode = async (prefix = "SALE", length = 6) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    let code = prefix;
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const existingCode = await DiscountCode.findOne({ code });
    if (!existingCode) {
      return code;
    }
    attempts++;
  }

  // Fallback with timestamp
  return `${prefix}${Date.now().toString().slice(-6)}`;
};

// Helper function to calculate discount amount
const calculateDiscountAmount = (
  discount,
  orderValue,
  eligibleValue = null
) => {
  const valueToUse = eligibleValue !== null ? eligibleValue : orderValue;
  let discountAmount = 0;

  if (discount.type === "percent") {
    discountAmount = (valueToUse * discount.value) / 100;
  } else {
    discountAmount = discount.value;
  }

  // Apply max discount cap if specified
  if (
    discount.maxDiscountAmount &&
    discountAmount > discount.maxDiscountAmount
  ) {
    discountAmount = discount.maxDiscountAmount;
  }

  return Math.min(discountAmount, orderValue);
};

// Helper function to validate discount eligibility
const validateDiscountEligibility = async (
  discount,
  userId,
  orderValue,
  items = []
) => {
  const errors = [];

  // Check if discount is active and within date range
  if (!discount.isValidNow) {
    if (discount.isExpired) {
      errors.push("Discount code has expired");
    } else if (discount.isNotYetActive) {
      errors.push("Discount code is not yet active");
    } else {
      errors.push("Discount code is not active");
    }
  }

  // Check max uses
  if (discount.maxUses && discount.usesCount >= discount.maxUses) {
    errors.push("Discount code has reached maximum uses");
  }

  // Check min order value
  if (discount.minOrderValue && orderValue < discount.minOrderValue) {
    errors.push(
      `Minimum order value of ${discount.minOrderValue.toLocaleString(
        "vi-VN"
      )}đ required`
    );
  }

  // Check max uses per user
  if (discount.maxUsesPerUser && userId) {
    const userUsageCount = discount.usedBy.filter(
      (usage) => usage.user.toString() === userId.toString()
    ).length;

    if (userUsageCount >= discount.maxUsesPerUser) {
      errors.push("You have reached the maximum uses for this discount code");
    }
  }

  // Check book/category eligibility
  if (items && items.length > 0) {
    if (discount.books && discount.books.length > 0) {
      const eligibleItems = items.filter((item) =>
        discount.books.some(
          (bookId) => bookId.toString() === item.book.toString()
        )
      );
      if (eligibleItems.length === 0) {
        errors.push("No eligible books in cart for this discount code");
      }
    }

    if (discount.categories && discount.categories.length > 0) {
      // This would require populating item.book.category
      // For now, we'll skip this check in the validation function
    }
  }

  return errors;
};

// Create a new discount code (Admin only)
const createDiscountCode = async (req, res) => {
  try {
    const {
      code,
      description,
      type,
      value,
      startDate,
      endDate,
      maxUses,
      maxUsesPerUser,
      minOrderValue,
      maxDiscountAmount,
      books,
      categories,
      autoGenerate,
      prefix,
      quantity = 1,
    } = req.body;

    // Validate required fields
    if (!description || !type || !value || !startDate || !endDate) {
      return res.status(400).json({
        message: "Description, type, value, startDate and endDate are required",
        status: "Error",
      });
    }

    // Validate type
    if (!["percent", "fixed"].includes(type)) {
      return res.status(400).json({
        message: "Type must be either 'percent' or 'fixed'",
        status: "Error",
      });
    }

    // Validate value
    if (type === "percent" && (value < 0 || value > 100)) {
      return res.status(400).json({
        message: "Percent value must be between 0 and 100",
        status: "Error",
      });
    }

    if (value <= 0) {
      return res.status(400).json({
        message: "Value must be greater than 0",
        status: "Error",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({
        message: "End date must be after start date",
        status: "Error",
      });
    }

    // Auto-generate codes or create single code
    const discountCodes = [];
    const codeQuantity = autoGenerate ? Math.max(1, quantity) : 1;

    for (let i = 0; i < codeQuantity; i++) {
      let finalCode;

      if (autoGenerate) {
        finalCode = await generateDiscountCode(prefix || "SALE");
      } else {
        if (!code) {
          return res.status(400).json({
            message: "Code is required when not auto-generating",
            status: "Error",
          });
        }
        finalCode = code.toUpperCase();

        // Check if manual code already exists
        const existingCode = await DiscountCode.findOne({ code: finalCode });
        if (existingCode) {
          return res.status(400).json({
            message: "Discount code already exists",
            status: "Error",
          });
        }
      }

      const newDiscountCode = new DiscountCode({
        code: finalCode,
        description,
        type,
        value,
        startDate: start,
        endDate: end,
        maxUses,
        maxUsesPerUser,
        minOrderValue: minOrderValue || 0,
        maxDiscountAmount,
        books: books || [],
        categories: categories || [],
        autoGenerated: !!autoGenerate,
        prefix: autoGenerate ? prefix : undefined,
        createdBy: req.account._id,
      });

      await newDiscountCode.save();
      discountCodes.push(newDiscountCode);
    }

    // Log admin activity
    await logAdminActivity(
      req.account._id,
      "CREATE_DISCOUNT_CODE",
      `Created ${discountCodes.length} discount code(s)`,
      { codes: discountCodes.map((dc) => dc.code) }
    );

    res.status(201).json({
      message: `${discountCodes.length} discount code(s) created successfully`,
      status: "Success",
      data: discountCodes.length === 1 ? discountCodes[0] : discountCodes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Get all discount codes with advanced filtering
const getAllDiscountCodes = async (req, res) => {
  try {
    console.log("getAllDiscountCodes called with user:", req.account?.role);
    console.log("Query params:", req.query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query = {};
    const {
      search,
      status,
      type,
      category,
      minValue,
      maxValue,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Role-based filtering
    if (req.account?.role !== "admin" && req.account?.role !== "superadmin") {
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    }

    // Search by code or description
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) {
      const now = new Date();
      switch (status) {
        case "active":
          query.isActive = true;
          query.startDate = { $lte: now };
          query.endDate = { $gte: now };
          break;
        case "expired":
          query.endDate = { $lt: now };
          break;
        case "upcoming":
          query.startDate = { $gt: now };
          break;
        case "inactive":
          query.isActive = false;
          break;
      }
    }

    // Filter by type
    if (type && ["percent", "fixed"].includes(type)) {
      query.type = type;
    }

    // Filter by value range
    if (minValue || maxValue) {
      query.value = {};
      if (minValue) query.value.$gte = parseFloat(minValue);
      if (maxValue) query.value.$lte = parseFloat(maxValue);
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Filter by category
    if (category) {
      query.categories = category;
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = [
      "createdAt",
      "code",
      "value",
      "startDate",
      "endDate",
      "usesCount",
    ];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const discountCodes = await DiscountCode.find(query)
      .populate("books", "title price sellingPrice")
      .populate("categories", "name")
      .populate("createdBy", "email customerInfo.fullName")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await DiscountCode.countDocuments(query);

    // Calculate statistics for admin
    let statistics = null;
    if (req.account?.role === "admin" || req.account?.role === "superadmin") {
      const now = new Date();
      const stats = await DiscountCode.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$isActive", true] },
                      { $lte: ["$startDate", now] },
                      { $gte: ["$endDate", now] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            expired: {
              $sum: {
                $cond: { if: { $lt: ["$endDate", now] }, then: 1, else: 0 },
              },
            },
            totalUses: { $sum: "$usesCount" },
            avgValue: { $avg: "$value" },
          },
        },
      ]);

      statistics = stats[0] || {
        total: 0,
        active: 0,
        expired: 0,
        totalUses: 0,
        avgValue: 0,
      };
    }

    res.status(200).json({
      message: "Get discount codes successfully",
      status: "Success",
      data: {
        discountCodes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
        statistics,
        filters: {
          search,
          status,
          type,
          category,
          minValue,
          maxValue,
          dateFrom,
          dateTo,
          sortBy,
          sortOrder,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Get discount code by ID
const getDiscountCodeById = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.account?.role !== "admin") {
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    }

    const discountCode = await DiscountCode.findOne(query).populate(
      "books",
      "title price"
    );

    if (!discountCode) {
      return res.status(404).json({
        message: "Discount code not found",
        status: "Error",
      });
    }

    res.status(200).json({
      message: "Get discount code successfully",
      status: "Success",
      data: discountCode,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Update discount code (Admin only)
const updateDiscountCode = async (req, res) => {
  try {
    const {
      code,
      description,
      type,
      value,
      startDate,
      endDate,
      isActive,
      maxUses,
      books,
    } = req.body;

    const discountCode = await DiscountCode.findById(req.params.id);

    if (!discountCode) {
      return res.status(404).json({
        message: "Discount code not found",
        status: "Error",
      });
    }

    // Validate type if provided
    if (type && !["percent", "fixed"].includes(type)) {
      return res.status(400).json({
        message: "Type must be either 'percent' or 'fixed'",
        status: "Error",
      });
    }

    // Validate value if provided
    if (value && type === "percent" && (value < 0 || value > 100)) {
      return res.status(400).json({
        message: "Percent value must be between 0 and 100",
        status: "Error",
      });
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return res.status(400).json({
          message: "End date must be after start date",
          status: "Error",
        });
      }
    }

    // Check if new code already exists
    if (code && code !== discountCode.code) {
      const existingCode = await DiscountCode.findOne({ code });
      if (existingCode) {
        return res.status(400).json({
          message: "Discount code already exists",
          status: "Error",
        });
      }
    }

    // Update discount code fields
    const updatedFields = {
      code: code || discountCode.code,
      description: description || discountCode.description,
      type: type || discountCode.type,
      value: value || discountCode.value,
      startDate: startDate ? new Date(startDate) : discountCode.startDate,
      endDate: endDate ? new Date(endDate) : discountCode.endDate,
      isActive: isActive !== undefined ? isActive : discountCode.isActive,
      maxUses: maxUses || discountCode.maxUses,
      books: books || discountCode.books,
    };

    const updatedDiscountCode = await DiscountCode.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    ).populate("books", "title price");

    res.status(200).json({
      message: "Discount code updated successfully",
      status: "Success",
      data: updatedDiscountCode,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Delete discount code (Admin only)
const deleteDiscountCode = async (req, res) => {
  try {
    const discountCode = await DiscountCode.findById(req.params.id);

    if (!discountCode) {
      return res.status(404).json({
        message: "Discount code not found",
        status: "Error",
      });
    }

    await DiscountCode.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Discount code deleted successfully",
      status: "Success",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Enhanced validate discount code with comprehensive validation
const validateDiscountCode = async (req, res) => {
  try {
    const { code, items = [], userId } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Discount code is required",
        status: "Error",
      });
    }

    const discountCode = await DiscountCode.findOne({
      code: code.toUpperCase(),
    })
      .populate("books", "title price sellingPrice category")
      .populate("categories", "name");

    if (!discountCode) {
      return res.status(404).json({
        message: "Invalid discount code",
        status: "Error",
      });
    }

    // Calculate order value from items
    const orderValue = items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Use current user ID if not provided
    const userIdToCheck = userId || req.account?._id;

    // Validate eligibility
    const validationErrors = await validateDiscountEligibility(
      discountCode,
      userIdToCheck,
      orderValue,
      items
    );

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: validationErrors[0], // Return first error
        status: "Error",
        errors: validationErrors,
      });
    }

    // Calculate eligible items and discount amount
    let eligibleItems = items;
    let eligibleValue = orderValue;

    // Filter by specific books if specified
    if (discountCode.books && discountCode.books.length > 0) {
      eligibleItems = items.filter((item) =>
        discountCode.books.some(
          (book) => book._id.toString() === item.book.toString()
        )
      );
      eligibleValue = eligibleItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    }

    // Filter by categories if specified (requires book population)
    if (discountCode.categories && discountCode.categories.length > 0) {
      // This would need book.category to be populated in the items
      // For now, we'll include all items
    }

    const discountAmount = calculateDiscountAmount(
      discountCode,
      orderValue,
      eligibleValue
    );

    res.status(200).json({
      message: "Discount code is valid",
      status: "Success",
      data: {
        discountCode: {
          code: discountCode.code,
          description: discountCode.description,
          type: discountCode.type,
          value: discountCode.value,
          minOrderValue: discountCode.minOrderValue,
          maxDiscountAmount: discountCode.maxDiscountAmount,
          remainingUses: discountCode.remainingUses,
        },
        validation: {
          isValid: true,
          orderValue,
          eligibleValue,
          discountAmount,
          finalAmount: Math.max(0, orderValue - discountAmount),
          eligibleItemsCount: eligibleItems.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Apply discount code to cart/order
const applyDiscountCode = async (req, res) => {
  try {
    const { code, items = [] } = req.body;
    const userId = req.account._id;

    const validation = await validateDiscountCode(
      { body: { code, items, userId } },
      res
    );

    // If validation failed, response was already sent
    if (!validation) return;

    const discountCode = await DiscountCode.findOne({
      code: code.toUpperCase(),
    });

    // Calculate discount details
    const orderValue = items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    let eligibleValue = orderValue;
    if (discountCode.books && discountCode.books.length > 0) {
      const eligibleItems = items.filter((item) =>
        discountCode.books.some(
          (book) => book._id.toString() === item.book.toString()
        )
      );
      eligibleValue = eligibleItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    }

    const discountAmount = calculateDiscountAmount(
      discountCode,
      orderValue,
      eligibleValue
    );

    res.status(200).json({
      message: "Discount code applied successfully",
      status: "Success",
      data: {
        code: discountCode.code,
        description: discountCode.description,
        type: discountCode.type,
        value: discountCode.value,
        discountAmount,
        orderValue,
        finalAmount: Math.max(0, orderValue - discountAmount),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Get discount code usage analytics
const getDiscountAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = "30d" } = req.query;

    const discountCode = await DiscountCode.findById(id).populate(
      "usedBy.user",
      "email customerInfo.fullName"
    );

    if (!discountCode) {
      return res.status(404).json({
        message: "Discount code not found",
        status: "Error",
      });
    }

    // Calculate date range
    let dateRange = new Date();
    switch (period) {
      case "7d":
        dateRange.setDate(dateRange.getDate() - 7);
        break;
      case "30d":
        dateRange.setDate(dateRange.getDate() - 30);
        break;
      case "90d":
        dateRange.setDate(dateRange.getDate() - 90);
        break;
      default:
        dateRange.setDate(dateRange.getDate() - 30);
    }

    // Filter usage data by period
    const recentUsage = discountCode.usedBy.filter(
      (usage) => usage.usedAt >= dateRange
    );

    // Calculate analytics
    const analytics = {
      basic: {
        totalUses: discountCode.usesCount,
        remainingUses: discountCode.remainingUses,
        usageRate: discountCode.usageRate,
        averageOrderValue:
          discountCode.usedBy.length > 0
            ? discountCode.usedBy.reduce(
                (sum, usage) => sum + usage.orderValue,
                0
              ) / discountCode.usedBy.length
            : 0,
        totalDiscountGiven: discountCode.usedBy.reduce(
          (sum, usage) => sum + usage.discountApplied,
          0
        ),
      },
      period: {
        usesInPeriod: recentUsage.length,
        averageOrderValueInPeriod:
          recentUsage.length > 0
            ? recentUsage.reduce((sum, usage) => sum + usage.orderValue, 0) /
              recentUsage.length
            : 0,
        totalDiscountInPeriod: recentUsage.reduce(
          (sum, usage) => sum + usage.discountApplied,
          0
        ),
      },
      usage: recentUsage.map((usage) => ({
        user: usage.user,
        usedAt: usage.usedAt,
        orderValue: usage.orderValue,
        discountApplied: usage.discountApplied,
      })),
    };

    res.status(200).json({
      message: "Analytics retrieved successfully",
      status: "Success",
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Bulk operations for discount codes
const bulkUpdateDiscountCodes = async (req, res) => {
  try {
    const { ids, action, updateData } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "IDs array is required",
        status: "Error",
      });
    }

    let result;
    switch (action) {
      case "activate":
        result = await DiscountCode.updateMany(
          { _id: { $in: ids } },
          { isActive: true, lastModifiedBy: req.account._id }
        );
        break;
      case "deactivate":
        result = await DiscountCode.updateMany(
          { _id: { $in: ids } },
          { isActive: false, lastModifiedBy: req.account._id }
        );
        break;
      case "delete":
        result = await DiscountCode.deleteMany({ _id: { $in: ids } });
        break;
      case "update":
        if (!updateData) {
          return res.status(400).json({
            message: "Update data is required",
            status: "Error",
          });
        }
        result = await DiscountCode.updateMany(
          { _id: { $in: ids } },
          { ...updateData, lastModifiedBy: req.account._id }
        );
        break;
      default:
        return res.status(400).json({
          message: "Invalid action",
          status: "Error",
        });
    }

    // Log admin activity
    await logAdminActivity(
      req.account._id,
      `BULK_${action.toUpperCase()}_DISCOUNT_CODE`,
      `Bulk ${action} on ${ids.length} discount codes`,
      {
        ids,
        action,
        modifiedCount: result.modifiedCount || result.deletedCount,
      }
    );

    res.status(200).json({
      message: `Bulk ${action} completed successfully`,
      status: "Success",
      data: {
        affectedCount: result.modifiedCount || result.deletedCount,
        totalRequested: ids.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Get discount statistics summary
const getDiscountStatistics = async (req, res) => {
  try {
    const totalCodes = await DiscountCode.countDocuments();
    const activeCodes = await DiscountCode.countDocuments({ isActive: true });
    const usedCodes = await DiscountCode.countDocuments({
      usageCount: { $gt: 0 },
    });
    const expiredCodes = await DiscountCode.countDocuments({
      endDate: { $lt: new Date() },
    });

    // Aggregate total usage and discount amounts
    const aggregateStats = await DiscountCode.aggregate([
      {
        $group: {
          _id: null,
          totalUsage: { $sum: "$usageCount" },
          totalDiscountGiven: { $sum: "$totalDiscountAmount" },
        },
      },
    ]);

    const stats = aggregateStats[0] || { totalUsage: 0, totalDiscountGiven: 0 };

    res.status(200).json({
      status: "Success",
      data: {
        totalCodes,
        activeCodes,
        usedCodes,
        expiredCodes,
        totalUsage: stats.totalUsage,
        totalDiscountGiven: stats.totalDiscountGiven,
        averageDiscountPerUse:
          stats.totalUsage > 0
            ? stats.totalDiscountGiven / stats.totalUsage
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Generate multiple discount codes at once
const generateDiscountCodes = async (req, res) => {
  try {
    const {
      prefix,
      count = 1,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      maxUses,
      maxUsesPerUser,
      minOrderValue,
      maxDiscountAmount,
      applicableBooks,
      categories,
    } = req.body;

    if (!description || !discountType || !discountValue) {
      return res.status(400).json({
        message: "Description, discountType, and discountValue are required",
        status: "Error",
      });
    }

    if (count > 100) {
      return res.status(400).json({
        message: "Cannot generate more than 100 codes at once",
        status: "Error",
      });
    }

    const generatedCodes = [];

    for (let i = 0; i < count; i++) {
      // Generate unique code
      let code;
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        code = generateUniqueCode(prefix);
        const existingCode = await DiscountCode.findOne({ code });
        if (!existingCode) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).json({
          message: "Failed to generate unique code after multiple attempts",
          status: "Error",
        });
      }

      const discountCode = new DiscountCode({
        code,
        description: `${description} (${i + 1})`,
        discountType,
        discountValue,
        startDate,
        endDate,
        maxUses,
        maxUsesPerUser,
        minOrderValue,
        maxDiscountAmount,
        applicableBooks,
        categories,
        autoGenerated: true,
        prefix,
        createdBy: req.account._id,
        lastModifiedBy: req.account._id,
      });

      await discountCode.save();
      generatedCodes.push(discountCode);
    }

    // Log admin activity
    await logAdminActivity(
      req.account._id,
      actionTypes.BULK_CREATE_DISCOUNT_CODES,
      `Generated ${count} discount codes with prefix ${prefix}`,
      { count, prefix }
    );

    res.status(201).json({
      status: "Success",
      message: `Successfully generated ${count} discount codes`,
      data: generatedCodes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

module.exports = {
  createDiscountCode,
  getAllDiscountCodes,
  getDiscountCodeById,
  updateDiscountCode,
  deleteDiscountCode,
  validateDiscountCode,
  applyDiscountCode,
  getDiscountAnalytics,
  bulkUpdateDiscountCodes,
  getDiscountStatistics,
  generateDiscountCodes,
  generateDiscountCode,
};
