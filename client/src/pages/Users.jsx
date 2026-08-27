import { useEffect, useState } from "react";
import API from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get("/users");

        console.log(
          "Users API response:",
          JSON.stringify(response.data, null, 2)
        );

        setUsers(response.data.users);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="mt-4">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Users</h1>

        <p className="mt-4 text-red-600">
          Error: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">
        Users
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="border-b pb-3"
              >
                <p className="font-semibold">
                  {user.name}
                </p>

                <p className="text-gray-600">
                  {user.email}
                </p>

                <p className="text-sm text-gray-500">
                  Role: {user.role}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;