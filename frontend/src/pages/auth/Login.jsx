// src/pages/auth/Login.jsx
import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";

const Login = () => {
  const { login, loading, error, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier?.trim() || !form.password) return;
    await login({ identifier: form.identifier.trim(), password: form.password });
  };

  /* ================= ROLE BASED REDIRECT ================= */
  if (isAuthenticated && user?.role) {
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "CEO":
        return <Navigate to="/ceo" replace />;
      case "ICT_OFFICER":
        return <Navigate to="/ict" replace />; // ✅ sax
      case "CANDIDATE":
        return <Navigate to="/candidate" replace />;
      case "EMPLOYER":
        return <Navigate to="/employer" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-center text-slate-800 mb-6">
          Login
        </h2>

        {loading && <Loader />}

        {error && <p className="mb-4 text-sm text-red-600 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Enter Your ID"
            name="identifier"
            type="text"
            placeholder="Enter Your ID"
            value={form.identifier}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <Button type="submit" className="w-full" loading={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;