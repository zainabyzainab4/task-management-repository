const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const { chatWithAI } = require("../controllers/aiController");

const router = express.Router();

router.post("/chat", authenticate, chatWithAI);

module.exports = router;