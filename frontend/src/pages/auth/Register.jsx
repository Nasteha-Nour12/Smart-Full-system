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
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-md">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Join Platform</p>
        <h2 className="mt-2 text-3xl font-black text-slate-900">Create Account</h2>
        <p className="mt-2 text-sm text-slate-600">Create the first admin account only (single-admin mode).</p>

        {loading && <Loader />}
        {error && (
          <p className="mb-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            placeholder="Digits only"
            value={form.phone}
            onChange={handleChange}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="At least 8 chars with letters and numbers"
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
