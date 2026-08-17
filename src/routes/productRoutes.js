const express = require("express");
const router = express.Router();

const { createProduct, getProducts, getProductById, updateProduct, softDeleteProduct, patchProduct, hardDeleteProduct,uploadProductImage, uploadProductImages } = require("../controllers/productController");
const upload = require("../middleware/upload");
router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id/soft", softDeleteProduct);
router.patch("/:id", patchProduct);
router.delete("/:id/hard", hardDeleteProduct);
router.post("/:id/image", upload.single("image"), uploadProductImage);
router.post("/:id/images", upload.array("images", 5), uploadProductImages);
module.exports = router;