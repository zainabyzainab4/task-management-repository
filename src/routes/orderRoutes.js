const express = require("express");
const router = express.Router();

const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    patchOrder,
    softDeleteOrder,
    hardDeleteOrder
} = require("../controllers/orderController");

const authenticate = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/roleMiddleware");
router.post("/", authenticate, authorizeAdmin, createOrder);
router.get("/", authenticate, getOrders);
router.get("/:id", authenticate, getOrderById);
router.put("/:id", authenticate, authorizeAdmin, updateOrder);
router.patch("/:id", authenticate, authorizeAdmin, patchOrder);
router.delete("/:id/soft", authenticate, authorizeAdmin, softDeleteOrder);
router.delete("/:id/hard", authenticate, authorizeAdmin, hardDeleteOrder);
module.exports = router;