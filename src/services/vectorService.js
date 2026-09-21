const { generateEmbedding } = require("./embeddingService");

const cosineSimilarity = (a, b) => {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        magnitudeA += a[i] * a[i];
        magnitudeB += b[i] * b[i];
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (
        Math.sqrt(magnitudeA) *
        Math.sqrt(magnitudeB)
    );
};

const findSimilarProducts = async (question, products) => {
    const questionEmbedding = await generateEmbedding(question);

    const results = [];

    for (const product of products) {
        const productText = `
            Product name: ${product.name}
            Description: ${product.description}
            Category: ${product.category}
            Price: ${product.price}
            Stock: ${product.stock}
        `;

        const productEmbedding = await generateEmbedding(productText);

        const similarity = cosineSimilarity(
            questionEmbedding,
            productEmbedding
        );

        results.push({
            product,
            similarity
        });
    }

    return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);
};

module.exports = {
    findSimilarProducts
};