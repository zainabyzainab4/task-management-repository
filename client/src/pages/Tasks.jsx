import { useEffect, useState } from "react";
import API from "../services/api";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (
      ["completed", "complete", "done"].includes(normalizedStatus)
    ) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (
      ["in progress", "in-progress", "processing"].includes(
        normalizedStatus
      )
    ) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    if (
      ["cancelled", "canceled", "failed"].includes(normalizedStatus)
    ) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getStatusDot = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (
      ["completed", "complete", "done"].includes(normalizedStatus)
    ) {
      return "bg-emerald-500";
    }

    if (
      ["in progress", "in-progress", "processing"].includes(
        normalizedStatus
      )
    ) {
      return "bg-blue-500";
    }

    if (
      ["cancelled", "canceled", "failed"].includes(normalizedStatus)
    ) {
      return "bg-red-500";
    }

    return "bg-amber-500";
  };

  const formatDate = (date) => {
    if (!date) return null;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statuses = [
    "All",
    ...new Set(
      tasks
        .map((task) => task.status)
        .filter(Boolean)
        .map((status) => status.toLowerCase())
    ),
  ];

  const filteredTasks = tasks.filter((task) => {
    const title = task.title || "";
    const description = task.description || "";
    const status = task.status || "";

    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter((task) =>
    ["completed", "complete", "done"].includes(
      task.status?.toLowerCase()
    )
  ).length;

  const inProgressTasks = tasks.filter((task) =>
    ["in progress", "in-progress", "processing"].includes(
      task.status?.toLowerCase()
    )
  ).length;

  const pendingTasks = tasks.filter((task) => {
    const status = task.status?.toLowerCase();

    return ![
      "completed",
      "complete",
      "done",
      "in progress",
      "in-progress",
      "processing",
      "cancelled",
      "canceled",
      "failed",
    ].includes(status);
  }).length;

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

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl bg-white shadow-sm"
              />
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
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-semibold text-red-800">
              Unable to load tasks
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
            Task Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View, search and track your tasks.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Tasks
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalTasks}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              All tasks
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {pendingTasks}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Waiting to be completed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {inProgressTasks}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Currently being worked on
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {completedTasks}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Finished tasks
            </p>
          </div>

        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">

            <input
              type="text"
              placeholder="Search tasks by title or description..."
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

        {/* Task List */}
        <div className="mt-6">

          {filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <span className="text-xl">✓</span>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No tasks found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {filteredTasks.map((task) => {
                const dueDate = formatDate(task.dueDate);

                return (
                  <div
                    key={task._id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-400">
                          Task
                        </p>

                        <h2 className="mt-1 truncate text-lg font-bold text-slate-900">
                          {task.title || "Untitled Task"}
                        </h2>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getStatusStyle(
                          task.status
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                            task.status
                          )}`}
                        />

                        {task.status || "Pending"}
                      </span>

                    </div>

                    <p className="mt-4 min-h-[48px] text-sm leading-6 text-slate-600">
                      {task.description || "No description provided."}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">

                      {task.priority && (
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium capitalize text-slate-600">
                          Priority: {task.priority}
                        </span>
                      )}

                      {dueDate && (
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                          Due: {dueDate}
                        </span>
                      )}

                      {!task.priority && !dueDate && (
                        <span className="text-xs text-slate-400">
                          Task ID: {task._id?.slice(-8)}
                        </span>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Tasks;