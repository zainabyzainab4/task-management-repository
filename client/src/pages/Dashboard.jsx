import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import socket from "../socket";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    tasks: 0,
  });

  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    socket.disconnect();
    navigate("/login");
  };

  useEffect(() => {
    const handleSocketConnect = () => {
      console.log("Connected to Socket.IO:", socket.id);
    };

    socket.on("connect", handleSocketConnect);

    const fetchStats = async () => {
      try {
        const [
          usersResponse,
          productsResponse,
          ordersResponse,
          tasksResponse,
        ] = await Promise.all([
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
            (Array.isArray(productsData)
              ? productsData.length
              : 0),

          orders:
            ordersData.pagination?.totalOrders ||
            ordersData.orders?.length ||
            (Array.isArray(ordersData)
              ? ordersData.length
              : 0),

          tasks:
            tasksData.pagination?.totalTasks ||
            tasksData.tasks?.length ||
            (Array.isArray(tasksData)
              ? tasksData.length
              : 0),
        });
      } catch (error) {
        console.error(
          "Failed to fetch dashboard stats:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    return () => {
      socket.off("connect", handleSocketConnect);
    };
  }, []);

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },
    {
      name: "Users",
      path: "/users",
      icon: "♙",
    },
    {
      name: "Products",
      path: "/products",
      icon: "▣",
    },
    {
      name: "Orders",
      path: "/orders",
      icon: "◫",
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: "✓",
    },
    {
      name: "Chat",
      path: "/chat",
      icon: "◌",
    },
  ];

  const statCards = [
    {
      name: "Total Users",
      value: stats.users,
      path: "/users",
      label: "Registered users",
      icon: "♙",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
    },
    {
      name: "Total Products",
      value: stats.products,
      path: "/products",
      label: "Products in catalog",
      icon: "▣",
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
    },
    {
      name: "Total Orders",
      value: stats.orders,
      path: "/orders",
      label: "Orders received",
      icon: "◫",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
    },
    {
      name: "Total Tasks",
      value: stats.tasks,
      path: "/tasks",
      label: "Tasks created",
      icon: "✓",
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-white border-b border-slate-200">
        <div className="h-full flex items-center justify-between px-4 sm:px-6">

          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              T
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                Task Manager
              </h1>

              <p className="hidden sm:block text-xs text-slate-400">
                Admin Portal
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-700">
                Administrator
              </p>

              <p className="text-xs text-slate-400">
                Admin Account
              </p>
            </div>

            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              A
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">

        {/* Sidebar */}
        <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 flex-col">

          <div className="p-5">

            <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Main Menu
            </p>

            <nav className="space-y-1">

              {navigationItems.map((item) => {
                const isActive =
                  location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-base ${
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {item.name}
                  </Link>
                );
              })}

            </nav>
          </div>

          {/* Sidebar Bottom */}
          <div className="mt-auto p-5">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Task Manager
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Manage your users, products, orders and tasks from one place.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200">
          <div className="grid grid-cols-6">

            {navigationItems.map((item) => {
              const isActive =
                location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-2 text-xs ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-500"
                  }`}
                >
                  <span className="text-lg">
                    {item.icon}
                  </span>

                  <span className="mt-1">
                    {item.name}
                  </span>
                </Link>
              );
            })}

          </div>
        </div>

        {/* Main Content */}
        <main className="w-full md:ml-64 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">

          {/* Welcome Section */}
          <div className="mb-8">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Overview
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Welcome back, Admin
                </h2>

                <p className="mt-2 text-sm sm:text-base text-slate-500">
                  Here's an overview of your task management system.
                </p>
              </div>

              <Link
                to="/tasks"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                + Create Task
              </Link>

            </div>

          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

            {statCards.map((card) => (
              <Link
                key={card.name}
                to={card.path}
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.name}
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-800">
                      {loading ? (
                        <span className="inline-block w-12 h-8 bg-slate-200 rounded animate-pulse" />
                      ) : (
                        card.value
                      )}
                    </p>
                  </div>

                  <div
                    className={`w-11 h-11 rounded-xl ${card.iconBg} ${card.iconText} flex items-center justify-center text-xl font-bold`}
                  >
                    {card.icon}
                  </div>

                </div>

                <div className="mt-5 flex items-center justify-between">

                  <p className="text-xs text-slate-400">
                    {card.label}
                  </p>

                  <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition">
                    View →
                  </span>

                </div>

              </Link>
            ))}

          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">

            {/* Quick Actions */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">

              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-800">
                  Quick Actions
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Quickly access the main areas of your portal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Link
                  to="/products"
                  className="group p-4 rounded-xl border border-slate-200 hover:border-purple-200 hover:bg-purple-50 transition"
                >
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                      ▣
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 group-hover:text-purple-700">
                        Manage Products
                      </h4>

                      <p className="text-xs text-slate-400 mt-1">
                        View and manage your products
                      </p>
                    </div>

                  </div>
                </Link>

                <Link
                  to="/orders"
                  className="group p-4 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition"
                >
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      ◫
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">
                        View Orders
                      </h4>

                      <p className="text-xs text-slate-400 mt-1">
                        Check and manage orders
                      </p>
                    </div>

                  </div>
                </Link>

                <Link
                  to="/users"
                  className="group p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition"
                >
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      ♙
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">
                        Manage Users
                      </h4>

                      <p className="text-xs text-slate-400 mt-1">
                        View registered users
                      </p>
                    </div>

                  </div>
                </Link>

                <Link
                  to="/chat"
                  className="group p-4 rounded-xl border border-slate-200 hover:border-orange-200 hover:bg-orange-50 transition"
                >
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      ◌
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 group-hover:text-orange-700">
                        Open Chat
                      </h4>

                      <p className="text-xs text-slate-400 mt-1">
                        Communicate with users
                      </p>
                    </div>

                  </div>
                </Link>

              </div>

            </div>

            {/* System Overview */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">

              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-800">
                  System Overview
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Current portal sections
                </p>
              </div>

              <div className="space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Users
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {loading ? "..." : stats.users}
                  </span>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Products
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {loading ? "..." : stats.products}
                  </span>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Orders
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {loading ? "..." : stats.orders}
                  </span>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Tasks
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {loading ? "..." : stats.tasks}
                  </span>
                </div>

              </div>

              <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs font-medium text-blue-700">
                  Admin Portal
                </p>

                <p className="text-xs text-blue-600 mt-1 leading-5">
                  Use the sidebar or quick actions to navigate through the system.
                </p>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;