const { generateEmbedding } = require("./embeddingService");
const { searchProducts } = require("./chromaService");
const Product = require("../models/Product");

const findSimilarProducts = async (question) => {
    try {
        // Create an embedding for the user's question
        const questionEmbedding = await generateEmbedding(question);

        // Search ChromaDB for the most similar products
        const results = await searchProducts(
            questionEmbedding,
            5
        );

        const productIds = results.metadatas?.[0]
            ?.map((metadata) => metadata.productId)
            .filter(Boolean) || [];

        if (productIds.length === 0) {
            return [];
        }

        // Fetch the actual products from MongoDB
        const products = await Product.find({
            _id: { $in: productIds },
            isDeleted: false
        }).lean();

        // Keep the same order as ChromaDB similarity results
        const productMap = new Map(
            products.map((product) => [
                product._id.toString(),
                product
            ])
        );

        return productIds
            .map((productId, index) => {
                const product = productMap.get(productId);

                if (!product) {
                    return null;
                }

                return {
                    product,
                    similarity: results.distances?.[0]?.[index] ?? null
                };
            })
            .filter(Boolean);

    } catch (error) {
        console.error(
            "Vector search error:",
            error.message
        );

        return [];
    }
};

module.exports = {
    findSimilarProducts
};