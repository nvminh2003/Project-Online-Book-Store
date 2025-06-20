const Blog = require("../models/blogModel");
const AdminActivityLog = require("../models/AdminActivityLog");

// Create a new blog post (Admin only)
const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required",
                status: "Error"
            });
        }

        // Create new blog post
        const newBlog = new Blog({
            title,
            content,
            author: req.account._id
        });

        await newBlog.save();

        // Log admin activity
        await AdminActivityLog.create({
            adminId: req.account._id,
            action: 'CREATE_BLOG',
            details: `Admin ${req.account.email} created new blog post: ${title}`
        });

        res.status(201).json({
            message: "Blog post created successfully",
            status: "Success",
            data: newBlog
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get all blog posts with pagination
const getAllBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { createdAt, from, to } = req.query;

        const query = {};
        // Lọc theo ngày tạo
        if (createdAt) {
            const start = new Date(createdAt);
            start.setHours(0, 0, 0, 0);
            const end = new Date(createdAt);
            end.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: start, $lte: end };
        } else if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = toDate;
            }
        }

        const blogs = await Blog.find(query)
            .populate('author', 'email info.fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments(query);

        res.status(200).json({
            message: "Get blogs successfully",
            status: "Success",
            data: {
                blogs,
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

// Get blog by ID
const getBlogById = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        const blog = await Blog.findOne(query)
            .populate('author', 'email info.fullName');

        if (!blog) {
            return res.status(404).json({
                message: "Blog post not found",
                status: "Error"
            });
        }

        // Increment view count
        blog.viewCount += 1;
        await blog.save();

        res.status(200).json({
            message: "Get blog successfully",
            status: "Success",
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Update blog (Admin only)
const updateBlog = async (req, res) => {
    try {
        const { title, content } = req.body;

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog post not found",
                status: "Error"
            });
        }

        // Update blog fields
        const updatedFields = {
            title: title || blog.title,
            content: content || blog.content
        };

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updatedFields,
            { new: true }
        ).populate('author', 'email info.fullName');

        // Log admin activity
        await AdminActivityLog.create({
            adminId: req.account._id,
            action: 'UPDATE_BLOG',
            details: `Admin ${req.account.email} updated blog post: ${updatedBlog.title}`
        });

        res.status(200).json({
            message: "Blog post updated successfully",
            status: "Success",
            data: updatedBlog
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Delete blog (Admin only)
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog post not found",
                status: "Error"
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        // Log admin activity
        await AdminActivityLog.create({
            adminId: req.account._id,
            action: 'DELETE_BLOG',
            details: `Admin ${req.account.email} deleted blog post: ${blog.title}`
        });

        res.status(200).json({
            message: "Blog post deleted successfully",
            status: "Success"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Search blogs by title or content
const searchBlogs = async (req, res) => {
    try {
        const { searchTerm } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!searchTerm) {
            return res.status(400).json({
                message: "Search term is required",
                status: "Error"
            });
        }

        const query = {
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { content: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        const [blogs, total] = await Promise.all([
            Blog.find(query)
                .populate('author', 'email info.fullName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Blog.countDocuments(query)
        ]);

        res.status(200).json({
            message: "Search blogs successfully",
            status: "Success",
            data: {
                blogs,
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

// Get blogs by date range
const getBlogsByDateRange = async (req, res) => {
    try {
        const { from, to } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (from && to) {
            const fromDate = new Date(from);
            fromDate.setHours(0, 0, 0, 0);
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: fromDate, $lte: toDate };
        } else if (from) {
            const fromDate = new Date(from);
            fromDate.setHours(0, 0, 0, 0);
            query.createdAt = { $gte: fromDate };
        } else if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            query.createdAt = { $lte: toDate };
        }

        const [blogs, total] = await Promise.all([
            Blog.find(query)
                .populate('author', 'email info.fullName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Blog.countDocuments(query)
        ]);

        res.status(200).json({
            message: "Get blogs by date range successfully",
            status: "Success",
            data: {
                blogs,
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

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    searchBlogs,
    getBlogsByDateRange
};
