const customerService = require('../services/customerService');

class CustomerController {
    // Create a new customer
    async createCustomer(req, res) {
        try {
            const customer = await customerService.createCustomer(req.body);
            res.status(201).json({
                success: true,
                data: customer
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get all customers
    async getAllCustomers(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await customerService.getAllCustomers(parseInt(page), parseInt(limit));
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get customer by ID
    async getCustomerById(req, res) {
        try {
            const customer = await customerService.getCustomerById(req.params.id);
            res.status(200).json({
                success: true,
                data: customer
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get customer by account ID
    async getCustomerByAccountId(req, res) {
        try {
            const customer = await customerService.getCustomerByAccountId(req.params.accountId);
            res.status(200).json({
                success: true,
                data: customer
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update customer
    async updateCustomer(req, res) {
        try {
            const customer = await customerService.updateCustomer(req.params.id, req.body);
            res.status(200).json({
                success: true,
                data: customer
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete customer
    async deleteCustomer(req, res) {
        try {
            const result = await customerService.deleteCustomer(req.params.id);
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Search customers
    async searchCustomers(req, res) {
        try {
            const { query, page = 1, limit = 10 } = req.query;
            const result = await customerService.searchCustomers(query, parseInt(page), parseInt(limit));
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new CustomerController(); 