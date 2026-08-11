const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
title: {
    type: String,
    required: true
},
description: {
    type: String,
    required: true
},
status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    required: true
},
priority: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true
},
dueDate: {
    type: Date
},
createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
}
}, { timestamps: true });
module.exports = mongoose.model("Task", taskSchema);

