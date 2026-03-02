// src/components/layout/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useSelector(
    (state) => state.auth
  );

  // 1️⃣ Wait auth to resolve
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // 2️⃣ Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Role not allowed
  if (roles && !roles.includes(user.role)) {
    // Optional: redirect to role home
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "TEACHER") return <Navigate to="/teacher" replace />;
    if (user.role === "STUDENT") return <Navigate to="/student" replace />;

    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
