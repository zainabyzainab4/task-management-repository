import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    tasks: 0,
  });

  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResponse, productsResponse, ordersResponse, tasksResponse] =
          await Promise.all([
            API.get("/users"),
            API.get("/products"),
            API.get("/orders"),
            API.get("/tasks"),
          ]);

        const usersData = usersResponse.data;
        const productsData = productsResponse.data;
        const ordersData = ordersResponse.data;
        const tasksData = tasksResponse.data;

        setStats({
          users:
            usersData.pagination?.totalUsers ||
            usersData.users?.length ||
            0,

          products:
            productsData.pagination?.totalProducts ||
            productsData.products?.length ||
            (Array.isArray(productsData) ? productsData.length : 0),

          orders:
            ordersData.pagination?.totalOrders ||
            ordersData.orders?.length ||
            (Array.isArray(ordersData) ? ordersData.length : 0),

          tasks:
            tasksData.pagination?.totalTasks ||
            tasksData.tasks?.length ||
            (Array.isArray(tasksData) ? tasksData.length : 0),
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Admin Portal
        </h1>

        <button
          onClick={handleLogout}
          className="text-red-600 font-medium hover:text-red-800"
        >
          Logout
        </button>
      </header>

      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-white shadow-sm p-6">
          <nav className="space-y-4">

            <Link
              to="/dashboard"
              className="block font-medium hover:text-blue-600"
            >
              Dashboard
            </Link>

            <Link
              to="/users"
              className="block font-medium hover:text-blue-600"
            >
              Users
            </Link>

            <Link
              to="/products"
              className="block font-medium hover:text-blue-600"
            >
              Products
            </Link>

            <Link
              to="/orders"
              className="block font-medium hover:text-blue-600"
            >
              Orders
            </Link>

            <Link
              to="/tasks"
              className="block font-medium hover:text-blue-600"
            >
              Tasks
            </Link>

          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">

          <h2 className="text-3xl font-bold">
            Dashboard
          </h2>

          <p className="mt-2 text-gray-600">
            Welcome to the Admin Portal
          </p>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">

            {/* Users */}
            <Link
              to="/users"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg"
            >
              <h3 className="text-gray-500">
                Total Users
              </h3>

              <p className="text-3xl font-bold mt-2">
                {loading ? "..." : stats.users}
              </p>
            </Link>

            {/* Products */}
            <Link
              to="/products"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg"
            >
              <h3 className="text-gray-500">
                Total Products
              </h3>

              <p className="text-3xl font-bold mt-2">
                {loading ? "..." : stats.products}
              </p>
            </Link>

            {/* Orders */}
            <Link
              to="/orders"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg"
            >
              <h3 className="text-gray-500">
                Total Orders
              </h3>

              <p className="text-3xl font-bold mt-2">
                {loading ? "..." : stats.orders}
              </p>
            </Link>

            {/* Tasks */}
            <Link
              to="/tasks"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg"
            >
              <h3 className="text-gray-500">
                Total Tasks
              </h3>

              <p className="text-3xl font-bold mt-2">
                {loading ? "..." : stats.tasks}
              </p>
            </Link>

          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;