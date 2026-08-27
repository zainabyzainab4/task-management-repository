import { useEffect, useState } from "react";
import API from "../services/api";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await API.get("/tasks");

        console.log(
          "Tasks API response:",
          JSON.stringify(response.data, null, 2)
        );

        setTasks(
          Array.isArray(response.data)
            ? response.data
            : response.data.tasks || []
        );
      } catch (error) {
        console.error("Tasks API error:", error);

        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load tasks."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="mt-4">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Tasks</h1>

        <p className="mt-4 text-red-600">
          Error: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">
        Tasks
      </h1>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p>No tasks found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold">
                {task.title}
              </h2>

              <p className="text-gray-600 mt-2">
                {task.description}
              </p>

              <p className="mt-3">
                <span className="font-semibold">
                  Status:
                </span>{" "}
                {task.status || "Pending"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Tasks;