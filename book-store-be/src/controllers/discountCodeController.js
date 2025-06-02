const DiscountCode = require("../models/discountCodeModel");

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
            books
        } = req.body;

        // Validate required fields
        if (!code || !type || !value || !startDate || !endDate) {
            return res.status(400).json({
                message: "Code, type, value, startDate and endDate are required",
                status: "Error"
            });
        }

        // Validate type
        if (!["percent", "fixed"].includes(type)) {
            return res.status(400).json({
                message: "Type must be either 'percent' or 'fixed'",
                status: "Error"
            });
        }

        // Validate value
        if (type === "percent" && (value < 0 || value > 100)) {
            return res.status(400).json({
                message: "Percent value must be between 0 and 100",
                status: "Error"
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(400).json({
                message: "End date must be after start date",
                status: "Error"
            });
        }

        // Check if code already exists
        const existingCode = await DiscountCode.findOne({ code });
        if (existingCode) {
            return res.status(400).json({
                message: "Discount code already exists",
                status: "Error"
            });
        }

        // Create new discount code
        const newDiscountCode = new DiscountCode({
            code,
            description,
            type,
            value,
            startDate: start,
            endDate: end,
            maxUses,
            books
        });

        await newDiscountCode.save();

        res.status(201).json({
            message: "Discount code created successfully",
            status: "Success",
            data: newDiscountCode
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get all discount codes
const getAllDiscountCodes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.account?.role !== "admin") {
            query.isActive = true;
            query.startDate = { $lte: new Date() };
            query.endDate = { $gte: new Date() };
        }

        const discountCodes = await DiscountCode.find(query)
            .populate('books', 'title price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await DiscountCode.countDocuments(query);

        res.status(200).json({
            message: "Get discount codes successfully",
            status: "Success",
            data: {
                discountCodes,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
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

        const discountCode = await DiscountCode.findOne(query)
            .populate('books', 'title price');

        if (!discountCode) {
            return res.status(404).json({
                message: "Discount code not found",
                status: "Error"
            });
        }

        res.status(200).json({
            message: "Get discount code successfully",
            status: "Success",
            data: discountCode
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
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
            books
        } = req.body;

        const discountCode = await DiscountCode.findById(req.params.id);

        if (!discountCode) {
            return res.status(404).json({
                message: "Discount code not found",
                status: "Error"
            });
        }

        // Validate type if provided
        if (type && !["percent", "fixed"].includes(type)) {
            return res.status(400).json({
                message: "Type must be either 'percent' or 'fixed'",
                status: "Error"
            });
        }

        // Validate value if provided
        if (value && type === "percent" && (value < 0 || value > 100)) {
            return res.status(400).json({
                message: "Percent value must be between 0 and 100",
                status: "Error"
            });
        }

        // Validate dates if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start >= end) {
                return res.status(400).json({
                    message: "End date must be after start date",
                    status: "Error"
                });
            }
        }

        // Check if new code already exists
        if (code && code !== discountCode.code) {
            const existingCode = await DiscountCode.findOne({ code });
            if (existingCode) {
                return res.status(400).json({
                    message: "Discount code already exists",
                    status: "Error"
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
            books: books || discountCode.books
        };

        const updatedDiscountCode = await DiscountCode.findByIdAndUpdate(
            req.params.id,
            updatedFields,
            { new: true }
        ).populate('books', 'title price');

        res.status(200).json({
            message: "Discount code updated successfully",
            status: "Success",
            data: updatedDiscountCode
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
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
                status: "Error"
            });
        }

        await DiscountCode.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Discount code deleted successfully",
            status: "Success"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Validate discount code
const validateDiscountCode = async (req, res) => {
    try {
        const { code, bookId } = req.body;

        if (!code) {
            return res.status(400).json({
                message: "Discount code is required",
                status: "Error"
            });
        }

        const discountCode = await DiscountCode.findOne({
            code,
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        if (!discountCode) {
            return res.status(404).json({
                message: "Invalid or expired discount code",
                status: "Error"
            });
        }

        // Check if code has reached max uses
        if (discountCode.maxUses && discountCode.usesCount >= discountCode.maxUses) {
            return res.status(400).json({
                message: "Discount code has reached maximum uses",
                status: "Error"
            });
        }

        // Check if book is eligible for discount
        if (bookId && discountCode.books.length > 0) {
            const isBookEligible = discountCode.books.some(book =>
                book.toString() === bookId
            );
            if (!isBookEligible) {
                return res.status(400).json({
                    message: "Discount code is not valid for this book",
                    status: "Error"
                });
            }
        }

        res.status(200).json({
            message: "Discount code is valid",
            status: "Success",
            data: discountCode
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

module.exports = {
    createDiscountCode,
    getAllDiscountCodes,
    getDiscountCodeById,
    updateDiscountCode,
    deleteDiscountCode,
    validateDiscountCode
};
