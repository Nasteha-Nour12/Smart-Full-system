<<<<<<< HEAD
// src/pages/auth/Login.jsx
import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import coaLogo from "../../assets/coa-logo.svg";

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
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-5 flex flex-col items-center justify-center gap-2">
          <img src={coaLogo} alt="System logo" className="h-16 w-16 rounded-2xl shadow-lg shadow-black/30" />
          <p className="text-sm font-semibold tracking-[0.2em] text-cyan-100">SMART</p>
        </div>
        <h2 className="text-center text-2xl font-bold text-white">Login</h2>

        {loading && <Loader />}

        {error ? (
          <p className="mb-4 mt-4 rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            name="identifier"
            type="text"
            placeholder="Email"
            value={form.identifier}
            onChange={handleChange}
            className="border-white bg-white text-slate-900 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-100"
            required
          />

          <Input
            name="password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            className="border-white bg-white text-slate-900 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-100"
            required
          />

          <Button
            type="submit"
            className="w-full bg-white text-slate-900 hover:bg-slate-100"
            loading={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

      </div>
    </div>
  );
};

export default Login;
=======
// src/pages/auth/Login.jsx
import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import coaLogo from "../../assets/coa-logo.svg";

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
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-5 flex flex-col items-center justify-center gap-2">
          <img src={coaLogo} alt="System logo" className="h-16 w-16 rounded-2xl shadow-lg shadow-black/30" />
          <p className="text-sm font-semibold tracking-[0.2em] text-cyan-100">SMART</p>
        </div>
        <h2 className="text-center text-2xl font-bold text-white">Login</h2>

        {loading && <Loader />}

        {error ? (
          <p className="mb-4 mt-4 rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            name="identifier"
            type="text"
            placeholder="Email or phone number"
            value={form.identifier}
            onChange={handleChange}
            className="border-white bg-white text-slate-900 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-100"
            required
          />

          <Input
            name="password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            className="border-white bg-white text-slate-900 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-100"
            required
          />

          <Button
            type="submit"
            className="w-full bg-white text-slate-900 hover:bg-slate-100"
            loading={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

      </div>
    </div>
  );
};

export default Login;
>>>>>>> 9129225 (Start real project changes)
