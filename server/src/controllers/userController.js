const User = require("../models/User");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({
            email,
            isDeleted: false
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            passwordHash,
            role: "user"
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error registering user",
            error: error.message
        });
    }
};

const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email,
            isDeleted: false
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error logging in",
            error: error.message
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const users = await User.find({ isDeleted: false })
            .select("-passwordHash")
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments({
            isDeleted: false
        });

        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            users,
            pagination: {
                currentPage: page,
                limit,
                totalUsers,
                totalPages
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error: error.message
        });
    }
};
const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            isDeleted: false
        }).select("-passwordHash");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user",
            error: error.message
        });
    }
};
const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const user = await User.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.name = name;
        user.email = email;
        user.role = role;

        await user.save();

        res.status(200).json({
            message: "User updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating user",
            error: error.message
        });
    }
};


const patchUser = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (req.body.name !== undefined) {
            user.name = req.body.name;
        }

        if (req.body.email !== undefined) {
            user.email = req.body.email;
        }

        if (req.body.role !== undefined) {
            user.role = req.body.role;
        }

        await user.save();

        res.status(200).json({
            message: "User partially updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error partially updating user",
            error: error.message
        });
    }
};


const softDeleteUser = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.isDeleted = true;

        await user.save();

        res.status(200).json({
            message: "User soft deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error soft deleting user",
            error: error.message
        });
    }
};


const hardDeleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "User permanently deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error permanently deleting user",
            error: error.message
        });
    }
};




module.exports = {
    signup,
    login,
    getUsers,
    getUserById,
    updateUser,
    patchUser,
    softDeleteUser,
    hardDeleteUser	
};