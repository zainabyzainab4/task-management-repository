

const express = require("express");
const router = express.Router();

const { createProduct, getProducts, getProductById, updateProduct, softDeleteProduct, patchProduct, hardDeleteProduct,uploadProductImage, uploadProductImages } = require("../controllers/productController");
const upload = require("../middleware/upload");
const authenticate = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/roleMiddleware");


router.post("/", authenticate, authorizeAdmin,  createProduct);
router.get("/", authenticate,  getProducts);
router.get("/:id",authenticate,  getProductById);
router.put("/:id", authenticate, authorizeAdmin, updateProduct);
router.delete("/:id/soft",authenticate, authorizeAdmin, softDeleteProduct);
router.patch("/:id", authenticate, authorizeAdmin,  patchProduct);
router.delete("/:id/hard", hardDeleteProduct);
router.post("/:id/image", upload.single("image"), uploadProductImage);
router.post("/:id/images", upload.array("images", 5), uploadProductImages);
module.exports = router;