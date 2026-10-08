const Order = require("../models/Order");


const createOrder = async (req, res) => {
    try {
        const order = await Order.create(req.body);

        res.status(201).json({
            message: "Order created successfully",
            order
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating order",
            error: error.message
        });
    }
};


const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const orders = await Order.find({ isDeleted: false })
            .populate("products.product")
            .skip(skip)
            .limit(limit);

        const totalOrders = await Order.countDocuments({
            isDeleted: false
        });

        const totalPages = Math.ceil(totalOrders / limit);

        res.status(200).json({
            message: "Orders fetched successfully",
            orders,
            pagination: {
                currentPage: page,
                limit,
                totalOrders,
                totalPages
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching orders",
            error: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            isDeleted: false
        }).populate("products.product");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order fetched successfully",
            order
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching order",
            error: error.message
        });
    }
};


const updateOrder = async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            {
                _id: req.params.id,
                isDeleted: false
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order updated successfully",
            order
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating order",
            error: error.message
        });
    }
};


const patchOrder = async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            {
                _id: req.params.id,
                isDeleted: false
            },
            {
                $set: req.body
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order partially updated successfully",
            order
        });
    } catch (error) {
        res.status(500).json({
            message: "Error partially updating order",
            error: error.message
        });
    }
};


const softDeleteOrder = async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            {
                _id: req.params.id,
                isDeleted: false
            },
            {
                isDeleted: true
            },
            {
                new: true
            }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order soft deleted successfully",
            order
        });
    } catch (error) {
        res.status(500).json({
            message: "Error soft deleting order",
            error: error.message
        });
    }
};

const hardDeleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order permanently deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error permanently deleting order",
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    patchOrder,
    softDeleteOrder,
    hardDeleteOrder
};