require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Task = require("../models/Task");
const bcrypt = require("bcrypt");

const seed = async () => {
    try {
        await connectDB();

	await User.deleteMany({});
	await Task.deleteMany({});

	console.log("Existing data cleared.");
	
	const passwordHash = await bcrypt.hash("password123", 10);
	const users = await User.insertMany([
    {
        name: "Ali Khan",
        email: "ali@example.com",
        passwordHash: passwordHash,
        role: "admin"
    },
    {
        name: "Sara Ahmed",
        email: "sara@example.com",
        passwordHash: passwordHash,
        role: "user"
    },
    {
        name: "Hamza Malik",
        email: "hamza@example.com",
        passwordHash: passwordHash,
        role: "user"
    }
]);

console.log(`${users.length} users created.`);	
const tasks = await Task.insertMany([
    {
        title: "Learn Express",
        description: "Understand the basics of Express.js",
        status: "completed",
        priority: "high",
        dueDate: new Date("2026-08-10"),
        createdBy: users[0]._id
    },
    {
        title: "Learn MongoDB",
        description: "Practice MongoDB database operations",
        status: "in-progress",
        priority: "high",
        dueDate: new Date("2026-08-11"),
        createdBy: users[1]._id
    },
    {
        title: "Build API",
        description: "Create basic REST API endpoints",
        status: "pending",
        priority: "medium",
        dueDate: new Date("2026-08-12"),
        createdBy: users[2]._id
    },
    {
        title: "Test Health Route",
        description: "Test the API health endpoint",
        status: "completed",
        priority: "low",
        createdBy: users[0]._id
    },
    {
        title: "Create Task Model",
        description: "Create and validate the Task schema",
        status: "completed",
        priority: "high",
        dueDate: new Date("2026-08-13"),
        createdBy: users[1]._id
    },
    {
        title: "Create User Model",
        description: "Create the User schema with validation",
        status: "in-progress",
        priority: "medium",
        createdBy: users[2]._id
    },
    {
        title: "Write Seed Script",
        description: "Create sample users and tasks",
        status: "in-progress",
        priority: "high",
        dueDate: new Date("2026-08-14"),
        createdBy: users[0]._id
    },
    {
        title: "Test Database",
        description: "Verify seeded data in MongoDB",
        status: "pending",
        priority: "medium",
        createdBy: users[1]._id
    },
    {
        title: "Create Postman Collection",
        description: "Prepare API requests for CRUD testing",
        status: "pending",
        priority: "low",
        createdBy: users[2]._id
    }
]);

console.log(`${tasks.length} tasks created.`);
console.log("Seeding completed successfully.");




    

    } catch (error) {
        console.error("Seeding failed:", error.message);
        process.exit(1);
    }
};

seed();