import { useEffect, useState } from "react";
import API from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get("/orders");

        console.log(
          "Orders API response:",
          JSON.stringify(response.data, null, 2)
        );

        setOrders(
          Array.isArray(response.data)
            ? response.data
            : response.data.orders || []
        );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="mt-4">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Orders</h1>

        <p className="mt-4 text-red-600">
          Error: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">
        Orders
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">
                  Order ID
                </th>

                <th className="text-left p-4">
                  Customer
                </th>

                <th className="text-left p-4">
                  Total
                </th>

                <th className="text-left p-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t"
                >
                  <td className="p-4">
                    {order._id}
                  </td>

                  <td className="p-4">
                    {order.user?.name || "N/A"}
                  </td>

                  <td className="p-4">
                    ${order.total || order.totalPrice || 0}
                  </td>

                  <td className="p-4">
                    {order.status || "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Orders;