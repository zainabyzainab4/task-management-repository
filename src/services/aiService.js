const OpenAI = require("openai");

const Product = require("../models/Product");
const Order = require("../models/Order");
const Task = require("../models/Task");
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

const askAI = async (question, user) => {
    const context = await getUserContext(user);

    const similarProducts = await findSimilarProducts(
        question,
        context.products
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

    const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

        tools: [
            {
                type: "web_search"
            }
        ],

        instructions: `
You are an AI assistant for a product, order, and task management application.

You have access to application data, semantic product search, and web search.

Rules:

- Use APPLICATION DATA for actual products, prices, stock, orders, and tasks.
- Use SEMANTIC PRODUCT SEARCH to identify products relevant to the user's question.
- Use WEB SEARCH for additional product information, specifications, features, comparisons, current information, or general knowledge.
- When useful, combine application data with web research.
- Never invent application data.
- Never change application prices, stock, order status, or task information based on web results.
- Clearly distinguish application information from web information.
- If requested information is not available in the application data, say so.
- Keep answers clear and concise.
`,

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

    return response.output_text;
};

module.exports = {
    askAI
};




