import { useEffect, useState } from "react";
import API from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get("/orders");

        console.log(
          "Orders API response:",
          JSON.stringify(response.data, null, 2)
        );

        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Orders API error:", error);

        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatOrderId = (id) => {
    if (!id) return "N/A";
    return `#${id.slice(-8).toUpperCase()}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (
      ["delivered", "confirmed", "paid", "completed"].includes(
        normalizedStatus
      )
    ) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (
      ["cancelled", "canceled", "failed"].includes(normalizedStatus)
    ) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (
      ["shipped", "processing"].includes(normalizedStatus)
    ) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getStatusDot = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (
      ["delivered", "confirmed", "paid", "completed"].includes(
        normalizedStatus
      )
    ) {
      return "bg-emerald-500";
    }

    if (
      ["cancelled", "canceled", "failed"].includes(normalizedStatus)
    ) {
      return "bg-red-500";
    }

    if (
      ["shipped", "processing"].includes(normalizedStatus)
    ) {
      return "bg-blue-500";
    }

    return "bg-amber-500";
  };

  const statuses = [
    "All",
    ...new Set(
      orders
        .map((order) => order.status)
        .filter(Boolean)
        .map((status) => status.toLowerCase())
    ),
  ];

  const filteredOrders = orders.filter((order) => {
    const customerName = order.customerName || "";
    const customerEmail = order.customerEmail || "";
    const orderId = order._id || "";
    const status = order.status || "";

    const matchesSearch =
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      orderId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status?.toLowerCase() === "pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      ["delivered", "completed"].includes(
        order.status?.toLowerCase()
      )
  ).length;

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="mt-8 h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-semibold text-red-800">
              Unable to load orders
            </h1>

            <p className="mt-2 text-sm text-red-600">
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

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Order Management
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage customer orders.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500">
              Total order value
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {formatCurrency(totalValue)}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalOrders}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              All orders
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {pendingOrders}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Awaiting processing
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Delivered
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {deliveredOrders}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Successfully completed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Order Value
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(totalValue)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Combined total
            </p>
          </div>

        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">

            <input
              type="text"
              placeholder="Search by customer, email or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All"
                    ? "All statuses"
                    : status.charAt(0).toUpperCase() +
                      status.slice(1)}
                </option>
              ))}
            </select>

          </div>
        </div>

        {/* Orders */}
        <div className="mt-6">

          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <span className="text-xl">📦</span>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No orders found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Order
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Customer
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Product
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Amount
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Date
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {filteredOrders.map((order) => {
                        const firstProduct = order.products?.[0];

                        const productName =
                          firstProduct?.product?.name || "N/A";

                        const quantity =
                          firstProduct?.quantity || 0;

                        return (
                          <tr
                            key={order._id}
                            className="transition hover:bg-slate-50"
                          >

                            <td className="px-6 py-5">
                              <span className="font-semibold text-slate-900">
                                {formatOrderId(order._id)}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <div>
                                <p className="font-medium text-slate-900">
                                  {order.customerName || "N/A"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {order.customerEmail || "N/A"}
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <p className="font-medium text-slate-800">
                                {productName}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Quantity: {quantity}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <span className="font-semibold text-slate-900">
                                {formatCurrency(order.totalAmount)}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getStatusStyle(
                                  order.status
                                )}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                    order.status
                                  )}`}
                                />

                                {order.status || "Pending"}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-500">
                              {formatDate(order.createdAt)}
                            </td>

                          </tr>
                        );
                      })}

                    </tbody>
                  </table>

                </div>
              </div>

              {/* Mobile Cards */}
              <div className="grid gap-4 lg:hidden">

                {filteredOrders.map((order) => {
                  const firstProduct = order.products?.[0];

                  const productName =
                    firstProduct?.product?.name || "N/A";

                  const quantity =
                    firstProduct?.quantity || 0;

                  return (
                    <div
                      key={order._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Order
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {formatOrderId(order._id)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                              order.status
                            )}`}
                          />

                          {order.status || "Pending"}
                        </span>

                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-4">

                        <p className="font-semibold text-slate-900">
                          {order.customerName || "N/A"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {order.customerEmail || "N/A"}
                        </p>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">

                        <div>
                          <p className="text-xs text-slate-400">
                            Product
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {productName}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Quantity
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Amount
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Orders;