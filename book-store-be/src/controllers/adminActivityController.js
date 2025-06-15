const AdminActivityLog = require('../models/AdminActivityLog');
const Account = require('../models/accountModel');

// Get all admin activities with filters
const getAllActivities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Initialize empty query object
        const query = {};

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
        console.error('Error in getAllActivities:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message || 'Internal server error'
        });
    }
};


const getActivitiesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
            return res.status(400).json({
                status: 'Error',
                message: 'Invalid date format for startDate or endDate'
            });
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                status: 'Error',
                message: 'startDate must be less than or equal to endDate'
            });
        }

        if (page <= 0 || limit <= 0) {
            return res.status(400).json({
                status: 'Error',
                message: 'Page and limit must be positive integers'
            });
        }

        const skip = (page - 1) * limit;
        const query = {};

        if (startDate && endDate) {
            // Parse dates to get Y, M, D components
            const startParts = startDate.split('-').map(Number);
            const endParts = endDate.split('-').map(Number);

            // Create UTC Date objects for the start and end of the day
            // Month is 0-indexed in Date.UTC()
            const startOfDay = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2], 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2], 23, 59, 59, 999));

            query.createdAt = {
                $gte: startOfDay,
                $lte: endOfDay
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

        const query = { adminId };
        console.log('getActivitiesByAdminId query:', JSON.stringify(query));

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
        console.log('searchActivities query:', JSON.stringify(query));

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