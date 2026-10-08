import { useEffect, useState } from "react";
import API from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get("/users");

        console.log(
          "Users API response:",
          JSON.stringify(response.data, null, 2)
        );

        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Users API error:", error);

        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getRoleStyle = (role) => {
    const normalizedRole = role?.toLowerCase();

    if (normalizedRole === "admin") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    if (normalizedRole === "manager") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  const roles = [
    "All",
    ...new Set(
      users
        .map((user) => user.role)
        .filter(Boolean)
        .map((role) => role.toLowerCase())
    ),
  ];

  const filteredUsers = users.filter((user) => {
    const name = user.name || "";
    const email = user.email || "";
    const role = user.role || "";

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "All" ||
      role.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;

  const adminUsers = users.filter(
    (user) => user.role?.toLowerCase() === "admin"
  ).length;

  const regularUsers = users.filter(
    (user) => user.role?.toLowerCase() !== "admin"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">

          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
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
              Unable to load users
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
        <div>
          <p className="text-sm font-medium text-emerald-600">
            User Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage registered users and their roles.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Users
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalUsers}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Registered accounts
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Administrators
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {adminUsers}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Admin accounts
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Regular Users
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {regularUsers}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Non-admin accounts
            </p>
          </div>

        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 md:flex-row">

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === "All"
                    ? "All roles"
                    : role.charAt(0).toUpperCase() +
                      role.slice(1)}
                </option>
              ))}
            </select>

          </div>

        </div>

        {/* Users */}
        <div className="mt-6">

          {filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <span className="text-xl">👤</span>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No users found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or role filter.
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
                          User
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Email
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Role
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          User ID
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {filteredUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="transition hover:bg-slate-50"
                        >

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                                {getInitials(user.name)}
                              </div>

                              <p className="font-semibold text-slate-900">
                                {user.name || "Unnamed User"}
                              </p>

                            </div>

                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {user.email || "N/A"}
                          </td>

                          <td className="px-6 py-5">

                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getRoleStyle(
                                user.role
                              )}`}
                            >
                              {user.role || "User"}
                            </span>

                          </td>

                          <td className="px-6 py-5 text-xs text-slate-400">
                            {user._id || "N/A"}
                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* Mobile Cards */}
              <div className="grid gap-4 lg:hidden">

                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          {getInitials(user.name)}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate font-semibold text-slate-900">
                            {user.name || "Unnamed User"}
                          </p>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {user.email || "N/A"}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getRoleStyle(
                          user.role
                        )}`}
                      >
                        {user.role || "User"}
                      </span>

                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-4">

                      <p className="text-xs text-slate-400">
                        User ID
                      </p>

                      <p className="mt-1 break-all text-xs text-slate-600">
                        {user._id || "N/A"}
                      </p>

                    </div>

                  </div>
                ))}

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Users;