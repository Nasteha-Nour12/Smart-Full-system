// src/pages/auth/Register.jsx
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";

const Register = () => {
  const { register, loading, error, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.password) return;

    await register({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });
  };

  /* ================= ROLE BASED REDIRECT ================= */
  if (isAuthenticated && user?.role) {
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "CEO":
        return <Navigate to="/ceo" replace />;
      case "ICT_OFFICER":
        return <Navigate to="/ict" replace />;
      case "JOB_SEEKER":
        return <Navigate to="/job-seeker" replace />;
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
          Create Account
        </h2>

        {loading && <Loader />}
        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <Input
            label="Email (Optional)"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="Phone (Optional)"
            name="phone"
            type="text"
            placeholder="Enter your phone"
            value={form.phone}
            onChange={handleChange}
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
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="text-sm text-center text-slate-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-slate-900 font-medium underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
