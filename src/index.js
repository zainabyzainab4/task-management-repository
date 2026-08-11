const taskRoutes = require("./routes/taskRoutes");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date()
    });
});
app.use("/api/tasks", taskRoutes);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});212