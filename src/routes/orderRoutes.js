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

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.patch("/:id", patchOrder);
router.delete("/:id/soft", softDeleteOrder);
router.delete("/:id/hard", hardDeleteOrder);

module.exports = router;