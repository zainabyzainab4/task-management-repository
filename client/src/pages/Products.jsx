import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get(
          "/products?page=1&limit=100"
        );

        console.log(
          "Products API response:",
          JSON.stringify(response.data, null, 2)
        );

        const productList = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];

        setProducts(productList);
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = product.name?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";
      const searchValue = search.toLowerCase();

      const matchesSearch =
        productName.includes(searchValue) ||
        description.includes(searchValue);

      const stock = Number(product.stock || 0);

      let matchesStock = true;

      if (stockFilter === "in-stock") {
        matchesStock = stock > 0;
      }

      if (stockFilter === "low-stock") {
        matchesStock = stock > 0 && stock <= 10;
      }

      if (stockFilter === "out-of-stock") {
        matchesStock = stock === 0;
      }

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  const lowStockCount = products.filter(
    (product) =>
      Number(product.stock || 0) > 0 &&
      Number(product.stock || 0) <= 10
  ).length;

  const outOfStockCount = products.filter(
    (product) => Number(product.stock || 0) === 0
  ).length;

  const getProductImage = (product) => {
    if (!Array.isArray(product.images)) {
      return null;
    }

    return (
      product.images.find(
        (image) =>
          typeof image === "string" &&
          image.startsWith(
            "https://zainab-task-managment-images.s3.us-east-1.amazonaws.com/"
          ) &&
          !image.includes("/undefined")
      ) || null
    );
  };

  const getStockStatus = (stock) => {
    const value = Number(stock || 0);

    if (value === 0) {
      return {
        label: "Out of stock",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    }

    if (value <= 10) {
      return {
        label: "Low stock",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    return {
      label: "In stock",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="h-52 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              !
            </div>

            <h1 className="mt-4 text-xl font-semibold text-slate-900">
              Unable to load products
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-indigo-600">
              Inventory Management
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Products
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Manage your products, monitor stock levels, and view product
              information.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Showing
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {filteredProducts.length} products
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Products
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {products.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                📦
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalStock}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                ✓
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Low Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {lowStockCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                !
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Out of Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {outOfStockCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                ×
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All stock</option>
              <option value="in-stock">In stock</option>
              <option value="low-stock">Low stock</option>
              <option value="out-of-stock">Out of stock</option>
            </select>
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
              📦
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              No products found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {search
                ? "Try changing your search or stock filter."
                : "There are currently no products available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

            {filteredProducts.map((product) => {
              const imageUrl = getProductImage(product);
              const stock = Number(product.stock || 0);
              const stockStatus = getStockStatus(stock);

              return (
                <div
                  key={product._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Product Image */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name || "Product"}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                        <span className="text-4xl">📦</span>
                        <span className="mt-2 text-sm">
                          No image available
                        </span>
                      </div>
                    )}

                    {/* Stock Badge */}
                    <div className="absolute right-3 top-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${stockStatus.className}`}
                      >
                        {stockStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="p-5">

                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-slate-900">
                          {product.name || "Unnamed Product"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                          Product ID:{" "}
                          {product._id
                            ? product._id.slice(-6)
                            : "N/A"}
                        </p>
                      </div>

                      <p className="shrink-0 text-lg font-bold text-indigo-600">
                        ${Number(product.price || 0).toFixed(2)}
                      </p>
                    </div>

                    <p className="mt-4 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                      {product.description ||
                        "No description available for this product."}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Stock
                        </p>

                        <p
                          className={`mt-1 text-sm font-semibold ${
                            stock === 0
                              ? "text-red-600"
                              : stock <= 10
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {stock} units
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Image
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-600">
                          {imageUrl ? "S3 stored" : "Not available"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;