
const OpenAI = require("openai");

const Product = require("../models/Product");
const Task = require("../models/Task");
const Order = require("../models/Order");
const User = require("../models/User");

const { findSimilarProducts } = require("./vectorService");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const getUserContext = async (user) => {
    const isAdmin = user.role === "admin";

    const currentUser = await User.findOne({
        _id: user.id,
        isDeleted: false
    })
        .select("email name role")
        .lean();

    if (!currentUser) {
        throw new Error("Authenticated user not found");
    }

    const products = await Product.find({
        isDeleted: false
    })
        .select("name description price category stock")
        .limit(50)
        .lean();

    const orderQuery = isAdmin
        ? { isDeleted: false }
        : {
            isDeleted: false,
            customerEmail: currentUser.email
        };

    const orders = await Order.find(orderQuery)
        .populate("products.product")
        .limit(20)
        .lean();

    const taskQuery = isAdmin
        ? {}
        : {
            createdBy: user.id
        };

    const tasks = await Task.find(taskQuery)
        .limit(20)
        .lean();

    return {
        products,
        orders,
        tasks
    };
};


const tools = [
    {
        type: "function",
        name: "create_product",
        description:
            "Create a new product in the application. Use this when the user explicitly asks to create or add a product.",
        strict: true,
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Product name"
                },
                description: {
                    type: "string",
                    description: "Product description"
                },
                price: {
                    type: "number",
                    description: "Product price. Must be zero or greater."
                },
                category: {
                    type: "string",
                    description: "Product category"
                },
                stock: {
                    type: "integer",
                    description: "Available stock quantity. Must be zero or greater."
                }
            },
            required: [
                "name",
                "description",
                "price",
                "category",
                "stock"
            ],
            additionalProperties: false
        }
    },

    {
        type: "function",
        name: "create_task",
        description:
            "Create a new task for the authenticated user. Use this when the user explicitly asks to create or add a task.",
        strict: true,
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "Task title"
                },
                description: {
                    type: "string",
                    description: "Task description"
                },
                status: {
                    type: "string",
                    enum: [
                        "pending",
                        "in-progress",
                        "completed"
                    ],
                    description: "Task status"
                },
                priority: {
                    type: "string",
                    enum: [
                        "low",
                        "medium",
                        "high"
                    ],
                    description: "Task priority"
                },
                dueDate: {
                    type: "string",
                    description:
                        "Task due date in ISO date format, for example 2026-09-30"
                }
            },
            required: [
                "title",
                "description",
                "status",
                "priority",
                "dueDate"
            ],
            additionalProperties: false
        }
    }
];


const executeCreateProduct = async (argumentsObject, user) => {
    if (user.role !== "admin") {
        return {
            success: false,
            error: "Only administrators can create products."
        };
    }

    const {
        name,
        description,
        price,
        category,
        stock
    } = argumentsObject;

    if (!name.trim()) {
        return {
            success: false,
            error: "Product name is required."
        };
    }

    if (!description.trim()) {
        return {
            success: false,
            error: "Product description is required."
        };
    }

    if (typeof price !== "number" || price < 0) {
        return {
            success: false,
            error: "Product price must be zero or greater."
        };
    }

    if (!category.trim()) {
        return {
            success: false,
            error: "Product category is required."
        };
    }

    if (!Number.isInteger(stock) || stock < 0) {
        return {
            success: false,
            error: "Product stock must be a non-negative integer."
        };
    }

    const product = await Product.create({
        name: name.trim(),
        description: description.trim(),
        price,
        category: category.trim(),
        stock
    });

    return {
        success: true,
        product: {
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock
        }
    };
};


const executeCreateTask = async (argumentsObject, user) => {
    const {
        title,
        description,
        status,
        priority,
        dueDate
    } = argumentsObject;

    if (!title.trim()) {
        return {
            success: false,
            error: "Task title is required."
        };
    }

    if (!description.trim()) {
        return {
            success: false,
            error: "Task description is required."
        };
    }

    if (!["pending", "in-progress", "completed"].includes(status)) {
        return {
            success: false,
            error: "Invalid task status."
        };
    }

    if (!["low", "medium", "high"].includes(priority)) {
        return {
            success: false,
            error: "Invalid task priority."
        };
    }

    let parsedDueDate;

    if (dueDate) {
        parsedDueDate = new Date(dueDate);

        if (Number.isNaN(parsedDueDate.getTime())) {
            return {
                success: false,
                error: "Invalid due date."
            };
        }
    }

    const task = await Task.create({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: parsedDueDate,
        createdBy: user.id
    });

    return {
        success: true,
        task: {
            id: task._id.toString(),
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate
        }
    };
};


const executeTool = async (toolName, argumentsObject, user) => {
    switch (toolName) {
        case "create_product":
            return await executeCreateProduct(
                argumentsObject,
                user
            );

        case "create_task":
            return await executeCreateTask(
                argumentsObject,
                user
            );

        default:
            return {
                success: false,
                error: `Unknown tool: ${toolName}`
            };
    }
};


const askAI = async (question, user) => {
    const context = await getUserContext(user);

    /*
     * VECTOR SEARCH
     *
     * Generate one embedding for the user's question,
     * search ChromaDB, and retrieve the most relevant products.
     */
    const similarProducts = await findSimilarProducts(
        question
    );

    console.log(
        "Similar products:",
        similarProducts.map((item) => ({
            name: item.product.name,
            similarity: item.similarity
        }))
    );

    const relevantProducts = similarProducts.map((item) => ({
        name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        category: item.product.category,
        stock: item.product.stock,
        similarity: item.similarity
    }));


    const instructions = `
You are an AI assistant for a product, order, and task management application.

You can answer questions using application data and can perform certain application actions using tools.

Rules:

- Use application data for actual products, prices, stock, orders, and tasks.
- Never invent application data.
- When answering product-related questions, use the SEMANTICALLY RELEVANT PRODUCTS section when it contains relevant results.
- Do not claim that a product exists unless it appears in the provided application data.
- Use the create_product tool when the user explicitly asks to create a product.
- Use the create_task tool when the user explicitly asks to create a task.
- Do not claim that an action was completed unless the tool execution result confirms success.
- If a required parameter is missing, ask the user for it.
- Keep responses clear and concise.
- A normal user cannot create products.
- The authenticated user's ID must be used as createdBy when creating tasks.
- Never ask the user for their internal user ID.
`;


    let response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

        tools: [
            {
                type: "web_search"
            },
            ...tools
        ],

        instructions,

        input: `
USER QUESTION:
${question}

SEMANTICALLY RELEVANT PRODUCTS:
${JSON.stringify(relevantProducts, null, 2)}

APPLICATION PRODUCTS:
${JSON.stringify(context.products, null, 2)}

APPLICATION ORDERS:
${JSON.stringify(context.orders, null, 2)}

APPLICATION TASKS:
${JSON.stringify(context.tasks, null, 2)}
`
    });


    let iterations = 0;
    const maxIterations = 3;

    while (iterations < maxIterations) {
        const functionCalls = response.output.filter(
            (item) => item.type === "function_call"
        );

        if (functionCalls.length === 0) {
            return response.output_text;
        }

        const toolOutputs = [];

        for (const functionCall of functionCalls) {
            let argumentsObject;

            try {
                argumentsObject = JSON.parse(
                    functionCall.arguments
                );
            } catch (error) {
                argumentsObject = {};
            }

            console.log(
                "AI selected tool:",
                functionCall.name
            );

            console.log(
                "Tool arguments:",
                argumentsObject
            );

            const result = await executeTool(
                functionCall.name,
                argumentsObject,
                user
            );

            console.log(
                "Tool result:",
                result
            );

            toolOutputs.push({
                type: "function_call_output",
                call_id: functionCall.call_id,
                output: JSON.stringify(result)
            });
        }

        response = await openai.responses.create({
            model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

            tools: [
                {
                    type: "web_search"
                },
                ...tools
            ],

            instructions,

            previous_response_id: response.id,

            input: toolOutputs
        });

        iterations++;
    }

    return "The request could not be completed within the allowed tool execution steps.";
};


module.exports = {
    askAI
};
