const authenticate = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/roleMiddleware");
const express = require("express");
const router = express.Router();

const {
    signup,
    login,
    getUsers,
    getUserById,
    updateUser,
    patchUser,
    softDeleteUser,
    hardDeleteUser
} = require("../controllers/userController");

router.post("/signup", signup);
router.post("/login", login);

router.get("/profile", authenticate, (req, res) => {
    res.status(200).json({
        message: "Authentication successful",
        user: req.user
    });
});

router.get("/", authenticate, authorizeAdmin, getUsers);
router.get("/:id", authenticate, authorizeAdmin, getUserById);

router.put("/:id", authenticate, authorizeAdmin, updateUser);
router.patch("/:id", authenticate, authorizeAdmin, patchUser);

router.delete(
    "/:id/soft",
    authenticate,
    authorizeAdmin,
    softDeleteUser
);

router.delete(
    "/:id/hard",
    authenticate,
    authorizeAdmin,
    hardDeleteUser
);

module.exports = router;