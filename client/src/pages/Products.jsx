import { useEffect, useState } from "react";
import API from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get("/products");

        console.log(
          "Products API response:",
          JSON.stringify(response.data, null, 2)
        );

        setProducts(
          Array.isArray(response.data)
            ? response.data
            : response.data.products || []
        );
      } catch (error) {
        console.error("Products API error:", error);

        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="mt-4">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="mt-4 text-red-600">
          Error: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">
        Products
      </h1>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p>No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold">
                {product.name}
              </h2>

              <p className="text-gray-600 mt-2">
                {product.description}
              </p>

              <p className="font-semibold mt-4">
                Price: ${product.price}
              </p>

              <p className="text-gray-500 mt-1">
                Stock: {product.stock}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;