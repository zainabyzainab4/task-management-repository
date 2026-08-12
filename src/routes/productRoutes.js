const express = require("express");
const router = express.Router();

const { createProduct, getProducts, getProductById, updateProduct, softDeleteProduct, patchProduct, hardDeleteProduct} = require("../controllers/productController");

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id/soft", softDeleteProduct);
router.patch("/:id", patchProduct);
router.delete("/:id/hard", hardDeleteProduct);
module.exports = router;