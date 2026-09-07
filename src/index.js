const http = require("http");
const { Server } = require("socket.io");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const taskRoutes = require("./routes/taskRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");

const Message = require("./models/Message");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date()
    });
});

// Existing API routes
app.use("/api/tasks", taskRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// Chat routes
app.use("/api/chat", chatRoutes);

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Socket.IO connection
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join a conversation
    socket.on("joinConversation", async (conversationId) => {
        try {
            socket.join(conversationId);

            console.log(
                `Socket ${socket.id} joined conversation ${conversationId}`
            );
        } catch (error) {
            console.error(
                "Join conversation error:",
                error.message
            );
        }
    });

    // Send message
    socket.on("sendMessage", async (data) => {
        try {
            const {
                conversationId,
                senderId,
                content
            } = data;

            if (!conversationId || !senderId || !content) {
                return;
            }

            // Save message in MongoDB
            const message = await Message.create({
                conversation: conversationId,
                sender: senderId,
                content: content.trim()
            });

            // Get sender information
            const populatedMessage = await Message.findById(message._id)
                .populate("sender", "name email role")
                .populate("conversation");

            // Send message to everyone in the conversation
            io.to(conversationId).emit(
                "receiveMessage",
                populatedMessage
            );

        } catch (error) {
            console.error(
                "Send message error:",
                error.message
            );
        }
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log(
            "A user disconnected:",
            socket.id
        );
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});