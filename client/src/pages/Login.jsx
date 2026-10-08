import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/users/login", {
        email: email.trim(),
        password,
      });

      console.log("Login successful:", response.data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-2xl lg:grid-cols-2">

          {/* Login Form */}
          <div className="order-2 p-6 sm:p-10 lg:order-1 lg:p-12">

            <div className="mx-auto max-w-md">

              {/* Mobile Logo */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
                  TM
                </div>

                <span className="text-lg font-semibold text-slate-900">
                  Task Manager
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-emerald-600">
                  Welcome Back
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Sign in to your account
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Enter your credentials to access the dashboard.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleLogin}
                className="mt-8 space-y-5"
              >

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-emerald-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

              </form>

              {/* Signup */}
              <p className="mt-8 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Create an account
                </Link>
              </p>

            </div>
          </div>

          {/* Right Side */}
          <div className="order-1 hidden bg-emerald-600 p-10 text-white lg:order-2 lg:flex lg:flex-col lg:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">
                  TM
                </div>

                <span className="text-lg font-semibold">
                  Task Manager
                </span>
              </div>

              <div className="mt-20">
                <p className="text-sm font-medium text-emerald-100">
                  ADMIN PORTAL
                </p>

                <h2 className="mt-3 text-4xl font-bold leading-tight">
                  Everything you need
                  <br />
                  in one place.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-6 text-emerald-50">
                  Manage users, tasks, products, orders and
                  conversations through your centralized
                  management portal.
                </p>
              </div>
            </div>

            <p className="text-sm text-emerald-100">
              Task Management Portal
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;