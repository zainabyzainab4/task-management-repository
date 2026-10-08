const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const Product = require("../models/Product");

const { generateEmbedding } = require("./embeddingService");
const { addProduct } = require("./chromaService");

const indexProducts = async () => {
    try {
        await connectDB();

        const products = await Product.find({
            isDeleted: false
        }).lean();

        console.log(`Found ${products.length} products.`);

        for (const product of products) {
            const productText = `
Product name: ${product.name}
Description: ${product.description}
Category: ${product.category}
Price: ${product.price}
Stock: ${product.stock}
            `;

            console.log(`Creating embedding for: ${product.name}`);

            const embedding = await generateEmbedding(productText);

            await addProduct(product, embedding);

            console.log(`Indexed: ${product.name}`);
        }

        console.log("All products indexed successfully.");

        process.exit(0);
    } catch (error) {
        console.error("Product indexing error:", error);

        process.exit(1);
    }
};

indexProducts();