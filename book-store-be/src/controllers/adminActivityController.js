const AdminActivityLog = require('../models/AdminActivityLog');
const Account = require('../models/accountModel');

// Get all admin activities with pagination
const getAllActivities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [activities, total] = await Promise.all([
            AdminActivityLog.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('adminId', 'email info.fullName'),
            AdminActivityLog.countDocuments()
        ]);

        res.json({
            status: 'Success',
            data: activities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

// Get activities by date range
const getActivitiesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [activities, total] = await Promise.all([
            AdminActivityLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('adminId', 'email info.fullName'),
            AdminActivityLog.countDocuments(query)
        ]);

        res.json({
            status: 'Success',
            data: activities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

// Get activities by admin ID
const getActivitiesByAdminId = async (req, res) => {
    try {
        const { adminId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [activities, total] = await Promise.all([
            AdminActivityLog.find({ adminId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('adminId', 'email info.fullName'),
            AdminActivityLog.countDocuments({ adminId })
        ]);

        res.json({
            status: 'Success',
            data: activities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

// Search activities
const searchActivities = async (req, res) => {
    try {
        const { searchTerm } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {
            $or: [
                { action: { $regex: searchTerm, $options: 'i' } },
                { details: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        const [activities, total] = await Promise.all([
            AdminActivityLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('adminId', 'email info.fullName'),
            AdminActivityLog.countDocuments(query)
        ]);

        res.json({
            status: 'Success',
            data: activities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

module.exports = {
    getAllActivities,
    getActivitiesByDateRange,
    getActivitiesByAdminId,
    searchActivities
}; 