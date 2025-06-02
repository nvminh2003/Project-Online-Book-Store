const Blog = require("../models/blogModel");

// Create a new blog post (Admin only)
const createBlog = async (req, res) => {
    try {
        const { title, content, status } = req.body;

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
            status: status || "draft",
            author: req.account._id
        });

        await newBlog.save();

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
        const status = req.query.status || "published";

        const query = { status };
        if (req.account?.role === "admin") {
            delete query.status; // Admin can see all posts
        }

        const blogs = await Blog.find(query)
            .populate('author', 'email adminInfo.fullName')
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
        if (req.account?.role !== "admin") {
            query.status = "published";
        }

        const blog = await Blog.findOne(query)
            .populate('author', 'email adminInfo.fullName');

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
        const { title, content, status } = req.body;

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
            content: content || blog.content,
            status: status || blog.status
        };

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updatedFields,
            { new: true }
        ).populate('author', 'email adminInfo.fullName');

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

// Search blogs
const searchBlogs = async (req, res) => {
    try {
        const { query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status || "published";

        const searchQuery = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
                { summary: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } }
            ]
        };

        if (status) {
            searchQuery.status = status;
        }

        if (req.account?.role !== "admin") {
            searchQuery.status = "published";
        }

        const blogs = await Blog.find(searchQuery)
            .populate('author', 'email adminInfo.fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments(searchQuery);

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

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    searchBlogs
};
