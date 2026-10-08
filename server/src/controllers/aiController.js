const { askAI } = require("../services/aiService");

const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        const answer = await askAI(
            message.trim(),
            req.user
        );

        res.status(200).json({
            answer
        });

    } catch (error) {
        console.error("AI chat error:", error);

        res.status(500).json({
            message: "Failed to get AI response",
            error: error.message
        });
    }
};

module.exports = {
    chatWithAI
};