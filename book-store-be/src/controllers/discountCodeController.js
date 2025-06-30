// controllers/DiscountCodeController.js
const DiscountCode = require('../models/discountCodeModel');

// Hàm kiểm tra validation
const validateDiscountCode = (data) => {
    const errors = [];

    // Kiểm tra code
    if (!data.code || data.code.trim() === "") {
        errors.push('Code is required');
    }

    // Kiểm tra description
    if (!data.description || data.description.trim() === "") {
        errors.push('Description is required');
    }

    // Kiểm tra type
    if (!data.type || (data.type !== 'percent' && data.type !== 'fixed')) {
        errors.push('Type must be "percent" or "fixed"');
    }

    // Kiểm tra value (phải là số)
    if (isNaN(data.value)) {
        errors.push('Value must be a number');
    }

    // Kiểm tra startDate (phải là ngày hợp lệ)
    if (isNaN(Date.parse(data.startDate))) {
        errors.push('Start date must be a valid date');
    }

    // Kiểm tra endDate (phải là ngày hợp lệ)
    if (isNaN(Date.parse(data.endDate))) {
        errors.push('End date must be a valid date');
    }

    // Kiểm tra maxUses (phải là số nguyên lớn hơn 0)
    if (isNaN(data.maxUses) || data.maxUses <= 0) {
        errors.push('Max uses must be an integer greater than 0');
    }

    return errors;
};

// Tạo mới discount code
exports.createDiscountCode = async (req, res) => {
    // Validate dữ liệu
    const errors = validateDiscountCode(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const { code, description, type, value, startDate, endDate, maxUses, books } = req.body;

        const discountCode = new DiscountCode({
            code,
            description,
            type,
            value,
            startDate,
            endDate,
            maxUses,
            books,
        });

        await discountCode.save();
        res.status(201).json(discountCode);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Lấy danh sách tất cả discount code
exports.getAllDiscountCodes = async (req, res) => {
    try {
        const discountCodes = await DiscountCode.find();
        res.status(200).json(discountCodes);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Cập nhật discount code
exports.updateDiscountCode = async (req, res) => {
    // Validate dữ liệu
    const errors = validateDiscountCode(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const discountCode = await DiscountCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!discountCode) {
            return res.status(404).json({ error: 'Discount code not found' });
        }
        res.status(200).json(discountCode);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Xóa discount code
exports.deleteDiscountCode = async (req, res) => {
    try {
        const discountCode = await DiscountCode.findByIdAndDelete(req.params.id);
        if (!discountCode) {
            return res.status(404).json({ error: 'Discount code not found' });
        }
        res.status(200).json({ message: 'Discount code deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
