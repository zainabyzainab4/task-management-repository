const { ChromaClient } = require("chromadb");

const client = new ChromaClient({
    host: "localhost",
    port: 8000
});

const COLLECTION_NAME = "products";

const getProductCollection = async () => {
    const collection = await client.getOrCreateCollection({
        name: COLLECTION_NAME,
        configuration: {
            hnsw: {
                space: "cosine"
            }
        }
    });

    return collection;
};

const addProduct = async (product, embedding) => {
    const collection = await getProductCollection();

    await collection.upsert({
        ids: [product._id.toString()],
        embeddings: [embedding],
        documents: [
            `${product.name}. ${product.description}. Category: ${product.category}. Price: ${product.price}. Stock: ${product.stock}.`
        ],
        metadatas: [
            {
                productId: product._id.toString(),
                name: product.name,
                category: product.category,
                price: product.price,
                stock: product.stock
            }
        ]
    });
};

const searchProducts = async (embedding, limit = 5) => {
    const collection = await getProductCollection();

    const results = await collection.query({
        queryEmbeddings: [embedding],
        nResults: limit,
        include: [
            "documents",
            "metadatas",
            "distances"
        ]
    });

    return results;
};

const getProductCount = async () => {
    const collection = await getProductCollection();

    return await collection.count();
};

module.exports = {
    getProductCollection,
    addProduct,
    searchProducts,
    getProductCount
};